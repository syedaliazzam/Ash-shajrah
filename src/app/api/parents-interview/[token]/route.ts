import { NextRequest, NextResponse } from "next/server";
import {
  getParentInterviewPublicMetaByTokenHash,
  submitParentInterviewByTokenHash,
} from "@/lib/parents-interview/db";
import {
  hashParentInterviewToken,
  validateParentInterviewResponses,
  type ParentInterviewResponsePayload,
} from "@/lib/parents-interview/validation";
import { getLmsParentsInterviewAdminUrl } from "@/lib/lms-url";
import nodemailer from "nodemailer";
import { markInterestedStudentInterviewSubmitted } from "@/lib/postgres";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ token: string }> };

const INVALID_LINK =
  "This Parents Interview Form link is invalid. Please check the link in your registration email or contact Ash-Shajrah Learning Hub.";
const GENERIC_ERROR =
  "Something went wrong while submitting the form. Please try again or contact us on WhatsApp.";

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

function getAdmissionsEmail() {
  return (
    process.env.CAREERS_EMAIL_TO ||
    process.env.CONTACT_TO_EMAIL ||
    process.env.REGISTRATION_TO_EMAIL ||
    "admissions@ashshajrah.com"
  );
}

function buildParentInterviewParentConfirmationText(input: {
  parentName: string;
  childName: string | null;
  interestedProgramme: string | null;
  submittedAt: string;
}) {
  return [
    "Parents Interview Form Received - Ash-Shajrah Learning Hub",
    "=".repeat(50),
    "",
    `Dear ${input.parentName},`,
    "",
    "Thank you for submitting the Parents Interview Form.",
    "We have received your response successfully.",
    "",
    `Submitted: ${input.submittedAt}`,
    `Child Name: ${input.childName || "-"}`,
    `Interested Programme: ${input.interestedProgramme || "-"}`,
    "",
    "Our admissions team will review the information and contact you if anything further is needed.",
    "",
    "Warm regards,",
    "Ash-Shajrah Learning Hub",
  ].join("\n");
}

function buildParentInterviewParentConfirmationHtml(input: {
  parentName: string;
  childName: string | null;
  interestedProgramme: string | null;
  submittedAt: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#faf7f0;padding:24px;border-radius:12px">
      <div style="background:linear-gradient(135deg,#0d3b2e,#1a5c45);padding:28px 24px;border-radius:12px 12px 0 0">
        <h2 style="color:#faf7f0;margin:0 0 8px">Parents Interview Form Received</h2>
        <p style="color:#e8d5a3;margin:0;font-size:14px">Ash-Shajrah Learning Hub</p>
      </div>
      <div style="background:#ffffff;padding:24px;border:1px solid #e8e4dc;border-top:0;border-radius:0 0 12px 12px">
        <p style="color:#0d3b2e;line-height:1.7;margin:0 0 16px">Dear ${escapeHtml(input.parentName)},</p>
        <p style="color:#0d3b2e;line-height:1.7;margin:0 0 16px">
          Thank you for submitting the Parents Interview Form. We have received your response successfully.
        </p>
        <div style="background:#faf7f0;border:1px solid #e8e4dc;border-radius:12px;padding:16px 18px;margin:20px 0">
          <p style="margin:0 0 8px;color:#5c4a32;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Submitted</p>
          <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(input.submittedAt)}</p>
          <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Child Name</p>
          <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(input.childName || "-")}</p>
          <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Interested Programme</p>
          <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(input.interestedProgramme || "-")}</p>
        </div>
        <p style="color:#0d3b2e;line-height:1.7;margin:0">
          Our admissions team will review the information and contact you if anything further is needed.
        </p>
        <p style="color:#0d3b2e;line-height:1.7;margin:20px 0 0">Warm regards,<br/>Ash-Shajrah Learning Hub</p>
      </div>
    </div>
  `;
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapPdfLines(lines: string[], maxChars = 92): string[] {
  const wrapped: string[] = [];
  for (const line of lines) {
    if (!line) {
      wrapped.push("");
      continue;
    }
    let remaining = line;
    while (remaining.length > maxChars) {
      let breakIndex = remaining.lastIndexOf(" ", maxChars);
      if (breakIndex < 20) breakIndex = maxChars;
      wrapped.push(remaining.slice(0, breakIndex).trim());
      remaining = remaining.slice(breakIndex).trimStart();
    }
    wrapped.push(remaining);
  }
  return wrapped;
}

function buildInterviewSummaryLines(input: {
  parentName: string;
  parentEmail: string;
  childName: string | null;
  childAge: string | null;
  interestedProgramme: string | null;
  submittedAt: string;
  responses: ParentInterviewResponsePayload;
}): string[] {
  const lines: string[] = [
    "Parents Interview Form Submitted",
    "",
    `Submitted At: ${input.submittedAt}`,
    `Parent Name: ${input.parentName}`,
    `Parent Email: ${input.parentEmail}`,
    `Child Name: ${input.childName || "-"}`,
    `Child Age / DOB: ${input.childAge || "-"}`,
    `Interested Programme: ${input.interestedProgramme || "-"}`,
    "",
    "Responses:",
  ];

  for (const [questionId, answer] of Object.entries(input.responses.answers)) {
    const question = input.responses.questions[questionId];
    const label = question ? `${question.number}. ${question.label}` : questionId;
    lines.push(`- ${label}`);

    if (typeof answer === "string") {
      lines.push(`  Answer: ${answer}`);
      continue;
    }

    for (const [key, value] of Object.entries(answer)) {
      lines.push(`  ${key}: ${typeof value === "boolean" ? String(value) : value || "-"}`);
    }
  }

  return lines;
}

function buildPdfBuffer(lines: string[]): Buffer {
  const wrapped = wrapPdfLines(lines);
  const pages: string[][] = [];
  const linesPerPage = 34;
  for (let i = 0; i < wrapped.length; i += linesPerPage) {
    pages.push(wrapped.slice(i, i + linesPerPage));
  }

  const fontObjNum = 3 + pages.length * 2;
  const contentObjNums = pages.map((_, i) => 4 + i * 2);
  const pageObjNums = pages.map((_, i) => 3 + i * 2);

  const contentStreams = pages.map((pageLines) => {
    const commands: string[] = [
      "BT",
      "/F1 12 Tf",
      "14 TL",
      "50 760 Td",
    ];
    pageLines.forEach((line, index) => {
      if (index > 0) commands.push("T*");
      commands.push(`(${escapePdfText(line)}) Tj`);
    });
    commands.push("ET");
    return commands.join("\n");
  });

  const objects: Record<number, string> = {
    1: "<< /Type /Catalog /Pages 2 0 R >>",
    2: `<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    [fontObjNum]: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  };

  pages.forEach((pageLines, index) => {
    const pageObjNum = pageObjNums[index];
    const contentObjNum = contentObjNums[index];
    objects[pageObjNum] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>`;
    objects[contentObjNum] =
      `<< /Length ${contentStreams[index].length} >>\nstream\n${contentStreams[index]}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  const objectCount = fontObjNum;
  for (let i = 1; i <= objectCount; i++) {
    offsets.push(pdf.length);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objectCount + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    if (!token || token.length < 32) {
      return NextResponse.json(
        { success: false, error: INVALID_LINK },
        { status: 404 }
      );
    }

    const tokenHash = hashParentInterviewToken(token);
    const form = await getParentInterviewPublicMetaByTokenHash(tokenHash);
    if (!form) {
      return NextResponse.json(
        { success: false, error: INVALID_LINK },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, form });
  } catch (error) {
    console.error("Parents interview GET error:", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    if (!token || token.length < 32) {
      return NextResponse.json(
        { success: false, error: INVALID_LINK },
        { status: 404 }
      );
    }

    const tokenHash = hashParentInterviewToken(token);
    const existing = await getParentInterviewPublicMetaByTokenHash(tokenHash);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: INVALID_LINK },
        { status: 404 }
      );
    }

    if (existing.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "This form has already been submitted.",
        },
        { status: 409 }
      );
    }

    const body = (await request.json()) as { responses?: unknown };
    const validated = validateParentInterviewResponses(body.responses);
    if (!validated.ok) {
      return NextResponse.json(
        {
          success: false,
          error: validated.error,
          fieldErrors: validated.fieldErrors,
        },
        { status: 400 }
      );
    }

    const submitted = await submitParentInterviewByTokenHash({
      tokenHash,
      responses: validated.payload,
    });

    if (!submitted) {
      return NextResponse.json(
        {
          success: false,
          error: "This form has already been submitted.",
        },
        { status: 409 }
      );
    }

    await markInterestedStudentInterviewSubmitted({
      registrationId: submitted.registrationId,
    });

    const smtpConfig = getSmtpConfig();
    if (smtpConfig) {
      const adminUrl = getLmsParentsInterviewAdminUrl();
      const fromEmail = process.env.SMTP_FROM || smtpConfig.auth.user;
      const submittedAt = new Date(
        submitted.submittedAt || Date.now()
      ).toLocaleString("en-PK", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Karachi",
      });

      try {
        const transporter = nodemailer.createTransport(smtpConfig);
        const parentPdf = buildPdfBuffer(
          buildInterviewSummaryLines({
            parentName: submitted.parentName,
            parentEmail: submitted.parentEmail,
            childName: submitted.childName,
            childAge: submitted.childAge,
            interestedProgramme: submitted.interestedProgramme,
            submittedAt,
            responses: validated.payload,
          })
        );
        await transporter.sendMail({
          from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
          to: getAdmissionsEmail(),
          replyTo: submitted.parentEmail,
          subject:
            "Parents Interview Form Submitted - Ash-Shajrah Learning Hub",
          text: [
            "A Parents Interview Form has been submitted.",
            "",
            `Parent Name: ${submitted.parentName}`,
            `Parent Email: ${submitted.parentEmail}`,
            `Child Name: ${submitted.childName || "—"}`,
            `Child Date of Birth: ${submitted.childAge || "—"}`,
            `Interested Programme: ${submitted.interestedProgramme || "—"}`,
            `Submitted At: ${submittedAt}`,
            "",
            "View the complete form in the Ash-Shajrah LMS:",
            adminUrl,
          ].join("\n"),
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#faf7f0;padding:24px;border-radius:12px">
              <h2 style="color:#064635;margin:0 0 12px">Parents Interview Form Submitted</h2>
              <p style="color:#333;line-height:1.6">A Parents Interview Form has been submitted.</p>
              <ul style="color:#1a1a1a;line-height:1.8">
                <li><strong>Parent Name:</strong> ${escapeHtml(submitted.parentName)}</li>
                <li><strong>Parent Email:</strong> ${escapeHtml(submitted.parentEmail)}</li>
                <li><strong>Child Name:</strong> ${escapeHtml(submitted.childName || "—")}</li>
                <li><strong>Child Date of Birth:</strong> ${escapeHtml(submitted.childAge || "—")}</li>
                <li><strong>Interested Programme:</strong> ${escapeHtml(submitted.interestedProgramme || "—")}</li>
                <li><strong>Submitted At:</strong> ${escapeHtml(submittedAt)}</li>
              </ul>
              <p style="margin-top:18px">
                <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#0f5a43;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">
                  Open Ash-Shajrah LMS
                </a>
              </p>
            </div>
          `,
        });

        await transporter.sendMail({
          from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
          to: submitted.parentEmail,
          replyTo: getAdmissionsEmail(),
          subject:
            "Parents Interview Form Received - Ash-Shajrah Learning Hub",
          text: buildParentInterviewParentConfirmationText({
            parentName: submitted.parentName,
            childName: submitted.childName,
            interestedProgramme: submitted.interestedProgramme,
            submittedAt,
          }),
          html: buildParentInterviewParentConfirmationHtml({
            parentName: submitted.parentName,
            childName: submitted.childName,
            interestedProgramme: submitted.interestedProgramme,
            submittedAt,
          }),
          attachments: [
            {
              filename: "parents-interview-form.pdf",
              content: parentPdf,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (emailError) {
        console.error("Parents interview email send failed:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Parents interview POST error:", error);
    return NextResponse.json(
      { success: false, error: GENERIC_ERROR },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
