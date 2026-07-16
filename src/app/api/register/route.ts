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
  insertInterestedStudent,
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
      level: body.level ?? "",
      cityCountry: body.cityCountry ?? "",
      message: body.message ?? "",
      preferredLanguage: preferredLanguage?.trim(),
    };

    const errors = validateRegistrationForm(formData);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const smtpConfig = getSmtpConfig();
    if (!smtpConfig) {
      console.error("SMTP environment variables are not configured.");
      return NextResponse.json(
        {
          error:
            "Something went wrong. Please try again or contact us on WhatsApp.",
        },
        { status: 503 }
      );
    }

    const fromEmail = process.env.SMTP_FROM || smtpConfig.auth.user;
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
      level: formData.level.trim(),
      cityCountry: formData.cityCountry.trim(),
      message: formData.message.trim(),
    });

    const rawToken = createParentInterviewRawToken();
    const tokenHash = hashParentInterviewToken(rawToken);

  // If a pending form already exists for this registration, rotate to the new token.
  const created = await createParentInterviewForm({
      registrationId,
      tokenHash,
      parentName: formData.parentName.trim(),
      parentEmail: formData.email.trim().toLowerCase(),
      childName: formData.childName.trim(),
      childAge: formData.childAge.trim(),
      interestedProgramme: formData.level.trim(),
    });

    if (created.registrationId === registrationId) {
      await rotateParentInterviewToken({
        registrationId,
        tokenHash,
      });
    }

    const interviewUrl = buildParentInterviewUrl(rawToken);

    try {
      await appendRegistrationToGoogleSheet({
        parentName: formData.parentName.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        childName: formData.childName.trim(),
        childAge: formData.childAge.trim(),
        level: formData.level.trim(),
        cityCountry: formData.cityCountry.trim(),
        message: formData.message.trim(),
        preferredLanguage: formData.preferredLanguage,
      });
    } catch (sheetError) {
      console.error("Google Sheets append failed:", sheetError);
    }

    const transporter = nodemailer.createTransport(smtpConfig);
    const coordinatorEmails = await getActiveCoordinatorEmails();
    const coordinatorRecipients =
      coordinatorEmails.length > 0
        ? coordinatorEmails
        : [getCoordinatorEmail()];

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

    await transporter.sendMail({
      from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
      to: coordinatorRecipients,
      replyTo: formData.email.trim(),
      subject: "New Student Registration - Ash-Shajrah Learning Hub",
      text: formatRegistrationCoordinatorText(formData, submittedAt),
      html: formatRegistrationCoordinatorHtml(formData, submittedAt),
    });

    return NextResponse.json({ success: true, message: SUCCESS_MESSAGE });
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
