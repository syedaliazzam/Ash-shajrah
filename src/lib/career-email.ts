import type { CareerApplicationRow } from "@/lib/career-db";

export function formatCareerNotificationSubject(source: string): string {
  if (source === "LMS Careers Page") {
    return "New Career Resume Submission - LMS Portal";
  }
  return "New Career Resume Submission - Ash-Shajrah Learning Hub";
}

export function formatCareerNotificationText(
  application: CareerApplicationRow,
  adminPortalUrl: string
): string {
  return [
    "New career submission received.",
    "",
    `Name: ${application.fullName}`,
    `Email: ${application.email}`,
    `WhatsApp: ${application.whatsapp}`,
    `Interested Role: ${application.interestedRole}`,
    `Message: ${application.message || "—"}`,
    `Source: ${application.source}`,
    `Submitted At: ${new Date(application.submittedAt).toLocaleString("en-PK", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    })}`,
    "",
    `Resume: ${application.resumeFileName}`,
    "Please log in to the LMS Admin Portal to view/download the resume.",
    "",
    `Admin Portal: ${adminPortalUrl}`,
  ].join("\n");
}

export function formatCareerNotificationHtml(
  application: CareerApplicationRow,
  adminPortalUrl: string
): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 12px;font-weight:600;color:#064635;vertical-align:top">${label}</td><td style="padding:8px 12px;color:#1a1a1a">${value}</td></tr>`;

  const submittedAt = new Date(application.submittedAt).toLocaleString("en-PK", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  });

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#faf7f0;padding:24px;border-radius:12px">
      <h2 style="color:#064635;margin:0 0 8px">New career submission received</h2>
      <p style="color:#555;margin:0 0 16px">Ash-Shajrah Learning Hub careers desk</p>
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden">
        ${row("Name", escapeHtml(application.fullName))}
        ${row("Email", escapeHtml(application.email))}
        ${row("WhatsApp", escapeHtml(application.whatsapp))}
        ${row("Interested Role", escapeHtml(application.interestedRole))}
        ${row("Message", escapeHtml(application.message || "—").replace(/\n/g, "<br/>"))}
        ${row("Source", escapeHtml(application.source))}
        ${row("Submitted At", escapeHtml(submittedAt))}
        ${row("Resume", escapeHtml(application.resumeFileName))}
      </table>
      <p style="margin:16px 0 0;color:#333">
        Please log in to the LMS Admin Portal to view/download the resume.
      </p>
      <p style="margin:16px 0 0">
        <a href="${escapeHtml(adminPortalUrl)}" style="display:inline-block;background:#064635;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">
          Open Admin Portal
        </a>
      </p>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
