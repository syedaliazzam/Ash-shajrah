import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  sanitizeFileName,
  validateCareerForm,
  type CareerFormFields,
} from "@/lib/careers";
import { insertCareerApplication } from "@/lib/career-db";
import {
  formatCareerNotificationHtml,
  formatCareerNotificationSubject,
  formatCareerNotificationText,
} from "@/lib/career-email";

export const runtime = "nodejs";

const SUCCESS_MESSAGES = {
  en: "Thank you. Your resume has been submitted successfully. Our team will keep it on file for future opportunities.",
  ur: "شکریہ۔ آپ کا ریزیومے کامیابی سے جمع ہو گیا ہے۔ ہماری ٹیم اسے مستقبل کے مواقع کے لیے محفوظ رکھے گی۔",
} as const;

const ERROR_MESSAGES = {
  en: "Could not save your application. Please try again or contact us on WhatsApp.",
  ur: "آپ کی درخواست محفوظ نہیں ہو سکی۔ براہ کرم دوبارہ کوشش کریں یا واٹس ایپ پر رابطہ کریں۔",
} as const;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;
  if (host === "base" || host.includes("localhost")) return null;

  return {
    host,
    port: Number(port || 587),
    secure: Number(port) === 465,
    auth: { user, pass },
  };
}

function getCareersEmailTo() {
  return (
    process.env.CAREERS_EMAIL_TO ||
    process.env.CONTACT_TO_EMAIL ||
    "admission.ashshajrah@gmail.com"
  );
}

function getPreferredLanguage(value: FormDataEntryValue | null): "en" | "ur" {
  return value === "ur" ? "ur" : "en";
}

export async function POST(request: NextRequest) {
  let preferredLanguage: "en" | "ur" = "en";

  try {
    const formData = await request.formData();
    preferredLanguage = getPreferredLanguage(formData.get("preferredLanguage"));

    const fields: CareerFormFields = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      interestedRole: String(formData.get("interestedRole") ?? ""),
      message: String(formData.get("message") ?? ""),
      source: String(formData.get("source") ?? "Website Careers Page"),
      website: String(formData.get("website") ?? ""),
    };

    if (fields.website?.trim()) {
      return NextResponse.json({
        success: true,
        message: SUCCESS_MESSAGES[preferredLanguage],
      });
    }

    const resume = formData.get("resume");
    const resumeFile = resume instanceof File && resume.size > 0 ? resume : null;

    const errors = validateCareerForm(
      fields,
      resumeFile
        ? { name: resumeFile.name, type: resumeFile.type, size: resumeFile.size }
        : null
    );

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 400 }
      );
    }

    if (!resumeFile) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES[preferredLanguage],
          errors: { resume: "Resume file is required." },
        },
        { status: 400 }
      );
    }

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const mimeType =
      resumeFile.type ||
      (resumeFile.name.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : "application/octet-stream");

    const application = await insertCareerApplication({
      fullName: fields.fullName.trim(),
      email: fields.email.trim().toLowerCase(),
      whatsapp: fields.whatsapp.trim(),
      interestedRole: fields.interestedRole.trim(),
      message: fields.message?.trim() || null,
      resumeFileName: sanitizeFileName(resumeFile.name) || "resume.pdf",
      resumeMimeType: mimeType,
      resumeSizeBytes: resumeFile.size,
      resumeFileData: resumeBuffer,
      source: fields.source,
    });

    const smtpConfig = getSmtpConfig();
    if (smtpConfig) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://ashshajrah.com";
      const adminPortalUrl = `${siteUrl.replace(/\/$/, "")}/lms/admin/careers?id=${application.id}`;
      const fromEmail = process.env.SMTP_FROM || smtpConfig.auth.user;
      const transporter = nodemailer.createTransport(smtpConfig);

      try {
        await transporter.sendMail({
          from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
          to: getCareersEmailTo(),
          replyTo: application.email,
          subject: formatCareerNotificationSubject(application.source),
          text: formatCareerNotificationText(application, adminPortalUrl),
          html: formatCareerNotificationHtml(application, adminPortalUrl),
        });
      } catch (emailError) {
        console.error("Careers notification email failed:", emailError);
      }
    } else {
      console.error("SMTP not configured; career submission saved without email.");
    }

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES[preferredLanguage],
      id: application.id,
    });
  } catch (error) {
    console.error("Careers API error:", error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES[preferredLanguage] },
      { status: 500 }
    );
  }
}
