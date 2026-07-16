import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  formatRegistrationConfirmationHtml,
  formatRegistrationConfirmationText,
  type RegistrationFormData,
} from "@/lib/register-form";
import {
  getInterestedStudentById,
  getLatestInterestedStudentByEmail,
} from "@/lib/postgres";
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
    "admission.ashshajrah@gmail.com"
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; registrationId?: string };
    const email = body.email?.trim().toLowerCase() || "";
    const registrationId = body.registrationId?.trim() || "";

    if (!email && !registrationId) {
      return NextResponse.json(
        { error: "Email or registration ID is required." },
        { status: 400 }
      );
    }

    const registration = registrationId
      ? await getInterestedStudentById(registrationId)
      : await getLatestInterestedStudentByEmail(email);
    if (!registration) {
      return NextResponse.json(
        { error: "No registered user was found for the selected row." },
        { status: 404 }
      );
    }

    const rawToken = createParentInterviewRawToken();
    const tokenHash = hashParentInterviewToken(rawToken);

    await createParentInterviewForm({
      registrationId: registration.id,
      tokenHash,
      parentName: registration.parentName,
      parentEmail: registration.email.trim().toLowerCase(),
      childName: registration.childName,
      childAge: registration.childAge,
      interestedProgramme: registration.level,
    });

    await rotateParentInterviewToken({
      registrationId: registration.id,
      tokenHash,
    });

    const interviewUrl = buildParentInterviewUrl(rawToken);
    const submittedAt = new Date().toLocaleString("en-PK", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    });

    const formData: RegistrationFormData = {
      parentName: registration.parentName,
      whatsapp: registration.phone,
      email: registration.email,
      childName: registration.childName,
      childAge: registration.childAge,
      level: registration.level,
      cityCountry: registration.cityCountry,
      message: registration.message,
      website: "",
    };

    const emailText = formatRegistrationConfirmationText(
      formData,
      submittedAt,
      interviewUrl
    );
    const emailHtml = formatRegistrationConfirmationHtml(
      formData,
      submittedAt,
      interviewUrl
    );

    const smtpConfig = getSmtpConfig();
    let emailSent = false;
    let sendWarning: string | null = null;

    if (smtpConfig) {
      const fromEmail = process.env.SMTP_FROM || smtpConfig.auth.user;
      const transporter = nodemailer.createTransport(smtpConfig);

      await transporter.sendMail({
        from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
        to: registration.email.trim(),
        replyTo: getCoordinatorEmail(),
        subject: "Registration Confirmed - Ash-Shajrah Learning Hub",
        text: emailText,
        html: emailHtml,
      });
      emailSent = true;
    } else {
      sendWarning =
        "SMTP is not configured, so the email was not sent. The preview was still generated.";
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Parent interview link generated and email sent successfully."
        : "Parent interview link generated and preview shown.",
      sendWarning,
      emailSent,
      registrationId: registration.id,
      interviewUrl,
      emailText,
      emailHtml,
      registration: {
        parentName: registration.parentName,
        email: registration.email,
        childName: registration.childName,
        childAge: registration.childAge,
        level: registration.level,
      },
    });
  } catch (error) {
    console.error("Parent interview preview API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating the preview." },
      { status: 500 }
    );
  }
}
