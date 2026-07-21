import { SITE } from "./data";

export const REGISTER_URL = "/register";
export const CAREERS_URL = "/careers";

export const WHATSAPP_URL = resolveAshShajrahWhatsAppUrl(
  process.env.NEXT_PUBLIC_ASH_SHAJRAH_WHATSAPP_URL || SITE.contact.whatsapp
);

export const EDI_FACEBOOK_URL =
  "https://www.facebook.com/EducatorsDevelopmentInstitute/";

/** Official Ash-Shajrah Learning Hub Facebook page (footer social link). */
export const DEFAULT_ASH_SHAJRAH_FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61591189181962";

const FACEBOOK_ENV_KEY_PREFIX = "NEXT_PUBLIC_ASH_SHAJRAH_FACEBOOK_URL=";

function resolveAshShajrahWhatsAppUrl(raw: string | undefined): string {
  const WHATSAPP_ENV_KEY_PREFIX = "NEXT_PUBLIC_ASH_SHAJRAH_WHATSAPP_URL=";
  let value = (raw ?? "").trim();

  if (!value) {
    return SITE.contact.whatsapp;
  }

  while (value.startsWith(WHATSAPP_ENV_KEY_PREFIX)) {
    value = value.slice(WHATSAPP_ENV_KEY_PREFIX.length).trim();
  }

  value = value.replace(/^https:\/(?!\/)/i, "https://");
  value = value.replace(/^http:\/(?!\/)/i, "http://");

  const waMatch = value.match(/https:\/\/wa\.me\/\d+(?:\?text=[^\s"'<>]*)?/i);
  if (waMatch) return waMatch[0].replace(/[,;.]+$/g, "");

  const phoneDigits = value.replace(/\D/g, "");
  if (phoneDigits.length >= 10) {
    return `https://wa.me/${phoneDigits}`;
  }

  return SITE.contact.whatsapp;
}

/**
 * Resolve and sanitize the public Facebook URL.
 * Guards against production misconfiguration where the env key, a single-slash
 * `https:/`, or a duplicated/encoded URL was pasted into the value.
 */
function resolveAshShajrahFacebookUrl(raw: string | undefined): string {
  let value = (raw ?? "").trim();

  if (!value) {
    return DEFAULT_ASH_SHAJRAH_FACEBOOK_URL;
  }

  // Strip accidental "KEY=..." paste (common in Vercel / .env copy mistakes).
  while (value.startsWith(FACEBOOK_ENV_KEY_PREFIX)) {
    value = value.slice(FACEBOOK_ENV_KEY_PREFIX.length).trim();
  }

  // Fix malformed protocol with a single slash: https:/www... → https://www...
  value = value.replace(/^https:\/(?!\/)/i, "https://");
  value = value.replace(/^http:\/(?!\/)/i, "http://");

  // Prefer the first plain https://www.facebook.com/... segment.
  // Truncate before a concatenated URL-encoded duplicate (https%3A%2F%2F...).
  const facebookMatch = value.match(
    /https:\/\/www\.facebook\.com\/[^\s"'<>]*/i
  );
  if (facebookMatch) {
    let candidate = facebookMatch[0];
    const encodedDup = candidate.search(/https?%3A/i);
    if (encodedDup > 0) {
      candidate = candidate.slice(0, encodedDup);
    }
    candidate = candidate.replace(/[,;.]+$/g, "");
    if (candidate.startsWith("https://www.facebook.com/")) {
      return candidate;
    }
  }

  if (value.startsWith("https://www.facebook.com/")) {
    return value;
  }

  // Malformed value — never render a relative / internal path.
  return DEFAULT_ASH_SHAJRAH_FACEBOOK_URL;
}

export const ASH_SHAJRAH_FACEBOOK_URL = resolveAshShajrahFacebookUrl(
  process.env.NEXT_PUBLIC_ASH_SHAJRAH_FACEBOOK_URL
);

export const ASH_SHAJRAH_WHATSAPP_URL = resolveAshShajrahWhatsAppUrl(
  process.env.NEXT_PUBLIC_ASH_SHAJRAH_WHATSAPP_URL || SITE.contact.whatsapp
);
