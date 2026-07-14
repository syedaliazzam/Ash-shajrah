export const CAREER_STATUSES = [
  "new",
  "reviewed",
  "shortlisted",
  "rejected",
  "archived",
] as const;

export type CareerStatus = (typeof CAREER_STATUSES)[number];

export const CAREER_SOURCES = [
  "Website Careers Page",
  "LMS Careers Page",
] as const;

export type CareerSource = (typeof CAREER_SOURCES)[number];

export const INTERESTED_ROLE_OPTIONS = [
  {
    value: "Teacher",
    en: "Teacher",
    ur: "استاد",
  },
  {
    value: "Online Teaching Assistant",
    en: "Online Teaching Assistant",
    ur: "آن لائن ٹیچنگ اسسٹنٹ",
  },
  {
    value: "Montessori / Early Years Educator",
    en: "Montessori / Early Years Educator",
    ur: "مونٹیسوری / ابتدائی سالوں کا معلم",
  },
  {
    value: "Curriculum Specialist",
    en: "Curriculum Specialist",
    ur: "نصاب کا ماہر",
  },
  {
    value: "Parent Support / Counselor",
    en: "Parent Support / Counselor",
    ur: "والدین سپورٹ / کونسلر",
  },
  {
    value: "Operations / Admin",
    en: "Operations / Admin",
    ur: "آپریشنز / ایڈمن",
  },
  {
    value: "Marketing / Social Media",
    en: "Marketing / Social Media",
    ur: "مارکیٹنگ / سوشل میڈیا",
  },
  {
    value: "Other",
    en: "Other",
    ur: "دیگر",
  },
] as const;

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export type CareerFormFields = {
  fullName: string;
  email: string;
  whatsapp: string;
  interestedRole: string;
  message?: string;
  source: string;
  website?: string; // honeypot
};

export type CareerFieldErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "whatsapp"
    | "interestedRole"
    | "resume"
    | "source",
    string
  >
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isAllowedResumeFile(file: {
  name: string;
  type: string;
  size: number;
}): boolean {
  const lower = file.name.toLowerCase();
  const extOk = ALLOWED_RESUME_EXTENSIONS.some((ext) => lower.endsWith(ext));
  const mimeOk =
    !file.type ||
    (ALLOWED_RESUME_MIME_TYPES as readonly string[]).includes(file.type);
  return extOk && mimeOk && file.size > 0 && file.size <= MAX_RESUME_BYTES;
}

export function sanitizeFileName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 120);
}

export function validateCareerForm(
  fields: CareerFormFields,
  resume?: { name: string; type: string; size: number } | null
): CareerFieldErrors {
  const errors: CareerFieldErrors = {};

  if (!fields.fullName.trim()) errors.fullName = "Full name is required.";
  if (!fields.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!fields.whatsapp.trim()) errors.whatsapp = "WhatsApp number is required.";
  if (!fields.interestedRole.trim()) {
    errors.interestedRole = "Please select an interested role.";
  } else if (
    !INTERESTED_ROLE_OPTIONS.some((r) => r.value === fields.interestedRole)
  ) {
    errors.interestedRole = "Invalid role selection.";
  }

  if (
    fields.source !== "Website Careers Page" &&
    fields.source !== "LMS Careers Page"
  ) {
    errors.source = "Invalid source.";
  }

  if (!resume) {
    errors.resume = "Resume file is required.";
  } else if (resume.size > MAX_RESUME_BYTES) {
    errors.resume = "Resume must be 5MB or smaller.";
  } else if (!isAllowedResumeFile(resume)) {
    errors.resume = "Resume must be a PDF, DOC, or DOCX file.";
  }

  return errors;
}

export function isCareerStatus(value: string): value is CareerStatus {
  return (CAREER_STATUSES as readonly string[]).includes(value);
}
