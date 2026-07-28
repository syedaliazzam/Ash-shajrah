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
        <p style="margin:0;color:#0d3b2e;font-weight:800">Payment Details</p>
        <p style="margin:10px 0 0;color:#0d3b2e;line-height:1.7">Please contact the coordinator for payment instructions.</p>
      </div>
    `;
  }

  return `
    <div style="margin-top:20px;padding:16px 18px;border:1px solid #e8e4dc;border-radius:12px;background:#faf7f0">
      <p style="margin:0 0 12px;color:#0d3b2e;font-weight:800">Payment Details</p>
      ${paymentMethods
        .map(
          (method) => `
            <div style="padding:14px 0;border-top:1px solid #e8e4dc">
              <p style="margin:0 0 8px;color:#0d3b2e;font-weight:800">${escapeHtml(method.name)}</p>
              ${method.accountTitle ? `<p style="margin:4px 0;color:#0d3b2e"><strong>Account Title:</strong> ${escapeHtml(method.accountTitle)}</p>` : ""}
              ${method.accountNumber ? `<p style="margin:4px 0;color:#0d3b2e"><strong>Account Number:</strong> ${escapeHtml(method.accountNumber)}</p>` : ""}
              ${method.iban ? `<p style="margin:4px 0 0;color:#0d3b2e"><strong>IBAN:</strong> ${escapeHtml(method.iban)}</p>` : ""}
              ${method.bankName ? `<p style="margin:4px 0;color:#0d3b2e"><strong>Bank Name:</strong> ${escapeHtml(method.bankName)}</p>` : ""}
              ${method.branchCode ? `<p style="margin:4px 0;color:#0d3b2e"><strong>Branch Code:</strong> ${escapeHtml(method.branchCode)}</p>` : ""}
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
    });

    const smtpConfig = getSmtpConfig();
    const paymentMethods = await listActivePaymentMethods().catch((error) => {
      console.error("Payment methods lookup failed:", error);
      return [];
    });
    let confirmationEmailSent = false;

    if (smtpConfig) {
      try {
        const fromEmail = process.env.SMTP_FROM || smtpConfig.auth.user;
        const transporter = nodemailer.createTransport(smtpConfig);
        const eventStart = formatDateTime(registration.eventStartAt);
        const eventEnd = formatDateTime(registration.eventEndAt);
        const deadline = formatDateTime(registration.registrationDeadline);
        const paymentText = buildPaymentMethodsText(paymentMethods);
        const paymentHtml = buildPaymentMethodsHtml(paymentMethods);

        await transporter.sendMail({
          from: `"Ash-Shajrah Learning Hub" <${fromEmail}>`,
          to: String(body.email ?? "").trim(),
          replyTo: getAdmissionsEmail(),
          subject: "Public Event Registration Confirmed - Ash-Shajrah Learning Hub",
          text: [
            "Public Event Registration Confirmed - Ash-Shajrah Learning Hub",
            "",
            `Dear ${String(body.participantName ?? "").trim()},`,
            "",
            "Thank you for registering for an Ash-Shajrah public event.",
            "",
            `Registration Number: ${registration.registrationNumber}`,
            `Event: ${registration.eventTitle}`,
            `Participant Name: ${String(body.participantName ?? "").trim()}`,
            `WhatsApp: ${String(body.whatsapp ?? "").trim()}`,
            `Start: ${eventStart}`,
            `End: ${eventEnd}`,
            `Registration Deadline: ${deadline}`,
            `Amount Due: ${registration.amountDue}`,
            "",
            paymentText,
            "",
            "Coordinator Details:",
            "Name: Shoaib Ul Din",
            "Email: admissions@ashshajrah.com",
            "WhatsApp: +923473547036",
            "",
            "Warm regards,",
            "Ash-Shajrah Learning Hub",
          ].join("\n"),
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#faf7f0;padding:24px;border-radius:12px">
              <div style="background:linear-gradient(135deg,#0d3b2e,#1a5c45);padding:28px 24px;border-radius:12px 12px 0 0">
                <h2 style="color:#faf7f0;margin:0 0 8px">Public Event Registration Confirmed</h2>
                <p style="color:#e8d5a3;margin:0;font-size:14px">Ash-Shajrah Learning Hub (ALH)</p>
              </div>
              <div style="background:#ffffff;padding:24px;border:1px solid #e8e4dc;border-top:0;border-radius:0 0 12px 12px">
                <p style="color:#0d3b2e;line-height:1.7;margin:0 0 16px">Dear ${escapeHtml(String(body.participantName ?? "").trim())},</p>
                <p style="color:#0d3b2e;line-height:1.7;margin:0 0 16px">
                  Thank you for registering for an Ash-Shajrah public event.
                </p>
                <p style="margin:0 0 16px;color:#0d3b2e;font-size:15px;font-weight:700;line-height:1.7">
                  After payment, kindly share your payment screenshot with the coordinator on WhatsApp to confirm your seat.
                </p>
                <div style="background:#faf7f0;border:1px solid #e8e4dc;border-radius:12px;padding:16px 18px;margin:20px 0">
                  <p style="margin:0 0 8px;color:#5c4a32;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Registration Number</p>
                  <p style="margin:0;color:#0d3b2e;font-size:16px;font-weight:700">${escapeHtml(registration.registrationNumber)}</p>
                  <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Event</p>
                  <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(registration.eventTitle)}</p>
                  <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Participant Name</p>
                  <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(String(body.participantName ?? "").trim())}</p>
                  <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Start</p>
                  <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(eventStart)}</p>
                  <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">End</p>
                  <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(eventEnd)}</p>
                  <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Amount Due</p>
                  <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(registration.amountDue)}</p>
                </div>
                ${paymentHtml}
                <div style="margin-top:20px;padding:16px 18px;border:1px solid #e8e4dc;border-radius:12px;background:#faf7f0">
                  <p style="margin:0 0 8px;color:#5c4a32;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;">Coordinator Details</p>
                  <p style="margin:0;color:#0d3b2e;font-size:14px;"><strong>Name:</strong> Shoaib Ul Din</p>
                  <p style="margin:8px 0 0;color:#0d3b2e;font-size:14px;"><strong>Email:</strong> admissions@ashshajrah.com</p>
                  <p style="margin:8px 0 0;color:#0d3b2e;font-size:14px;"><strong>WhatsApp:</strong> +923473547036</p>
                </div>
                <p style="color:#0d3b2e;line-height:1.7;margin:20px 0 0">Warm regards,<br/>Ash-Shajrah Learning Hub</p>
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
