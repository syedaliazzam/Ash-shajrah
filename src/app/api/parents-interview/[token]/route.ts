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
  const safeWrapStyle = (isUrl = false) =>
    isUrl
      ? "overflow-wrap:break-word;word-break:break-all;"
      : "overflow-wrap:break-word;word-break:break-word;";
  const buildCard = (title: string, bodyHtml: string) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin-bottom:18px;background-color:#FFFFFF;border:1px solid #DDD6C8;border-radius:0 18px 18px 0;"><tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="width:4px;background-color:#C79A3B;font-size:0;line-height:0;border-radius:0;"></td><td class="mobile-card-pad" style="padding:22px 22px 20px;"><p style="margin:0 0 14px;color:#0F4C3A;font-size:21px;line-height:26px;font-weight:700;text-transform:uppercase;">${escapeHtml(title)}</p>${bodyHtml}</td></tr></table></td></tr></table>`;
  const buildRows = (rows: Array<{ label: string; value: string; isUrl?: boolean }>) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">${rows
      .map(
        ({ label, value, isUrl }) =>
          `<tr><td class="stack-column" valign="top" style="padding:7px 0;width:42%;color:#1F2A24;font-size:14px;line-height:21px;font-weight:700;">${escapeHtml(label)}</td><td class="stack-column" valign="top" style="padding:7px 0;color:#5B655F;font-size:14px;line-height:21px;${safeWrapStyle(isUrl)}">${escapeHtml(value)}</td></tr>`
      )
      .join("")}</table>`;
  return `
    <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body, table, td, p, a { font-family: Arial, Helvetica, sans-serif; }
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
          .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
          .mobile-card-pad { padding: 18px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#F7F4EE;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F7F4EE;">
        <tr><td align="center" style="padding:24px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:100%;max-width:600px;">
            <tr><td class="mobile-padding" style="background-color:#0F4C3A;border-radius:24px 24px 0 0;padding:28px 28px 24px;">
              <p style="margin:0;color:#C79A3B;font-size:14px;line-height:20px;font-weight:700;letter-spacing:0.08em;text-transform:none;">Ash-Shajrah Learning Hub</p>
              <p style="margin:10px 0 0;color:#FFFFFF;font-size:30px;line-height:36px;font-weight:700;">Parents Interview Received</p>
            </td></tr>
            <tr><td class="mobile-padding" style="background-color:#FFFFFF;padding:28px 28px 10px;border-left:1px solid #DDD6C8;border-right:1px solid #DDD6C8;">
              <p style="margin:0 0 16px;color:#1F2A24;font-size:16px;line-height:24px;font-weight:700;">Dear ${escapeHtml(input.parentName)},</p>
              <p style="margin:0 0 16px;color:#5B655F;font-size:15px;line-height:24px;">Thank you for submitting the Parents Interview Form. We have received your response successfully.</p>
              ${buildCard(
                "Registration Summary",
                buildRows([
                  { label: "Submitted", value: input.submittedAt },
                  { label: "Child Name", value: input.childName || "-" },
                  { label: "Interested Programme", value: input.interestedProgramme || "-" },
                ])
              )}
              <p style="color:#5B655F;font-size:15px;line-height:24px;margin:0">Our admissions team will review the information and contact you if anything further is needed.</p>
              <p style="color:#1F2A24;font-size:15px;line-height:24px;margin:20px 0 0">Warm regards,<br/><strong>Ash-Shajrah Learning Hub</strong></p>
            </td></tr>
            <tr><td class="mobile-padding" style="background-color:#0F4C3A;border-radius:0 0 24px 24px;padding:20px 28px;"><p style="margin:0;color:#F7F4EE;font-size:13px;line-height:20px;text-align:center;">Ash-Shajrah Learning Hub | Trusted knowledge, guided with care.</p></td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
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
      const adminUrl =
        "https://lms.ashshajrah.com/coordinator/parent-interview-forms";
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
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body style="margin:0;padding:0;background-color:#F7F4EE;font-family:Arial,Helvetica,sans-serif;">
              <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">A Parents Interview Form has been submitted and is ready for review.</div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F7F4EE;">
                <tr><td align="center" style="padding:24px 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">
                    <tr><td style="background-color:#0F4C3A;border-radius:24px 24px 0 0;padding:28px 28px 24px;">
                      <p style="margin:0;color:#C79A3B;font-size:14px;line-height:20px;font-weight:700;letter-spacing:0.08em;">ASH-SHAJRAH LEARNING HUB</p>
                      <h1 style="margin:10px 0 0;color:#FFFFFF;font-size:30px;line-height:36px;font-weight:700;">Parents Interview Submitted</h1>
                      <p style="margin:12px 0 0;color:#DDE9E3;font-size:14px;line-height:22px;">A new parent interview is ready for admissions review.</p>
                    </td></tr>
                    <tr><td style="background-color:#FFFFFF;border-left:1px solid #DDD6C8;border-right:1px solid #DDD6C8;padding:28px 28px 10px;">
                      <p style="margin:0 0 22px;color:#5B655F;font-size:15px;line-height:24px;">A Parents Interview Form has been submitted. The response summary is below.</p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin-bottom:22px;background-color:#FFFFFF;border:1px solid #DDD6C8;border-radius:0 18px 18px 0;">
                        <tr><td style="width:4px;background-color:#C79A3B;font-size:0;line-height:0;border-radius:0;"></td><td style="padding:22px 22px 20px;">
                          <p style="margin:0 0 14px;color:#0F4C3A;font-size:21px;line-height:26px;font-weight:700;text-transform:uppercase;">Registration Summary</p>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
                            <tr><td valign="top" style="padding:7px 0;width:42%;color:#1F2A24;font-size:14px;line-height:21px;font-weight:700;">Parent Name</td><td valign="top" style="padding:7px 0;color:#5B655F;font-size:14px;line-height:21px;overflow-wrap:break-word;word-break:break-word;">${escapeHtml(submitted.parentName)}</td></tr>
                            <tr><td valign="top" style="padding:7px 0;width:42%;color:#1F2A24;font-size:14px;line-height:21px;font-weight:700;">Parent Email</td><td valign="top" style="padding:7px 0;color:#5B655F;font-size:14px;line-height:21px;overflow-wrap:break-word;word-break:break-all;">${escapeHtml(submitted.parentEmail)}</td></tr>
                            <tr><td valign="top" style="padding:7px 0;width:42%;color:#1F2A24;font-size:14px;line-height:21px;font-weight:700;">Child Name</td><td valign="top" style="padding:7px 0;color:#5B655F;font-size:14px;line-height:21px;overflow-wrap:break-word;word-break:break-word;">${escapeHtml(submitted.childName || "-")}</td></tr>
                            <tr><td valign="top" style="padding:7px 0;width:42%;color:#1F2A24;font-size:14px;line-height:21px;font-weight:700;">Child Date of Birth</td><td valign="top" style="padding:7px 0;color:#5B655F;font-size:14px;line-height:21px;overflow-wrap:break-word;word-break:break-word;">${escapeHtml(submitted.childAge || "-")}</td></tr>
                            <tr><td valign="top" style="padding:7px 0;width:42%;color:#1F2A24;font-size:14px;line-height:21px;font-weight:700;">Interested Programme</td><td valign="top" style="padding:7px 0;color:#5B655F;font-size:14px;line-height:21px;overflow-wrap:break-word;word-break:break-word;">${escapeHtml(submitted.interestedProgramme || "-")}</td></tr>
                            <tr><td valign="top" style="padding:7px 0;width:42%;color:#1F2A24;font-size:14px;line-height:21px;font-weight:700;">Submitted At</td><td valign="top" style="padding:7px 0;color:#5B655F;font-size:14px;line-height:21px;overflow-wrap:break-word;word-break:break-word;">${escapeHtml(submittedAt)}</td></tr>
                          </table>
                        </td></tr>
                      </table>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;"><tr><td align="center" style="background-color:#0F4C3A;border-radius:999px;"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:14px 24px;color:#FFFFFF;text-decoration:none;font-size:15px;line-height:20px;font-weight:700;">Open Ash-Shajrah LMS</a></td></tr></table>
                      <p style="margin:0 0 18px;color:#5B655F;font-size:12px;line-height:20px;overflow-wrap:break-word;word-break:break-all;">If the button does not work, open this link:<br/><a href="${escapeHtml(adminUrl)}" style="color:#1E6B52;text-decoration:underline;">${escapeHtml(adminUrl)}</a></p>
                    </td></tr>
                    <tr><td style="background-color:#0F4C3A;border-radius:0 0 24px 24px;padding:20px 28px;"><p style="margin:0;color:#F7F4EE;font-size:13px;line-height:20px;text-align:center;">Ash-Shajrah Learning Hub | Trusted knowledge, guided with care.</p></td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
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
