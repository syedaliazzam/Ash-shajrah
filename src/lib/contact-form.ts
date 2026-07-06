export type ContactFormData = {
  name: string;
  whatsapp: string;
  email: string;
  message: string;
  website?: string; // honeypot
  preferredLanguage?: string;
};

export type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(data: ContactFormData): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!data.name.trim()) errors.name = "Name is required.";

  if (!data.whatsapp.trim()) errors.whatsapp = "WhatsApp number is required.";

  if (!data.email.trim()) errors.email = "Email address is required.";
  else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

export function formatContactEmailText(data: ContactFormData, submittedAt: string): string {
  return [
    "New Inquiry — Ash-Shajrah Learning Hub",
    "═".repeat(48),
    "",
    `Submitted: ${submittedAt}`,
    "",
    "Name:",
    data.name.trim(),
    "",
    "WhatsApp Number:",
    data.whatsapp.trim(),
    "",
    "Email Address:",
    data.email.trim(),
    "",
    "Message:",
    data.message.trim() || "(Not provided)",
    "",
    "─".repeat(48),
    "Ash-Shajrah Learning Hub — Online Learning Platform",
  ].join("\n");
}

export function formatContactEmailHtml(data: ContactFormData, submittedAt: string): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;color:#5c4a32;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:38%;vertical-align:top;">${label}</td><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;color:#0d3b2e;font-size:15px;">${escapeHtml(value)}</td></tr>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#faf7f0;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8e4dc;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0d3b2e,#1a5c45);padding:28px 24px;">
      <h1 style="margin:0;color:#faf7f0;font-size:22px;font-weight:600;">New Inquiry</h1>
      <p style="margin:8px 0 0;color:#e8d5a3;font-size:14px;">Ash-Shajrah Learning Hub</p>
    </div>
    <div style="padding:8px 16px 20px;">
      <p style="color:#1a5c45;font-size:13px;margin:16px 0 8px;"><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Name", data.name.trim())}
        ${row("WhatsApp", data.whatsapp.trim())}
        ${row("Email", data.email.trim())}
        ${row("Message", data.message.trim() || "(Not provided)")}
      </table>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
