import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  createPublicEventRegistrationInDb,
  listActivePaymentMethods,
} from "@/lib/public-events-db";

export const runtime = "nodejs";

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
    process.env.COORDINATOR_EMAIL ||
    process.env.REGISTRATION_TO_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    "admissions@ashshajrah.com"
  );
}

function getPublicEventsFromEmail(smtpUser?: string) {
  return process.env.PUBLIC_EVENTS_SMTP_FROM || smtpUser || "admissions@ashshajrah.com";
}

function formatEventDate(value: string) {
  if (!value) return "To be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(date);
}

function formatEventTime(value: string) {
  if (!value) return "To be announced";

  const rawValue = String(value).trim();
  const date = new Date(rawValue);
  if (Number.isNaN(date.getTime())) {
    const timeMatch = rawValue.match(/(\d{1,2}):(\d{2})/);
    return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : rawValue;
  }

  return new Intl.DateTimeFormat("en-PK", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  }).format(date);
}

function formatDateTime(value: string) {
  if (!value) return "To be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(date);
}

function formatAmount(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "0";
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numericValue)) return "0";
  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeWrapStyle(isUrl = false) {
  return isUrl
    ? "overflow-wrap:break-word;word-break:break-all;"
    : "overflow-wrap:break-word;word-break:break-word;";
}

function buildEmailCard(title: string, bodyHtml: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin-bottom:18px;background-color:#FFFFFF;border:1px solid #DDD6C8;border-top-right-radius: 18px;border-bottom-right-radius: 18px;"><tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="width:4px;background-color:#C79A3B;font-size:0;line-height:0;border-radius:0;"></td><td class="mobile-card-pad" style="padding:22px 22px 20px;"><p style="margin:0 0 14px;color:#0F4C3A;font-size:21px;line-height:26px;font-weight:700;text-transform:uppercase;">${escapeHtml(title)}</p>${bodyHtml}</td></tr></table></td></tr></table>`;
}

function buildDetailRows(rows: Array<{ label: string; value: string; isUrl?: boolean }>) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">${rows
    .map(
      ({ label, value, isUrl }) =>
        `<tr><td class="stack-column" valign="top" style="padding:7px 0;width:42%;color:#1F2A24;font-size:14px;line-height:21px;font-weight:700;">${escapeHtml(label)}</td><td class="stack-column" valign="top" style="padding:7px 0;color:#5B655F;font-size:14px;line-height:21px;${safeWrapStyle(isUrl)}">${escapeHtml(value)}</td></tr>`
    )
    .join("")}</table>`;
}

function buildEventEmailShell(input: {
  registrationNumber: string;
  eventTitle: string;
  participantName: string;
  amountDue: string;
  sectionsHtml: string;
}) {
  return `<!DOCTYPE html>
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
      .mobile-full-button { display: block !important; width: 100% !important; }
      .mobile-card-pad { padding: 18px !important; }
      .mobile-center { text-align: left !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F7F4EE;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F7F4EE;">
    <tr><td align="center" style="padding:24px 16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:100%;max-width:600px;">
        <tr><td class="mobile-padding" style="background-color:#0F4C3A;border-radius:24px 24px 0 0;padding:28px 28px 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td class="stack-column" valign="top" style="padding-right:12px;">
                <p style="margin:0;color:#C79A3B;font-size:14px;line-height:20px;font-weight:700;letter-spacing:0.08em;text-transform:none;">Ash-Shajrah Learning Hub</p>
                <p style="margin:10px 0 0;color:#FFFFFF;font-size:30px;line-height:36px;font-weight:700;${safeWrapStyle()}">${escapeHtml(input.registrationNumber)}</p>
                <p style="margin:12px 0 0;color:#DDE9E3;font-size:14px;line-height:22px;${safeWrapStyle()}">${escapeHtml(input.eventTitle)}</p>
              </td>
              <td class="stack-column mobile-center" valign="middle" align="right" style="width:190px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" class="mobile-full-button" style="border:1px solid rgba(255,255,255,0.22);background-color:#1E6B52;border-radius:999px;"><tr><td style="padding:12px 18px;color:#FFFFFF;font-size:14px;line-height:18px;font-weight:700;text-align:center;">Registration Confirmed</td></tr></table>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td class="mobile-padding" style="background-color:#FFFFFF;padding:28px 28px 10px;border-left:1px solid #DDD6C8;border-right:1px solid #DDD6C8;">
          <p style="margin:0 0 16px;color:#1F2A24;font-size:16px;line-height:24px;font-weight:700;">Dear ${escapeHtml(input.participantName)},</p>
          <p style="margin:0 0 12px;color:#5B655F;font-size:15px;line-height:24px;">Thank you for registering for an Ash-Shajrah public event.</p>
          <p style="margin:0 0 22px;color:#5B655F;font-size:15px;line-height:24px;">Kindly complete a payment of ${escapeHtml(input.amountDue)}, then send your payment details to the coordinator on WhatsApp to confirm your seat. Payment details are given below.</p>
          ${input.sectionsHtml}
          <p style="margin:20px 0 0;color:#1F2A24;font-size:15px;line-height:24px;">Warm regards,<br/><strong>Ash-Shajrah Learning Hub Admissions Team</strong></p>
        </td></tr>
        <tr><td class="mobile-padding" style="background-color:#0F4C3A;border-radius:0 0 24px 24px;padding:20px 28px;"><p style="margin:0;color:#F7F4EE;font-size:13px;line-height:20px;text-align:center;">Ash-Shajrah Learning Hub | Trusted knowledge, guided with care.</p></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildPaymentMethodsText(
  paymentMethods: Array<{
    name: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    bankName: string;
    branchCode: string;
    instructions: string;
  }>
) {
  if (paymentMethods.length === 0) {
    return [
      "Payment Details:",
      "Please contact the coordinator for payment instructions.",
    ].join("\n");
  }

  return [
    "Payment Details:",
    ...paymentMethods.flatMap((method, index) => [
      "",
      `${index + 1}. ${method.name}`,
      method.accountTitle ? `Account Title: ${method.accountTitle}` : "",
      method.accountNumber ? `Account Number: ${method.accountNumber}` : "",
      method.iban ? `IBAN: ${method.iban}` : "",
      method.bankName ? `Bank Name: ${method.bankName}` : "",
      method.branchCode ? `Branch Code: ${method.branchCode}` : "",
    ]).filter(Boolean),
  ].join("\n");
}

function buildPaymentMethodsHtml(
  paymentMethods: Array<{
    name: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    bankName: string;
    branchCode: string;
    instructions: string;
  }>
) {
  if (paymentMethods.length === 0) {
    return buildEmailCard(
      "Payment Details",
      '<p style="margin:0;color:#5B655F;font-size:14px;line-height:21px;">Please contact the coordinator for payment instructions.</p>'
    );
  }

  return buildEmailCard(
    "Payment Details",
    paymentMethods
      .map((method) =>
        buildDetailRows([
          { label: "Payment Method", value: method.name },
          { label: "Account Title", value: method.accountTitle || "-" },
          { label: "Account Number", value: method.accountNumber || "-" },
          { label: "IBAN", value: method.iban || "-" },
          { label: "Bank Name", value: method.bankName || "-" },
          { label: "Branch Code", value: method.branchCode || "-" },
        ])
      )
      .join('<div style="height:14px;line-height:14px;"></div>')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const registration = await createPublicEventRegistrationInDb({
      eventId: String(body.eventId ?? ""),
      participantName: String(body.participantName ?? "").trim(),
      email: String(body.email ?? "").trim(),
      whatsapp: String(body.whatsapp ?? "").trim(),
      notes: String(body.notes ?? "").trim(),
      studentName: body.studentName ? String(body.studentName).trim() : undefined,
      parentName: body.parentName ? String(body.parentName).trim() : undefined,
      schoolName: body.schoolName ? String(body.schoolName).trim() : undefined,
      classInput: body.classInput ? String(body.classInput).trim() : undefined,
      studentNames: Array.isArray(body.studentNames) ? body.studentNames.map((name: unknown) => String(name).trim()).filter((name: string) => name) : undefined,
    });

    const smtpConfig = getSmtpConfig();
    const paymentMethods = await listActivePaymentMethods().catch((error) => {
      console.error("Payment methods lookup failed:", error);
      return [];
    });
    let confirmationEmailSent = false;

    if (smtpConfig) {
      try {
        const publicEventsFromEmail = getPublicEventsFromEmail(smtpConfig.auth.user);
        const transporter = nodemailer.createTransport(smtpConfig);
        const eventStartDate = formatEventDate(registration.eventStartAt);
        const eventStartTime = formatEventTime(registration.eventStartAt);
        const eventEndTime = formatEventTime(registration.eventEndAt);
        const deadline = formatDateTime(registration.registrationDeadline);
        const formattedAmountDue = formatAmount(registration.amountDue);
        const paymentText = buildPaymentMethodsText(paymentMethods);
        const paymentHtml = buildPaymentMethodsHtml(paymentMethods);
        const emailSubject = `${registration.eventTitle} | Ash-Shajrah Learning Hub`;
        const eventEmailHtml = buildEventEmailShell({
          registrationNumber: registration.registrationNumber,
          eventTitle: registration.eventTitle,
          participantName: String(body.participantName ?? "").trim(),
          amountDue: formattedAmountDue,
          sectionsHtml:
            buildEmailCard(
              "Registration Summary",
              buildDetailRows([
                { label: "Event", value: registration.eventTitle },
                { label: "Participant Name", value: String(body.participantName ?? "").trim() },
                { label: "WhatsApp", value: String(body.whatsapp ?? "").trim() },
                { label: "Start Date", value: eventStartDate },
                { label: "Start Time", value: eventStartTime || "To be announced" },
                { label: "End Time", value: eventEndTime || "To be announced" },
                { label: "Registration Deadline", value: deadline },
                { label: "Amount Due", value: formattedAmountDue },
              ])
            ) +
            paymentHtml +
            buildEmailCard(
              "Coordinator Details",
              buildDetailRows([
                { label: "Name", value: "Shoaib Ul Din" },
                { label: "Email", value: "coordinator@ashshajrah.com" },
                { label: "WhatsApp", value: "+923473547036" },
              ])
            ) +
            buildEmailCard(
              "Next Step",
              `
                <p style="margin:0 0 12px;color:#1F2A24;font-size:15px;line-height:24px;font-weight:700;">Send your payment screenshot on WhatsApp</p>
                <p style="margin:0;color:#5B655F;font-size:15px;line-height:24px;">Share your payment screenshot with the coordinator to confirm your seat and secure your registration.</p>
              `
            ),
        });

        await transporter.sendMail({
          from: `"Ash-Shajrah Learning Hub" <${publicEventsFromEmail}>`,
          to: String(body.email ?? "").trim(),
          replyTo: getAdmissionsEmail(),
          subject: emailSubject,
          text: [
            emailSubject,
            "",
            `Dear ${String(body.participantName ?? "").trim()},`,
            "",
            "Thank you for registering for an Ash-Shajrah event.",
            `Kindly complete a payment of ${formattedAmountDue}, then send your payment details to the coordinator on WhatsApp to confirm your seat. Payment details are provided below.`,
            "",
            `Registration Number: ${registration.registrationNumber}`,
            `Event: ${registration.eventTitle}`,
            `Participant Name: ${String(body.participantName ?? "").trim()}`,
            `WhatsApp: ${String(body.whatsapp ?? "").trim()}`,
            `Event Timing:`,
            `- Start Date: ${eventStartDate}`,
            `- Start Time: ${eventStartTime || "To be announced"}`,
            `- End Time: ${eventEndTime || "To be announced"}`,
            `Registration Deadline: ${deadline}`,
            `Amount Due: ${formattedAmountDue}`,
            "",
            paymentText,
            "",
            "Coordinator Details:",
            "Name: Shoaib Ul Din",
            "Email: coordinator@ashshajrah.com",
            "WhatsApp: +923473547036",
            "",
            "Warm regards,",
            "Ash-Shajrah Learning Hub Admissions Team",
          ].join("\n"),
          html: eventEmailHtml,
        });
        confirmationEmailSent = true;
      } catch (emailError) {
        console.error("Public event registration confirmation email failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      registrationNumber: registration.registrationNumber,
      amountDue: registration.amountDue,
      eventTitle: registration.eventTitle,
      confirmationEmailSent,
    });
  } catch (error) {
    console.error("Public event registration error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit event registration right now.",
      },
      { status: 400 }
    );
  }
}
