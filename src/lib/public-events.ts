export type RawPublicEvent = Record<string, unknown>;

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  startAt: string;
  endAt: string;
  fee: string;
  capacity: string;
  registrationDeadline: string;
  lifecycle: "current" | "upcoming" | "past";
  ctaHref?: string;
  ctaLabel?: string;
  ctaExternal?: boolean;
  showFacebookIcon?: boolean;
};

export type PublicEventsResponse = {
  currentUpcoming: PublicEvent[];
  past: PublicEvent[];
};

function pickString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function getValue(source: RawPublicEvent, keys: string[]) {
  for (const key of keys) {
    if (key in source && source[key] !== null && source[key] !== undefined) {
      return source[key];
    }
  }
  return undefined;
}

export function slugifyPublicEventTitle(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "event";
}

export function normalizePublicEvent(
  item: RawPublicEvent,
  fallbackLifecycle?: PublicEvent["lifecycle"]
): PublicEvent {
  const lifecycleRaw = pickString(
    getValue(item, ["lifecycle", "lifecycle_badge", "status"])
  ).toLowerCase();

  const lifecycle: PublicEvent["lifecycle"] =
    lifecycleRaw === "past"
      ? "past"
      : lifecycleRaw === "current"
        ? "current"
        : lifecycleRaw === "upcoming"
          ? "upcoming"
          : fallbackLifecycle || "upcoming";

  return {
    id: pickString(getValue(item, ["id", "event_id"])),
    slug:
      pickString(getValue(item, ["slug"])) ||
      slugifyPublicEventTitle(pickString(getValue(item, ["title", "name"]))),
    title: pickString(getValue(item, ["title", "name"])),
    description: pickString(
      getValue(item, ["description", "summary", "details", "short_description"])
    ),
    imageUrl: pickString(
      getValue(item, ["image_url", "imageUrl", "poster_url", "thumbnail_url"])
    ),
    startAt: pickString(
      getValue(item, ["startAt", "start_at", "start_datetime", "start_date", "starts_at"])
    ),
    endAt: pickString(
      getValue(item, ["endAt", "end_at", "end_datetime", "end_date", "ends_at"])
    ),
    fee: pickString(getValue(item, ["event_fee", "event_fee_amount", "fee", "price"])),
    capacity: pickString(getValue(item, ["capacity", "max_capacity", "seats"])),
    registrationDeadline: pickString(
      getValue(item, ["registrationDeadline", "registration_deadline", "deadline", "registration_closes_at"])
    ),
    lifecycle,
    ctaHref: pickString(getValue(item, ["ctaHref", "cta_href"])),
    ctaLabel: pickString(getValue(item, ["ctaLabel", "cta_label"])),
    ctaExternal: Boolean(getValue(item, ["ctaExternal", "cta_external"])),
    showFacebookIcon: Boolean(getValue(item, ["showFacebookIcon", "show_facebook_icon"])),
  };
}

export function normalizePublicEventsResponse(payload: unknown): PublicEventsResponse {
  const source =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: unknown }).data
      : payload;

  const body = (source && typeof source === "object" ? source : {}) as {
    currentUpcoming?: unknown;
    past?: unknown;
  };

  const currentUpcoming = Array.isArray(body.currentUpcoming)
    ? body.currentUpcoming.map((item) =>
        normalizePublicEvent(item as RawPublicEvent, "upcoming")
      )
    : [];

  const past = Array.isArray(body.past)
    ? body.past.map((item) => normalizePublicEvent(item as RawPublicEvent, "past"))
    : [];

  return { currentUpcoming, past };
}

export function formatEventDateTime(value: string) {
  if (!value) return "To be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(date);
}

export function formatEventDate(value: string) {
  if (!value) return "To be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeZone: "Asia/Karachi",
  }).format(date);
}

export function formatEventTime(value: string) {
  if (!value) return "To be announced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-PK", {
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(date);
}

export function hasRegistrationDeadlinePassed(value: string) {
  if (!value) return false;
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return false;
  return deadline.getTime() < Date.now();
}
