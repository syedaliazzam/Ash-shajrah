import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  validateRegistrationForm,
  formatRegistrationConfirmationText,
  formatRegistrationConfirmationHtml,
  formatRegistrationCoordinatorText,
  formatRegistrationCoordinatorHtml,
  type RegistrationFormData,
} from "@/lib/register-form";
import {
  getActiveCoordinatorEmails,
  hasInterestedStudentDuplicate,
  insertInterestedStudent,
  markInterestedStudentInterviewLinkSent,
} from "@/lib/postgres";
import { appendRegistrationToGoogleSheet } from "@/lib/google-sheets";
import {
  createParentInterviewForm,
  rotateParentInterviewToken,
} from "@/lib/parents-interview/db";
import {
  buildParentInterviewUrl,
  createParentInterviewRawToken,
  hashParentInterviewToken,
} from "@/lib/parents-interview/validation";

export const runtime = "nodejs";

const SUCCESS_MESSAGE =
  "Thank you! Your registration has been submitted successfully. Our admissions team will contact you soon.";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  if (host === "base" || host.includes("localhost")) {
    console.error("Invalid SMTP_HOST configured:", host);
    return null;
  }

  return {
    host,
    port: Number(port || 587),
    secure: Number(port) === 465,
    auth: { user, pass },
  };
}

function getCoordinatorEmail() {
  return (
    process.env.COORDINATOR_EMAIL ||
    process.env.REGISTRATION_TO_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    "admissions@ashshajrah.com"
  );
}

async function getCoordinatorRecipients(): Promise<string[]> {
  try {
    const coordinatorEmails = await getActiveCoordinatorEmails();
    if (coordinatorEmails.length > 0) {
      return coordinatorEmails;
    }
  } catch (error) {
    console.error("Coordinator email lookup failed:", error);
  }

  return [getCoordinatorEmail()];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegistrationFormData;

    if (body.website?.trim()) {
      return NextResponse.json({ success: true, message: SUCCESS_MESSAGE });
    }

    const preferredLanguage = (body as { preferredLanguage?: string })
      .preferredLanguage;

    const formData: RegistrationFormData = {
      parentName: body.parentName ?? "",
      whatsapp: body.whatsapp ?? "",
      email: body.email ?? "",
      childName: body.childName ?? "",
      childAge: body.childAge ?? "",
      childDob: (body as { childDob?: string }).childDob ?? "",
      level: body.level ?? "",
      cityCountry: body.cityCountry ?? "",
      message: body.message ?? "",
      preferredLanguage: preferredLanguage?.trim(),
    };
    const [city, country] = formData.cityCountry
      .split(",")
      .map((part) => part.trim());

    const errors = validateRegistrationForm(formData);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const duplicateExists = await hasInterestedStudentDuplicate({
      email: formData.email.trim().toLowerCase(),
      childName: formData.childName.trim(),
    });

    if (duplicateExists) {
      return NextResponse.json(
        {
          error: "This child is already registered with this parent email.",
          errors: {
            childName:
              "This child is already registered with this parent email.",
          },
        },
        { status: 409 }
      );
    }

    const submittedAt = new Date().toLocaleString("en-PK", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    });

    const registrationId = await insertInterestedStudent({
      parentName: formData.parentName.trim(),
      phone: formData.whatsapp.trim(),
      email: formData.email.trim(),
      childName: formData.childName.trim(),
      childAge: formData.childAge.trim(),
      childDob: (formData as { childDob?: string }).childDob?.trim() || formData.childAge.trim(),
      level: formData.level.trim(),
      city,
      country,
      message: formData.message.trim(),
    });

    const rawToken = createParentInterviewRawToken();
    const tokenHash = hashParentInterviewToken(rawToken);

    await createParentInterviewForm({
      registrationId,
      tokenHash,
      parentName: formData.parentName.trim(),
      parentEmail: formData.email.trim().toLowerCase(),
      childName: formData.childName.trim(),
      childAge: formData.childAge.trim(),
      interestedProgramme: formData.level.trim(),
    });

    await rotateParentInterviewToken({
      registrationId,
      tokenHash,
    });

    const interviewUrl = buildParentInterviewUrl(rawToken);
    await markInterestedStudentInterviewLinkSent({
      registrationId,
      interviewUrl,
    });

    try {
      await appendRegistrationToGoogleSheet({
        parentName: formData.parentName.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        childName: formData.childName.trim(),
        childAge: formData.childAge.trim(),
        level: formData.level.trim(),
        city,
        country,
        message: formData.message.trim(),
        preferredLanguage: formData.preferredLanguage,
      });
    } catch (sheetError) {
      console.error("Google Sheets append failed:", sheetError);
    }

    const smtpConfig = getSmtpConfig();
    const coordinatorRecipients = await getCoordinatorRecipients();
    let confirmationEmailSent = false;
    let coordinatorEmailSent = false;

    if (!smtpConfig) {
      console.error("SMTP environment variables are not configured.");
    } else {
      const fromEmail = process.env.SMTP_FROM || smtpConfig.auth.user;
      const transporter = nodemailer.createTransport(smtpConfig);

      try {
        await transporter.sendMail({
          from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
          to: formData.email.trim(),
          replyTo: coordinatorRecipients[0],
          subject: "Registration Confirmed - Ash-Shajrah Learning Hub",
          text: formatRegistrationConfirmationText(
            formData,
            submittedAt,
            interviewUrl
          ),
          html: formatRegistrationConfirmationHtml(
            formData,
            submittedAt,
            interviewUrl
          ),
        });
        confirmationEmailSent = true;
      } catch (error) {
        console.error("Registration confirmation email failed:", error);
      }

      try {
        await transporter.sendMail({
          from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
          to: coordinatorRecipients,
          replyTo: formData.email.trim(),
          subject: "New Student Registration - Ash-Shajrah Learning Hub",
          text: formatRegistrationCoordinatorText(formData, submittedAt),
          html: formatRegistrationCoordinatorHtml(formData, submittedAt),
        });
        coordinatorEmailSent = true;
      } catch (error) {
        console.error("Coordinator registration email failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGE,
      interviewUrl,
      confirmationEmailSent,
      coordinatorEmailSent,
    });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try again or contact us on WhatsApp.",
      },
      { status: 500 }
    );
  }
}
