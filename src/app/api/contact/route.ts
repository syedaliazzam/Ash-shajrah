import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  validateContactForm,
  formatContactEmailText,
  formatContactEmailHtml,
  type ContactFormData,
} from "@/lib/contact-form";
import {
  appendInquiryToGoogleSheet,
  isGoogleSheetsConfigured,
} from "@/lib/google-sheets";

const SUCCESS_MESSAGE = "Thank you! Your inquiry has been sent successfully.";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: Number(port || 587),
    secure: Number(port) === 465,
    auth: { user, pass },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactFormData;

    if (body.website?.trim()) {
      return NextResponse.json({ success: true, message: SUCCESS_MESSAGE });
    }

    const preferredLanguage = (body as { preferredLanguage?: string }).preferredLanguage;

    const formData: ContactFormData = {
      name: body.name ?? "",
      whatsapp: body.whatsapp ?? "",
      email: body.email ?? "",
      message: body.message ?? "",
    };

    const errors = validateContactForm(formData);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    if (!isGoogleSheetsConfigured()) {
      console.error("Google Sheets environment variables are not configured.");
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 503 }
      );
    }

    const smtpConfig = getSmtpConfig();
    if (!smtpConfig) {
      console.error("SMTP environment variables are not configured.");
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 503 }
      );
    }

    const inquiry = {
      name: formData.name.trim(),
      whatsapp: formData.whatsapp.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
      preferredLanguage: preferredLanguage?.trim()
    };

    try {
      await appendInquiryToGoogleSheet(inquiry);
    } catch (sheetError) {
      console.error("Google Sheets append failed:", sheetError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || "admission.ashshajrah@gmail.com";
    const fromEmail = process.env.SMTP_FROM || smtpConfig.auth.user;
    const submittedAt = new Date().toLocaleString("en-PK", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    });

    try {
      const transporter = nodemailer.createTransport(smtpConfig);

      await transporter.sendMail({
        from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
        to: toEmail,
        replyTo: inquiry.email,
        subject: "New Inquiry — Ash-Shajrah Learning Hub",
        text: formatContactEmailText(formData, submittedAt),
        html: formatContactEmailHtml(formData, submittedAt),
      });
    } catch (emailError) {
      console.error("Contact email send failed:", emailError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: SUCCESS_MESSAGE });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
