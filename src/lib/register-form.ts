export type RegistrationFormData = {
  parentName: string;
  whatsapp: string;
  email: string;
  childName: string;
  childAge: string;
  level: string;
  cityCountry: string;
  message: string;
  website?: string; // honeypot
};

export type RegistrationFormErrors = Partial<Record<keyof RegistrationFormData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PROGRAMME_LEVELS = [
  "Play Group",
  "Prep-I",
  "Prep-II",
  "Not Sure / Need Guidance",
] as const;

export function validateRegistrationForm(data: RegistrationFormData): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {};

  if (!data.parentName.trim()) errors.parentName = "Parent / Guardian name is required.";
  if (!data.whatsapp.trim()) errors.whatsapp = "WhatsApp number is required.";

  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.childName.trim()) errors.childName = "Child's name is required.";
  if (!data.childAge.trim()) errors.childAge = "Child's age is required.";
  if (!data.level.trim()) errors.level = "Please select an interested programme level.";
  if (!data.cityCountry.trim()) errors.cityCountry = "City / Country is required.";

  return errors;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatRegistrationEmailText(
  data: RegistrationFormData,
  submittedAt: string
): string {
  return [
    "New Registration — Ash-Shajrah Learning Hub",
    "═".repeat(50),
    "",
    `Submitted: ${submittedAt}`,
    "",
    "Parent / Guardian Name:",
    data.parentName.trim(),
    "",
    "WhatsApp Number:",
    data.whatsapp.trim(),
    "",
    "Email Address:",
    data.email.trim(),
    "",
    "Child Name:",
    data.childName.trim(),
    "",
    "Child Age:",
    data.childAge.trim(),
    "",
    "Interested Level:",
    data.level.trim(),
    "",
    "City / Country:",
    data.cityCountry.trim(),
    "",
    "Message:",
    data.message.trim() || "(Not provided)",
    "",
    "─".repeat(50),
    "Ash-Shajrah Learning Hub — Online Early Childhood Learning",
  ].join("\n");
}

export function formatRegistrationEmailHtml(
  data: RegistrationFormData,
  submittedAt: string
): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;color:#5c4a32;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:36%;vertical-align:top;">${label}</td><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;color:#0d3b2e;font-size:15px;">${escapeHtml(value)}</td></tr>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#faf7f0;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e8e4dc;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0d3b2e,#1a5c45);padding:32px 28px;">
      <h1 style="margin:0;color:#faf7f0;font-size:24px;font-weight:600;">New Registration</h1>
      <p style="margin:8px 0 0;color:#e8d5a3;font-size:14px;">Ash-Shajrah Learning Hub — Online Early Childhood Learning</p>
    </div>
    <div style="padding:8px 16px 24px;">
      <p style="color:#1a5c45;font-size:13px;margin:16px 0 8px;"><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Parent / Guardian Name", data.parentName.trim())}
        ${row("WhatsApp Number", data.whatsapp.trim())}
        ${row("Email Address", data.email.trim())}
        ${row("Child Name", data.childName.trim())}
        ${row("Child Age", data.childAge.trim())}
        ${row("Interested Level", data.level.trim())}
        ${row("City / Country", data.cityCountry.trim())}
        ${row("Message", data.message.trim() || "(Not provided)")}
      </table>
    </div>
    <div style="background:#faf7f0;padding:16px 28px;text-align:center;border-top:1px solid #e8e4dc;">
      <p style="margin:0;color:#1a5c45;font-size:12px;">Ash-Shajrah Learning Hub · Online Learning for Values, Creativity &amp; Confidence</p>
    </div>
  </div>
</body>
</html>`;
}

export function formatRegistrationConfirmationText(
  data: RegistrationFormData,
  submittedAt: string
): string {
  return [
    "Registration Confirmed - Ash-Shajrah Learning Hub",
    "=".repeat(50),
    "",
    `Dear ${data.parentName.trim()},`,
    "",
    "Thank you for registering with Ash-Shajrah Learning Hub.",
    "Your registration has been received successfully.",
    "Our team will contact you soon with the next steps.",
    "",
    `Submitted: ${submittedAt}`,
    "",
    "Summary:",
    `Child Name: ${data.childName.trim()}`,
    `Child Age: ${data.childAge.trim()}`,
    `Interested Level: ${data.level.trim()}`,
    `City / Country: ${data.cityCountry.trim()}`,
    "",
    "If you need to update any information, please reply to this email.",
    "",
    "Warm regards,",
    "Ash-Shajrah Learning Hub",
  ].join("\n");
}

export function formatRegistrationConfirmationHtml(
  data: RegistrationFormData,
  submittedAt: string
): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#faf7f0;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e8e4dc;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0d3b2e,#1a5c45);padding:32px 28px;">
      <h1 style="margin:0;color:#faf7f0;font-size:24px;font-weight:600;">Registration Confirmed</h1>
      <p style="margin:8px 0 0;color:#e8d5a3;font-size:14px;">Ash-Shajrah Learning Hub</p>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 16px;color:#0d3b2e;font-size:16px;line-height:1.6;">
        Dear ${escapeHtml(data.parentName.trim())},
      </p>
      <p style="margin:0 0 16px;color:#0d3b2e;font-size:15px;line-height:1.7;">
        Thank you for registering with Ash-Shajrah Learning Hub. Your registration has been received successfully.
        Our team will contact you soon with the next steps.
      </p>
      <div style="background:#faf7f0;border:1px solid #e8e4dc;border-radius:12px;padding:16px 18px;margin:20px 0;">
        <p style="margin:0 0 8px;color:#5c4a32;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Submitted</p>
        <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(submittedAt)}</p>
        <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Child</p>
        <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(data.childName.trim())}</p>
        <p style="margin:16px 0 8px;color:#5c4a32;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Programme</p>
        <p style="margin:0;color:#0d3b2e;font-size:14px;">${escapeHtml(data.level.trim())}</p>
      </div>
      <p style="margin:0;color:#0d3b2e;font-size:15px;line-height:1.7;">
        If you need to update any information, please reply to this email.
      </p>
      <p style="margin:20px 0 0;color:#0d3b2e;font-size:15px;line-height:1.7;">Warm regards,<br/>Ash-Shajrah Learning Hub</p>
    </div>
  </div>
</body>
</html>`;
}

export function formatRegistrationCoordinatorText(
  data: RegistrationFormData,
  submittedAt: string
): string {
  return [
    "New Student Registration - Ash-Shajrah Learning Hub",
    "=".repeat(50),
    "",
    `Submitted: ${submittedAt}`,
    "",
    `Parent / Guardian Name: ${data.parentName.trim()}`,
    `WhatsApp Number: ${data.whatsapp.trim()}`,
    `Email Address: ${data.email.trim()}`,
    `Child Name: ${data.childName.trim()}`,
    `Child Age: ${data.childAge.trim()}`,
    `Interested Level: ${data.level.trim()}`,
    `City / Country: ${data.cityCountry.trim()}`,
    `Message: ${data.message.trim() || "(Not provided)"}`,
  ].join("\n");
}

export function formatRegistrationCoordinatorHtml(
  data: RegistrationFormData,
  submittedAt: string
): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;color:#5c4a32;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;width:36%;vertical-align:top;">${label}</td><td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;color:#0d3b2e;font-size:15px;">${escapeHtml(value)}</td></tr>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#faf7f0;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e8e4dc;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#0d3b2e,#1a5c45);padding:32px 28px;">
      <h1 style="margin:0;color:#faf7f0;font-size:24px;font-weight:600;">New Student Registration</h1>
      <p style="margin:8px 0 0;color:#e8d5a3;font-size:14px;">Ash-Shajrah Learning Hub</p>
    </div>
    <div style="padding:8px 16px 24px;">
      <p style="color:#1a5c45;font-size:13px;margin:16px 0 8px;"><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
      <table style="width:100%;border-collapse:collapse;">
        ${row("Parent / Guardian Name", data.parentName.trim())}
        ${row("WhatsApp Number", data.whatsapp.trim())}
        ${row("Email Address", data.email.trim())}
        ${row("Child Name", data.childName.trim())}
        ${row("Child Age", data.childAge.trim())}
        ${row("Interested Level", data.level.trim())}
        ${row("City / Country", data.cityCountry.trim())}
        ${row("Message", data.message.trim() || "(Not provided)")}
      </table>
    </div>
  </div>
</body>
</html>`;
}
