import {
  COUNTRY_LIST,
  COUNTRY_CITY_OPTIONS,
} from "@/lib/registration-options";

export type RegistrationFormData = {
  parentName: string;
  whatsapp: string;
  email: string;
  childName: string;
  childAge: string;
  childDob?: string;
  level: string;
  cityCountry: string;
  message: string;
  website?: string; // honeypot
  preferredLanguage?: string;
};

export type RegistrationFormErrors = Partial<Record<keyof RegistrationFormData, string>>;

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]{1,98}[A-Za-z.]$/;
const WHATSAPP_REGEX = /^\+\d{1,4}\s\d{6,14}$/;

export const PROGRAMME_LEVELS = [
  "Play Group",
  "Prep-I",
  "Prep-II",
  "Not Sure / Need Guidance",
] as const;

export const CHILD_AGE_OPTIONS = ["2", "3", "4", "5", "6", "7", "7+"] as const;
const CHILD_DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function getCitiesForCountry(country: string): readonly string[] | null {
  const record = COUNTRY_CITY_OPTIONS as Record<string, readonly string[]>;
  return record[country] ?? null;
}

export function validateRegistrationForm(data: RegistrationFormData): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {};
  const isUrdu = data.preferredLanguage === "ur";

  const messages = {
    parentRequired: isUrdu
      ? "والد / سرپرست کا نام ضروری ہے۔"
      : "Parent / Guardian name is required.",
    parentInvalid: isUrdu
      ? "براہ کرم والد / سرپرست کا درست نام درج کریں۔"
      : "Please enter a valid parent / guardian name.",
    whatsappRequired: isUrdu
      ? "واٹس ایپ نمبر ضروری ہے۔"
      : "WhatsApp number is required.",
    whatsappInvalid: isUrdu
      ? "براہ کرم کنٹری کوڈ منتخب کریں اور درست واٹس ایپ نمبر درج کریں۔"
      : "Select a country code and enter a valid WhatsApp number.",
    emailRequired: isUrdu
      ? "ای میل ایڈریس ضروری ہے۔"
      : "Email address is required.",
    emailInvalid: isUrdu
      ? "براہ کرم @gmail.com پر ختم ہونے والا درست جی میل ایڈریس درج کریں۔"
      : "Please enter a valid Gmail address ending in @gmail.com.",
    childRequired: isUrdu
      ? "بچے کا نام ضروری ہے۔"
      : "Child's name is required.",
    childInvalid: isUrdu
      ? "براہ کرم بچے کا درست نام درج کریں۔"
      : "Please enter a valid child name.",
    dobRequired: isUrdu
      ? "بچے کی تاریخ پیدائش ضروری ہے۔"
      : "Child's date of birth is required.",
    dobInvalid: isUrdu
      ? "براہ کرم درست تاریخ پیدائش منتخب کریں۔"
      : "Please select a valid date of birth.",
    levelRequired: isUrdu
      ? "براہ کرم مطلوبہ پروگرام کی سطح منتخب کریں۔"
      : "Please select an interested programme level.",
    cityRequired: isUrdu
      ? "شہر / ملک ضروری ہے۔"
      : "City / Country is required.",
    cityInvalid: isUrdu
      ? "براہ کرم درست شہر / ملک منتخب کریں۔"
      : "Please select a valid city / country.",
    messageRequired: isUrdu
      ? "پیغام ضروری ہے۔"
      : "Message is required.",
  };

  if (!data.parentName.trim()) {
    errors.parentName = messages.parentRequired;
  } else if (!NAME_REGEX.test(data.parentName.trim())) {
    errors.parentName = messages.parentInvalid;
  }

  if (!data.whatsapp.trim()) {
    errors.whatsapp = messages.whatsappRequired;
  } else if (!WHATSAPP_REGEX.test(data.whatsapp.trim())) {
    errors.whatsapp = messages.whatsappInvalid;
  }

  if (!data.email.trim()) {
    errors.email = messages.emailRequired;
  } else if (!GMAIL_REGEX.test(data.email.trim())) {
    errors.email = messages.emailInvalid;
  }

  if (!data.childName.trim()) {
    errors.childName = messages.childRequired;
  } else if (!NAME_REGEX.test(data.childName.trim())) {
    errors.childName = messages.childInvalid;
  }

  if (!data.childDob?.trim()) {
    errors.childDob = messages.dobRequired;
  } else if (!CHILD_DOB_REGEX.test(data.childDob.trim())) {
    errors.childDob = messages.dobInvalid;
  }

  if (!data.level.trim()) errors.level = messages.levelRequired;

  if (!data.cityCountry.trim()) {
    errors.cityCountry = messages.cityRequired;
  } else {
    const [city, country] = data.cityCountry.split(",").map((part) => part.trim());
    const countryExists = country ? COUNTRY_LIST.includes(country as (typeof COUNTRY_LIST)[number]) : false;
    if (!city || !country || !countryExists) {
      errors.cityCountry = messages.cityInvalid;
    }
  }

  if (!data.message.trim()) {
    errors.message = messages.messageRequired;
  }

  return errors;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeWrapStyle(isUrl = false): string {
  return isUrl
    ? "overflow-wrap:break-word;word-break:break-all;"
    : "overflow-wrap:break-word;word-break:break-word;";
}

function buildEmailShell(input: {
  preheader: string;
  headerEyebrow?: string;
  title: string;
  subtitle?: string;
  registrationNumber?: string;
  statusBadge?: string;
  introHtml: string;
  sectionsHtml: string;
  footerNote?: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    body, table, td, p, a { font-family: Arial, Helvetica, sans-serif; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
      .mobile-full-button { display: block !important; width: 100% !important; }
      .mobile-center { text-align: left !important; }
      .mobile-card-pad { padding: 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F7F4EE;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(input.preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background-color:#F7F4EE;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:100%;max-width:600px;">
          <tr>
            <td class="mobile-padding" style="background-color:#0F4C3A;border-radius:24px 24px 0 0;padding:28px 28px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td class="stack-column" valign="top" style="padding-right:12px;">
                    <p style="margin:0;color:#C79A3B;font-size:14px;line-height:20px;font-weight:700;letter-spacing:0.08em;text-transform:none;">Ash-Shajrah Learning Hub</p>
                    <p style="margin:10px 0 0;color:#DDE9E3;font-size:30px;line-height:36px;font-weight:700;${safeWrapStyle()}">${escapeHtml(input.registrationNumber || input.title)}</p>
                    ${input.subtitle ? `<p style="margin:12px 0 0;color:#DDE9E3;font-size:14px;line-height:22px;">${escapeHtml(input.subtitle)}</p>` : ""}
                  </td>
                  <td class="stack-column mobile-center" valign="middle" align="right" style="width:180px;">
                    ${input.statusBadge ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="right" class="mobile-full-button" style="border:1px solid rgba(255,255,255,0.22);background-color:#1E6B52;border-radius:999px;"><tr><td style="padding:12px 18px;color:#FFFFFF;font-size:14px;line-height:18px;font-weight:700;text-align:center;">${escapeHtml(input.statusBadge)}</td></tr></table>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="background-color:#FFFFFF;padding:28px 28px 10px;border-left:1px solid #DDD6C8;border-right:1px solid #DDD6C8;">
              ${input.introHtml}
              ${input.sectionsHtml}
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="background-color:#0F4C3A;border-radius:0 0 24px 24px;padding:20px 28px;">
              <p style="margin:0;color:#F7F4EE;font-size:13px;line-height:20px;text-align:center;">${escapeHtml(input.footerNote || "Ash-Shajrah Learning Hub | Trusted knowledge, guided with care.")}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildInfoCard(title: string, bodyHtml: string) {
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

function toPlainText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function formatDateOnly(value: unknown): string {
  const text = toPlainText(value).trim();
  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return text;
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Karachi",
  }).format(parsed);
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
    "Child Age / DOB:",
    data.childDob?.trim() || "(Not provided)",
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
  return buildEmailShell({
    preheader: "New student registration received.",
    headerEyebrow: "Registration Alert",
    title: "New Registration",
    subtitle: "Ash-Shajrah Learning Hub Online Early Childhood Learning",
    statusBadge: "New Submission",
    introHtml:
      '<p style="margin:0 0 20px;color:#1F2A24;font-size:15px;line-height:24px;">A new student registration has been submitted. The full details are listed below.</p>',
    sectionsHtml: buildInfoCard(
      "Registration Summary",
      buildDetailRows([
        { label: "Submitted", value: submittedAt },
        { label: "Parent / Guardian Name", value: data.parentName.trim() },
        { label: "WhatsApp Number", value: data.whatsapp.trim() },
        { label: "Email Address", value: data.email.trim() },
        { label: "Child Name", value: data.childName.trim() },
        { label: "Child Date of Birth", value: data.childDob?.trim() || "(Not provided)" },
        { label: "Interested Level", value: data.level.trim() },
        { label: "City / Country", value: data.cityCountry.trim() },
        { label: "Message", value: data.message.trim() || "(Not provided)" },
      ])
    ),
  });
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
        ${row("Child Date of Birth", data.childDob?.trim() || "(Not provided)")}
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
  submittedAt: string,
  interviewUrl?: string
): string {
  const childDob = formatDateOnly(data.childDob);
  const cityCountry = toPlainText(data.cityCountry).trim();

  const lines = [
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
    `Child Date of Birth: ${childDob || "(Not provided)"}`,
    `Interested Level: ${data.level.trim()}`,
    `Country: ${cityCountry ? cityCountry.split(",").pop()?.trim() || cityCountry : ""}`,
    `City: ${cityCountry.includes(",") ? cityCountry.split(",")[0].trim() : ""}`,
  ];

  if (interviewUrl) {
    lines.push(
      "",
      "Next Step: Complete the Parents Interview Form",
      "",
      "Every child develops and learns differently. To help our admission and academic team understand your child’s health, development, learning readiness, daily routine, behaviour, interests, and home environment, please complete the Parents Interview Form using the button below.",
      "",
      "This is not a test, and there are no right or wrong answers. The information will help us prepare a more caring, supportive, and age-appropriate learning experience for your child.",
      "",
      "Complete Parents Interview Form:",
      interviewUrl
    );
  }

  lines.push(
    "",
    "If you need to update any information, please reply to this email.",
    "",
    "Warm regards,",
    "Ash-Shajrah Learning Hub"
  );

  return lines.join("\n");
}

export function formatRegistrationConfirmationHtml(
  data: RegistrationFormData,
  submittedAt: string,
  interviewUrl?: string
): string {
  const childDob = formatDateOnly(data.childDob);
  const cityCountry = toPlainText(data.cityCountry).trim();
  const [city, country] = cityCountry.includes(",")
    ? cityCountry.split(",").map((part) => part.trim())
    : ["", cityCountry];

  const redesignedInterviewSection = interviewUrl
    ? buildInfoCard(
        "Next Step",
        `
        <p style="margin:0 0 12px;color:#1F2A24;font-size:15px;line-height:24px;font-weight:700;">Complete the Parents Interview Form</p>
        <p style="margin:0 0 12px;color:#5B655F;font-size:15px;line-height:24px;">
          Every child develops and learns differently. To help our admission and academic team understand your childâ€™s health, development, learning readiness, daily routine, behaviour, interests, and home environment, please complete the Parents Interview Form using the button below.
        </p>
        <p style="margin:0 0 18px;color:#5B655F;font-size:15px;line-height:24px;">
          This is not a test, and there are no right or wrong answers. The information will help us prepare a more caring, supportive, and age-appropriate learning experience for your child.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="mobile-full-button" style="margin-bottom:12px;">
          <tr>
            <td align="center" style="background-color:#0F4C3A;border-radius:999px;">
              <a href="${escapeHtml(interviewUrl)}" class="mobile-full-button" style="display:inline-block;padding:14px 24px;color:#FFFFFF;text-decoration:none;font-size:15px;line-height:20px;font-weight:700;">Complete Parents Interview Form</a>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#5B655F;font-size:12px;line-height:20px;${safeWrapStyle(true)}">
          If the button does not work, open this link:<br/>
          <a href="${escapeHtml(interviewUrl)}" style="color:#1E6B52;text-decoration:underline;">${escapeHtml(interviewUrl)}</a>
        </p>
      `
      )
    : "";

  return buildEmailShell({
    preheader: "Your Ash-Shajrah registration has been received successfully.",
    headerEyebrow: "Ash-Shajrah Learning Hub",
    title: "Registration Details",
    statusBadge: "Registration Confirmed",
    introHtml: `
      <p style="margin:0 0 16px;color:#1F2A24;font-size:16px;line-height:24px;font-weight:700;">
        Dear ${escapeHtml(data.parentName.trim())},
      </p>
      <p style="margin:0 0 22px;color:#5B655F;font-size:15px;line-height:24px;">
        Thank you for registering with Ash-Shajrah Learning Hub. Your registration has been received successfully.
        Our team will contact you soon with the next steps.
      </p>
    `,
    sectionsHtml:
      buildInfoCard(
        "Registration Summary",
        buildDetailRows([
          { label: "Submitted", value: submittedAt },
          { label: "Child Name", value: data.childName.trim() },
          { label: "Programme", value: data.level.trim() },
          { label: "Child Date of Birth", value: childDob || "(Not provided)" },
          { label: "Country", value: country || "(Not provided)" },
          { label: "City", value: city || "(Not provided)" },
        ])
      ) +
      redesignedInterviewSection +
      `<p style="margin:0;color:#5B655F;font-size:15px;line-height:24px;">
        If you need to update any information, please reply to this email.
      </p>
      <p style="margin:20px 0 0;color:#1F2A24;font-size:15px;line-height:24px;">Warm regards,<br/><strong>Ash-Shajrah Learning Hub</strong></p>`,
  });
}

export function formatRegistrationCoordinatorText(
  data: RegistrationFormData,
  submittedAt: string
): string {
  const childDob = formatDateOnly(data.childDob);
  const cityCountry = toPlainText(data.cityCountry).trim();
  const [city, country] = cityCountry.includes(",")
    ? cityCountry.split(",").map((part) => part.trim())
    : ["", cityCountry];

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
    `Child Date of Birth: ${childDob || "(Not provided)"}`,
    `Interested Level: ${data.level.trim()}`,
    `Country: ${country || "(Not provided)"}`,
    `City: ${city || "(Not provided)"}`,
    `Message: ${data.message.trim() || "(Not provided)"}`,
  ].join("\n");
}

export function formatRegistrationCoordinatorHtml(
  data: RegistrationFormData,
  submittedAt: string
): string {
  const childDob = formatDateOnly(data.childDob);
  const cityCountry = toPlainText(data.cityCountry).trim();
  const [city, country] = cityCountry.includes(",")
    ? cityCountry.split(",").map((part) => part.trim())
    : ["", cityCountry];
  return buildEmailShell({
    preheader: "A new student registration requires review.",
    headerEyebrow: "Admissions Team",
    title: "New Student Registration",
    statusBadge: "Needs Review",
    introHtml:
      '<p style="margin:0 0 20px;color:#1F2A24;font-size:15px;line-height:24px;">A new student registration has been received for follow-up.</p>',
    sectionsHtml: buildInfoCard(
      "Registration Summary",
      buildDetailRows([
        { label: "Submitted", value: submittedAt },
        { label: "Parent / Guardian Name", value: data.parentName.trim() },
        { label: "WhatsApp Number", value: data.whatsapp.trim() },
        { label: "Email Address", value: data.email.trim() },
        { label: "Child Name", value: data.childName.trim() },
        { label: "Child Date of Birth", value: childDob || "(Not provided)" },
        { label: "Interested Level", value: data.level.trim() },
        { label: "Country", value: country || "(Not provided)" },
        { label: "City", value: city || "(Not provided)" },
        { label: "Message", value: data.message.trim() || "(Not provided)" },
      ])
    ),
  });
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
        ${row("Child Date of Birth", childDob || "(Not provided)")}
        ${row("Interested Level", data.level.trim())}
        ${row("Country", country || "(Not provided)")}
        ${row("City", city || "(Not provided)")}
        ${row("Message", data.message.trim() || "(Not provided)")}
      </table>
    </div>
  </div>
</body>
</html>`;
}
