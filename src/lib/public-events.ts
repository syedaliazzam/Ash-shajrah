export type RawPublicEvent = Record<string, unknown>;

export type EventRegistrationFieldType =
  | "text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "date"
  | "multiple_student_names"
  | "radio"
  | "checkbox"
  | "select";

export type EventRegistrationField = {
  id: string;
  label: string;
  type: EventRegistrationFieldType;
  required: boolean;
  enabled: boolean;
  order: number;
  placeholder?: string;
  options?: string[];
};

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
  eventCategory?: "alh-students" | "alh-parents" | "general-students" | "general-parents";
  registrationFormSchema?: EventRegistrationField[];
  ctaHref?: string;
  ctaLabel?: string;
  ctaExternal?: boolean;
  showFacebookIcon?: boolean;
  scheduleDays?: string[];
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

function pickLocalizedString(value: unknown): string {
  const direct = pickString(value);
  if (direct) return direct;
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  return (
    pickString(record.en) ||
    pickString(record.english) ||
    pickString(record.ur) ||
    pickString(record.urdu)
  );
}

function getValue(source: RawPublicEvent, keys: string[]) {
  for (const key of keys) {
    if (key in source && source[key] !== null && source[key] !== undefined) {
      return source[key];
    }
  }
  return undefined;
}

function pickBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "enabled"].includes(normalized)) return true;
    if (["false", "0", "no", "disabled"].includes(normalized)) return false;
  }
  return fallback;
}

function pickNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function normalizeFieldType(value: unknown): EventRegistrationFieldType | null {
  const normalized = pickString(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (
    [
      "text",
      "short_text",
      "single_line",
      "singleline",
      "short_answer",
      "text_input",
      "input",
      "name",
      "string",
    ].includes(normalized)
  ) {
    return "text";
  }
  if (
    [
      "long_text",
      "longtext",
      "textarea",
      "text_area",
      "paragraph",
      "paragraph_text",
      "multi_line",
      "multiline",
      "comments",
    ].includes(normalized)
  ) {
    return "long_text";
  }
  if (["email", "email_address", "email_input", "mail"].includes(normalized)) return "email";
  if (
    [
      "phone",
      "tel",
      "telephone",
      "whatsapp",
      "mobile",
      "mobile_number",
      "phone_number",
      "country_phone",
      "phone_with_country",
      "phone_with_country_code",
    ].includes(normalized)
  ) {
    return "phone";
  }
  if (["number", "numeric", "integer", "decimal", "float"].includes(normalized)) return "number";
  if (["date", "dob", "date_picker", "datepicker"].includes(normalized)) return "date";
  if (
    [
      "multiple_student_names",
      "student_names",
      "students_names",
      "multiple_students",
      "multi_student_names",
      "student_names_list",
      "students",
      "list",
      "repeater",
      "repeatable",
      "repeatable_text",
      "multi_text",
      "multi_input",
      "array",
    ].includes(normalized)
  ) {
    return "multiple_student_names";
  }
  if (
    [
      "radio",
      "single_choice",
      "single-choice",
      "singlechoice",
      "radios",
    ].includes(normalized)
  ) {
    return "radio";
  }
  if (
    [
      "checkbox",
      "checkboxes",
      "multiple_choice",
      "multiple-choice",
      "multiplechoice",
      "multi_choice",
      "multichoice",
      "multi_select",
      "multiple_select",
      "multiselect",
      "multipleselect",
    ].includes(normalized)
  ) {
    return "checkbox";
  }
  if (
    [
      "select",
      "dropdown",
      "drop_down",
      "choice",
      "combobox",
    ].includes(normalized)
  ) {
    return "select";
  }
  return null;
}

function inferFieldType(record: Record<string, unknown>) {
  const explicitType = normalizeFieldType(
    getValue(record, [
      "type",
      "fieldType",
      "field_type",
      "inputType",
      "input_type",
      "component",
      "control",
      "kind",
    ])
  );
  if (explicitType) return explicitType;

  const hint = [
    pickLocalizedString(getValue(record, ["id", "key", "name", "fieldKey", "field_key"])),
    pickLocalizedString(getValue(record, ["label", "title", "fieldLabel", "field_label"])),
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (hint.includes("email")) return "email";
  if (hint.includes("phone") || hint.includes("whatsapp") || hint.includes("mobile")) return "phone";
  if (hint.includes("student") && hint.includes("names")) return "multiple_student_names";
  if (hint.includes("date")) return "date";
  if (hint.includes("number") || hint.includes("age") || hint.includes("amount")) return "number";
  if (hint.includes("comment") || hint.includes("note") || hint.includes("detail")) return "long_text";
  if (hint.trim()) return "text";
  return null;
}

function looksLikeField(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Boolean(
    inferFieldType(record) ||
      getValue(record, ["label", "title", "name", "fieldLabel", "field_label"]) ||
      getValue(record, ["id", "key", "fieldKey", "field_key"])
  );
}

function getNestedFieldCollections(record: Record<string, unknown>) {
  return [
    record.fields,
    record.formFields,
    record.registrationFields,
    record.children,
    record.items,
    record.sections,
    record.groups,
    record.pages,
    record.steps,
  ].filter((value): value is unknown[] => Array.isArray(value));
}

function hasExplicitFieldType(record: Record<string, unknown>) {
  return Boolean(
    getValue(record, [
      "type",
      "fieldType",
      "field_type",
      "inputType",
      "input_type",
      "component",
      "control",
      "kind",
    ])
  );
}

function schemaToArray(value: unknown): unknown[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(schemaToArray);
  if (typeof value === "string") {
    try {
      return schemaToArray(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const nestedFields = getNestedFieldCollections(record).flatMap(schemaToArray);
  if (hasExplicitFieldType(record)) return [record];
  if (nestedFields.length > 0 && !hasExplicitFieldType(record)) return nestedFields;

  const objectFields = Object.entries(record).flatMap(([key, field]) => {
    if (looksLikeField(field)) {
      return [{ id: key, ...(field as Record<string, unknown>) }];
    }
    if (Array.isArray(field)) return field.flatMap(schemaToArray);
    if (field && typeof field === "object") return schemaToArray(field);
    return [];
  });

  if (looksLikeField(record) && nestedFields.length === 0) {
    return [record, ...objectFields];
  }

  return [...nestedFields, ...objectFields];
}

function normalizeFieldOptions(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const list = value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (typeof item === "number") return String(item).trim();
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          return (
            pickLocalizedString(getValue(rec, ["label", "value", "title", "text", "name"])) ||
            pickString(rec.label || rec.value)
          ).trim();
        }
        return "";
      })
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  }
  if (typeof value === "string" && value.trim()) {
    const list = value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  }
  return undefined;
}

export function normalizeEventRegistrationFields(value: unknown): EventRegistrationField[] {
  const seenIds = new Map<string, number>();

  return schemaToArray(value)
    .map((field, index): EventRegistrationField | null => {
      if (!field || typeof field !== "object") return null;
      const record = field as Record<string, unknown>;
      const type = inferFieldType(record);
      if (!type) return null;

      const id =
        pickLocalizedString(getValue(record, ["id", "key", "name", "fieldKey", "field_key"])) ||
        `field_${index + 1}`;
      const label =
        pickLocalizedString(getValue(record, ["label", "title", "name", "fieldLabel", "field_label"])) ||
        id.replace(/[_-]+/g, " ");
      const seenCount = seenIds.get(id) || 0;
      seenIds.set(id, seenCount + 1);
      const uniqueId = seenCount > 0 ? `${id}_${seenCount + 1}` : id;

      return {
        id: uniqueId,
        label,
        type,
        required: pickBoolean(getValue(record, ["required", "isRequired", "is_required", "mandatory"]), false),
        enabled: pickBoolean(
          getValue(record, ["enabled", "isEnabled", "is_enabled", "visible", "isVisible", "is_visible", "active", "isActive", "is_active"]),
          true
        ),
        order: pickNumber(getValue(record, ["order", "sortOrder", "sort_order", "position"]), index),
        placeholder: pickLocalizedString(getValue(record, ["placeholder", "helpText", "help_text"])),
        options: normalizeFieldOptions(
          getValue(record, ["options", "choices", "items", "values", "optionList", "option_list"])
        ),
      };
    })
    .filter((field): field is EventRegistrationField => Boolean(field))
    .filter((field) => field.enabled)
    .sort((a, b) => a.order - b.order);
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

  const categoryRaw = pickString(
    getValue(item, ["eventCategory", "event_category"])
  ).toLowerCase();

  const eventCategory: PublicEvent["eventCategory"] =
    categoryRaw === "alh-students"
      ? "alh-students"
      : categoryRaw === "alh-parents"
        ? "alh-parents"
        : categoryRaw === "general-students"
          ? "general-students"
          : categoryRaw === "general-parents"
            ? "general-parents"
            : undefined;

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
    eventCategory,
    registrationFormSchema: normalizeEventRegistrationFields(
      getValue(item, ["registrationFormSchema", "registration_form_schema"])
    ),
    ctaHref: pickString(getValue(item, ["ctaHref", "cta_href"])),
    ctaLabel: pickString(getValue(item, ["ctaLabel", "cta_label"])),
    ctaExternal: Boolean(getValue(item, ["ctaExternal", "cta_external"])),
    showFacebookIcon: Boolean(getValue(item, ["showFacebookIcon", "show_facebook_icon"])),
    scheduleDays: (() => {
      const raw = getValue(item, ["scheduleDays", "schedule_days", "schedule", "days"]);
      if (Array.isArray(raw)) {
        return raw.map((d) => (typeof d === "string" ? d.trim() : "")).filter(Boolean);
      }
      if (typeof raw === "string" && raw.trim()) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((d) => String(d).trim()).filter(Boolean);
          }
        } catch {}
      }
      return undefined;
    })(),
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

export function formatEventFee(value: string, fallback = "0") {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return fallback;

  const numericValue = Number(trimmedValue);
  if (Number.isNaN(numericValue)) return trimmedValue;

  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function hasRegistrationDeadlinePassed(value: string) {
  if (!value) return false;
  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return false;
  return deadline.getTime() < Date.now();
}

export function formatEventScheduleDays(scheduleDays?: string[] | null) {
  if (!scheduleDays || scheduleDays.length === 0) return "";
  return scheduleDays
    .map((d) => formatEventDate(d))
    .filter(Boolean)
    .join(", ");
}


const WEEKDAY_MAP: Record<string, number> = {
  sun: 0, sunday: 0, su: 0,
  mon: 1, monday: 1, mo: 1,
  tue: 2, tuesday: 2, tu: 2,
  wed: 3, wednesday: 3, we: 3,
  thu: 4, thursday: 4, th: 4,
  fri: 5, friday: 5, fr: 5,
  sat: 6, saturday: 6, sa: 6,
};

function getPKTDateParts(dateInput: Date | string | number) {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  const utcMillis = d.getTime() + d.getTimezoneOffset() * 60000;
  const pktMillis = utcMillis + 5 * 3600000;
  const pktDate = new Date(pktMillis);
  return {
    year: pktDate.getFullYear(),
    month: pktDate.getMonth(),
    date: pktDate.getDate(),
    day: pktDate.getDay(),
  };
}

export function getEventSessionDates(
  startAt?: string | null,
  endAt?: string | null,
  scheduleDays?: string[] | null
): Date[] {
  if (!startAt) return [];
  const startPkt = getPKTDateParts(startAt);
  if (!startPkt) return [];
  const endPkt = endAt ? getPKTDateParts(endAt) : startPkt;

  const weekdaySet = new Set<number>();
  const explicitDates: Date[] = [];

  if (Array.isArray(scheduleDays)) {
    for (const item of scheduleDays) {
      if (!item || typeof item !== "string") continue;
      const clean = item.trim().toLowerCase();
      if (WEEKDAY_MAP[clean] !== undefined) {
        weekdaySet.add(WEEKDAY_MAP[clean]);
      } else {
        const parsed = new Date(item);
        if (!Number.isNaN(parsed.getTime())) {
          explicitDates.push(parsed);
        }
      }
    }
  }

  if (explicitDates.length > 0 && weekdaySet.size === 0) {
    return explicitDates.sort((a, b) => a.getTime() - b.getTime());
  }

  if (weekdaySet.size > 0 && endPkt) {
    const dates: Date[] = [];
    const cur = new Date(Date.UTC(startPkt.year, startPkt.month, startPkt.date));
    const end = new Date(Date.UTC(endPkt.year, endPkt.month, endPkt.date));

    while (cur <= end) {
      if (weekdaySet.has(cur.getUTCDay())) {
        dates.push(new Date(cur.getTime()));
      }
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    if (dates.length > 0) return dates;
  }

  if (
    endPkt &&
    (startPkt.year !== endPkt.year ||
      startPkt.month !== endPkt.month ||
      startPkt.date !== endPkt.date)
  ) {
    const cur = new Date(Date.UTC(startPkt.year, startPkt.month, startPkt.date));
    const end = new Date(Date.UTC(endPkt.year, endPkt.month, endPkt.date));
    const diffDays = Math.round((end.getTime() - cur.getTime()) / 86400000);
    if (diffDays <= 4) {
      const dates: Date[] = [];
      while (cur <= end) {
        dates.push(new Date(cur.getTime()));
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
      return dates;
    }
    return [
      new Date(Date.UTC(startPkt.year, startPkt.month, startPkt.date)),
      new Date(Date.UTC(endPkt.year, endPkt.month, endPkt.date)),
    ];
  }

  return [new Date(Date.UTC(startPkt.year, startPkt.month, startPkt.date))];
}

export function formatPublicEventDates(
  eventOrStartAt?:
    | { startAt?: string; endAt?: string; scheduleDays?: string[] }
    | string
    | null,
  endAt?: string | null,
  scheduleDays?: string[] | null
): string {
  if (!eventOrStartAt) return "To be announced";

  let start: string | undefined;
  let end: string | undefined;
  let days: string[] | undefined;

  if (typeof eventOrStartAt === "object") {
    start = eventOrStartAt.startAt;
    end = eventOrStartAt.endAt;
    days = eventOrStartAt.scheduleDays;
  } else {
    start = eventOrStartAt;
    end = endAt || undefined;
    days = scheduleDays || undefined;
  }

  if (!start) return "To be announced";

  const sessionDates = getEventSessionDates(start, end, days);
  if (!sessionDates.length) return formatEventDate(start);
  if (sessionDates.length === 1) {
    return new Intl.DateTimeFormat("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(sessionDates[0]);
  }

  const firstYear = sessionDates[0].getUTCFullYear();
  const allSameYear = sessionDates.every((d) => d.getUTCFullYear() === firstYear);
  const firstMonth = sessionDates[0].getUTCMonth();
  const allSameMonthAndYear =
    allSameYear && sessionDates.every((d) => d.getUTCMonth() === firstMonth);

  const monthName = new Intl.DateTimeFormat("en-PK", {
    month: "short",
    timeZone: "UTC",
  }).format(sessionDates[0]);

  if (allSameMonthAndYear) {
    const dayNumbers = sessionDates.map((d) => d.getUTCDate());
    if (dayNumbers.length === 2) {
      return `${dayNumbers[0]} & ${dayNumbers[1]} ${monthName} ${firstYear}`;
    }
    const allButLast = dayNumbers.slice(0, -1).join(", ");
    const last = dayNumbers[dayNumbers.length - 1];
    return `${allButLast} & ${last} ${monthName} ${firstYear}`;
  }

  if (allSameYear) {
    const groups = new Map<number, { monthStr: string; days: number[] }>();
    for (const d of sessionDates) {
      const m = d.getUTCMonth();
      if (!groups.has(m)) {
        groups.set(m, {
          monthStr: new Intl.DateTimeFormat("en-PK", {
            month: "short",
            timeZone: "UTC",
          }).format(d),
          days: [],
        });
      }
      groups.get(m)!.days.push(d.getUTCDate());
    }
    const parts: string[] = [];
    for (const { monthStr, days } of groups.values()) {
      if (days.length === 1) {
        parts.push(`${days[0]} ${monthStr}`);
      } else if (days.length === 2) {
        parts.push(`${days[0]} & ${days[1]} ${monthStr}`);
      } else {
        parts.push(
          `${days.slice(0, -1).join(", ")} & ${days[days.length - 1]} ${monthStr}`
        );
      }
    }
    return `${parts.join(" & ")} ${firstYear}`;
  }

  return sessionDates
    .map((d) =>
      new Intl.DateTimeFormat("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(d)
    )
    .join(", ");
}
