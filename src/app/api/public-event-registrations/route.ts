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
    return `
      <div style="margin-top:20px;padding:16px 18px;border:1px solid #e8e4dc;border-radius:12px;background:#faf7f0">
        <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7;font-weight:900;"><strong>Payment Details</strong></p>
        <p style="margin:10px 0 0;color:#0d3b2e;line-height:1.7">Please contact the coordinator for payment instructions.</p>
      </div>
    `;
  }

  return `
    <div style="margin-top:20px;padding:16px 18px;border:1px solid #e8e4dc;border-radius:12px;background:#faf7f0">
      <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7;font-weight:900;"><strong>Payment Details</strong></p>
      ${paymentMethods
        .map(
          (method) => `
            <div style="padding:14px 0;border-top:1px solid #e8e4dc">
              <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7;font-weight:900;"><strong>${escapeHtml(method.name)}</strong></p>
              ${method.accountTitle ? `<p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Account Title:</strong> ${escapeHtml(method.accountTitle)}</p>` : ""}
              ${method.accountNumber ? `<p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Account Number:</strong> ${escapeHtml(method.accountNumber)}</p>` : ""}
              ${method.iban ? `<p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>IBAN:</strong> ${escapeHtml(method.iban)}</p>` : ""}
              ${method.bankName ? `<p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Bank Name:</strong> ${escapeHtml(method.bankName)}</p>` : ""}
              ${method.branchCode ? `<p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Branch Code:</strong> ${escapeHtml(method.branchCode)}</p>` : ""}
            </div>
          `
        )
        .join("")}
    </div>
  `;
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
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#faf7f0;padding:24px;border-radius:12px">
              <div style="background:linear-gradient(135deg,#0d3b2e,#1a5c45);padding:28px 24px;border-radius:12px 12px 0 0">
                <p style="margin:10px 0 0;color:#e8d5a3;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;line-height:1.7">Registration Number</p>
                <h2 style="color:#faf7f0;margin:0;font-size:28px;line-height:1.25">${escapeHtml(registration.registrationNumber)}</h2>
                <p style="color:#e8d5a3;margin:10px 0 0;font-size:14px;font-weight:700">${escapeHtml(registration.eventTitle)}</p>
              </div>
              <div style="background:#ffffff;padding:24px;border:1px solid #e8e4dc;border-top:0;border-radius:0 0 12px 12px">
                <p style="color:#0d3b2e;line-height:1.7;margin:0 0 16px;font-size:15px">Dear ${escapeHtml(String(body.participantName ?? "").trim())},</p>
                <p style="color:#0d3b2e;line-height:1.7;margin:0 0 16px;font-size:15px">Thank you for registering for an Ash-Shajrah public event.</p>
                <p style="margin:0 0 16px;color:#0d3b2e;font-size:15px;font-weight:700;line-height:1.7">Kindly complete a payment of ${escapeHtml(formattedAmountDue)}, then send your payment details to the coordinator on WhatsApp to confirm your seat. Payment details are given below.</p>
                <div style="background:#faf7f0;border:1px solid #e8e4dc;border-radius:12px;padding:16px 18px;margin:20px 0">
                  <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7;font-weight:900;"><strong>Registration Details</strong></p>
                  <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Event:</strong> ${escapeHtml(registration.eventTitle)}</p>
                  <p style="margin:8px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Participant Name:</strong> ${escapeHtml(String(body.participantName ?? "").trim())}</p>
                  <p style="margin:8px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Start Date:</strong> ${escapeHtml(eventStartDate)}</p>
                  <p style="margin:8px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Start Time:</strong> ${escapeHtml(eventStartTime || "To be announced")}</p>
                  <p style="margin:8px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>End Time:</strong> ${escapeHtml(eventEndTime || "To be announced")}</p>
                  <p style="margin:8px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Amount Due:</strong> ${escapeHtml(formattedAmountDue)}</p>
                </div>
                ${paymentHtml}
                <div style="margin-top:20px;padding:16px 18px;border:1px solid #e8e4dc;border-radius:12px;background:#faf7f0">
                  <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7;font-weight:900;"><strong>Coordinator Details</strong></p>
                  <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Name:</strong> Shoaib Ul Din</p>
                  <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>Email:</strong> coordinator@ashshajrah.com</p>
                  <p style="margin:10px 0 0;color:#0d3b2e;font-size:14px;line-height:1.7"><strong>WhatsApp:</strong> +923473547036</p>
                </div>
                <p style="color:#0d3b2e;line-height:1.7;margin:20px 0 0">Warm regards,<br/><strong>Ash-Shajrah Learning Hub Admissions Team</strong></p>
              </div>
            </div>
          `,
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
