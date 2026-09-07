import { cache } from "react";
import { getPgPool } from "@/lib/postgres";
import {
  normalizeEventRegistrationFields,
  slugifyPublicEventTitle,
  type EventRegistrationField,
  type PublicEvent,
} from "@/lib/public-events";

type PublicEventRow = {
  id: string;
  title: string;
  description: string;
  start_at: Date | string;
  end_at: Date | string;
  event_fee_amount: string | number | null;
  registration_deadline: Date | string;
  image_bucket: string | null;
  image_object_path: string | null;
  image_stored_path: string | null;
  event_category: string | null;
  registration_form_schema: unknown;
};

type PublicEventRegistrationRow = {
  registration_no: string;
};

export type PublicEventCustomFieldValue = {
  fieldId: string;
  label: string;
  type: EventRegistrationField["type"];
  value: string | string[];
};

export type PublicEventCustomFieldValues = Record<string, string | string[]>;

type PaymentMethodRow = {
  name: string | null;
  method_key: string | null;
  account_title: string | null;
  account_number: string | null;
  iban: string | null;
  bank_name: string | null;
  branch_code: string | null;
  instructions: string | null;
};

function resolveImageUrl(row: PublicEventRow) {
  const stored = row.image_stored_path?.trim();
  const objectPath = row.image_object_path?.trim();
  const bucket = row.image_bucket?.trim() || "ash-shajrah";
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ||
    process.env.SUPABASE_URL?.replace(/\/$/, "") ||
    deriveSupabaseUrlFromDatabaseUrl();

  const buildStorageUrl = (path: string) => {
    if (!supabaseUrl) return "";
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path.replace(/^\/+/, "")}`;
  };

  const extractObjectPath = (value: string) => {
    const trimmed = value.trim().replace(/^\/+/, "");
    if (!trimmed) return "";

    const publicPrefix = "storage/v1/object/public/";
    const publicIndex = trimmed.indexOf(publicPrefix);
    if (publicIndex >= 0) {
      const remainder = trimmed.slice(publicIndex + publicPrefix.length);
      if (remainder.startsWith(`${bucket}/`)) {
        return remainder.slice(bucket.length + 1);
      }
      return remainder.replace(/^[^/]+\//, "");
    }

    if (trimmed.startsWith(`${bucket}/`)) {
      return trimmed.slice(bucket.length + 1);
    }

    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const url = new URL(trimmed);
        const pathname = url.pathname.replace(/^\/+/, "");
        return extractObjectPath(pathname);
      } catch {
        return "";
      }
    }

    return trimmed;
  };

  if (stored) {
    if (/^https?:\/\//i.test(stored)) return stored;
    if (stored.startsWith("/storage/v1/object/public/")) {
      const objectFromStoragePath = extractObjectPath(stored);
      const storageUrl = buildStorageUrl(objectFromStoragePath);
      if (storageUrl) return storageUrl;
    }
    if (stored.startsWith("/") && !stored.startsWith("/storage/")) return stored;

    const objectFromStored = extractObjectPath(stored);
    if (objectFromStored) {
      const storageUrl = buildStorageUrl(objectFromStored);
      if (storageUrl) return storageUrl;
    }
  }

  if (objectPath) {
    const storageUrl = buildStorageUrl(extractObjectPath(objectPath));
    if (storageUrl) return storageUrl;
  }

  return "";
}

function deriveSupabaseUrlFromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  const hostMatch = databaseUrl.match(/postgres\.([a-z0-9]+)\./i);
  if (hostMatch?.[1]) {
    return `https://${hostMatch[1]}.supabase.co`;
  }

  const userMatch = databaseUrl.match(/postgresql:\/\/postgres\.([a-z0-9]+):/i);
  if (userMatch?.[1]) {
    return `https://${userMatch[1]}.supabase.co`;
  }

  return "";
}

function toDate(value: Date | string) {
  if (value instanceof Date) return value;
  return new Date(value);
}

function createInternalNoEmailValue(eventId: string) {
  const uniqueValue = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `no-email-${eventId}-${uniqueValue}@ash-shajrah.local`;
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function valueToString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(", ").trim() : String(value || "").trim();
}

function getFieldValue(
  fields: EventRegistrationField[],
  values: PublicEventCustomFieldValues,
  ids: string[],
  type?: EventRegistrationField["type"]
) {
  for (const id of ids) {
    const value = values[id];
    if (value !== undefined) return valueToString(value);
  }

  const normalizedIds = ids.map(normalizeKey);
  const matchingField = fields.find((field) => {
    const fieldId = normalizeKey(field.id);
    return (
      (type ? field.type === type : false) ||
      normalizedIds.some((id) => fieldId === id)
    );
  });

  return matchingField ? valueToString(values[matchingField.id]) : "";
}

function getStudentNamesValue(
  fields: EventRegistrationField[],
  values: PublicEventCustomFieldValues
) {
  const directValue = values.studentNames;
  const schemaField = fields.find((field) => field.type === "multiple_student_names");
  const value = directValue !== undefined ? directValue : schemaField ? values[schemaField.id] : undefined;

  if (Array.isArray(value)) return value.map((name) => name.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
  }
  return [];
}

function toPublicEvent(row: PublicEventRow): PublicEvent {
  const startDate = toDate(row.start_at);
  const endDate = toDate(row.end_at);
  const registrationDeadline = toDate(row.registration_deadline);
  const now = Date.now();
  const start = startDate.getTime();
  const end = endDate.getTime();

  const categoryRaw = (row.event_category || "").toLowerCase().trim();
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
    id: row.id,
    slug: slugifyPublicEventTitle(row.title),
    title: row.title,
    description: row.description,
    imageUrl: resolveImageUrl(row),
    startAt: Number.isNaN(start) ? String(row.start_at) : startDate.toISOString(),
    endAt: Number.isNaN(end) ? String(row.end_at) : endDate.toISOString(),
    fee:
      row.event_fee_amount === null || row.event_fee_amount === undefined
        ? ""
        : String(row.event_fee_amount),
    capacity: "",
    registrationDeadline: Number.isNaN(registrationDeadline.getTime())
      ? String(row.registration_deadline)
      : registrationDeadline.toISOString(),
    lifecycle: end < now ? "past" : start <= now ? "current" : "upcoming",
    eventCategory,
    registrationFormSchema: normalizeEventRegistrationFields(row.registration_form_schema),
  };
}

export const getPublicEventBySlugFromDb = cache(async (slug: string) => {
  const { currentUpcoming, past } = await listPublicEventsFromDb();
  return [...currentUpcoming, ...past].find((event) => event.slug === slug) || null;
});

export const listPublicEventsFromDb = cache(async () => {
  const client = getPgPool();
  const result = await client.query<PublicEventRow>(`
    select
      id,
      title,
      description,
      start_at,
      end_at,
      event_fee_amount,
      registration_deadline,
      image_bucket,
      image_object_path,
      image_stored_path,
      event_category,
      registration_form_schema
    from public.public_events
    where publication_status = 'published'
    order by start_at asc
  `);

  const events = result.rows.map(toPublicEvent);
  return {
    currentUpcoming: events.filter((event) => event.lifecycle !== "past"),
    past: events.filter((event) => event.lifecycle === "past"),
  };
});

export async function createPublicEventRegistrationInDb(input: {
  eventId: string;
  participantName: string;
  email?: string;
  whatsapp: string;
  notes: string;
  studentName?: string;
  parentName?: string;
  schoolName?: string;
  classInput?: string;
  studentNames?: string[];
  customFieldValues?: PublicEventCustomFieldValues;
}) {
  const client = getPgPool();

  const eventResult = await client.query<{
    id: string;
    title: string;
    start_at: Date;
    end_at: Date;
    registration_deadline: Date;
    event_fee_amount: string | number | null;
    publication_status: string;
    registration_form_schema: unknown;
  }>(
    `
      select
        id,
        title,
        start_at,
        end_at,
        registration_deadline,
        event_fee_amount,
        publication_status,
        registration_form_schema
      from public.public_events
      where id = $1
      limit 1
    `,
    [input.eventId]
  );

  const event = eventResult.rows[0];
  if (!event) {
    throw new Error("Selected event was not found.");
  }
  const eventEndAt = toDate(event.end_at);
  const deadlineAt = toDate(event.registration_deadline);
  if (event.publication_status !== "published") {
    throw new Error("This event is not available for registration.");
  }
  if (!Number.isNaN(eventEndAt.getTime()) && eventEndAt.getTime() < Date.now()) {
    throw new Error("Registration is closed for past events.");
  }
  if (!Number.isNaN(deadlineAt.getTime()) && deadlineAt.getTime() < Date.now()) {
    throw new Error("Registration deadline has passed for this event.");
  }

  const registrationFields = normalizeEventRegistrationFields(event.registration_form_schema);
  const hasConfiguredFields = registrationFields.length > 0;
  const customFieldValues = input.customFieldValues || {};
  const derivedEmail = input.email?.trim() || getFieldValue(registrationFields, customFieldValues, ["email"], "email");
  const derivedWhatsapp =
    input.whatsapp?.trim() ||
    getFieldValue(registrationFields, customFieldValues, ["whatsapp", "phone", "mobile"], "phone");
  const derivedParentName =
    input.parentName?.trim() ||
    getFieldValue(registrationFields, customFieldValues, ["parentName", "guardianName"]);
  const derivedStudentName =
    input.studentName?.trim() ||
    getFieldValue(registrationFields, customFieldValues, ["studentName", "childName"]);
  const derivedSchoolName =
    input.schoolName?.trim() ||
    getFieldValue(registrationFields, customFieldValues, ["schoolName"]);
  const derivedClassInput =
    input.classInput?.trim() ||
    getFieldValue(registrationFields, customFieldValues, ["classInput", "classLevel", "grade"]);
  const derivedStudentNames =
    input.studentNames && input.studentNames.length > 0
      ? input.studentNames
      : getStudentNamesValue(registrationFields, customFieldValues);
  const derivedParticipantName =
    input.participantName?.trim() ||
    derivedParentName ||
    derivedStudentName ||
    "Event Participant";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasEmailField = !hasConfiguredFields || registrationFields.some((field) => field.type === "email");
  const trimmedEmail = derivedEmail.trim().toLowerCase();
  const storedEmail = trimmedEmail || createInternalNoEmailValue(input.eventId);

  if (hasConfiguredFields) {
    for (const field of registrationFields) {
      const value = customFieldValues[field.id];
      const stringValue = Array.isArray(value) ? value.join(" ").trim() : String(value || "").trim();
      const studentNames = Array.isArray(value)
        ? value.map((name) => name.trim()).filter(Boolean)
        : [];

      if (field.required) {
        if (field.type === "multiple_student_names" && studentNames.length === 0) {
          throw new Error(`${field.label} is required.`);
        }
        if (field.type !== "multiple_student_names" && !stringValue) {
          throw new Error(`${field.label} is required.`);
        }
      }

      if (field.type === "email" && stringValue && !emailRegex.test(stringValue)) {
        throw new Error("Please enter a valid email address.");
      }
      if (field.type === "phone" && stringValue && !/^\+\d{1,4}\s?\d{6,14}$/.test(stringValue.replace(/[()-]/g, ""))) {
        throw new Error(`${field.label} must include a valid country code.`);
      }
      if (field.type === "number" && stringValue && !Number.isFinite(Number(stringValue))) {
        throw new Error(`${field.label} must be a valid number.`);
      }
    }
  }
  if (hasEmailField && trimmedEmail) {
    const duplicateResult = await client.query<{ exists: boolean }>(
      `
        select exists(
          select 1
          from public.public_event_registrations
          where event_id = $1
            and status <> 'cancelled'
            and (
              lower(trim(coalesce(email, ''))) = $2
              or lower(trim(coalesce(custom_field_values->>'email', ''))) = $2
              or exists (
                select 1
                from jsonb_each_text(
                  case
                    when jsonb_typeof(custom_field_values) = 'object' then custom_field_values
                    else '{}'::jsonb
                  end
                ) as field_value(key, value)
                where lower(trim(field_value.value)) = $2
              )
              or exists (
                select 1
                from jsonb_array_elements(
                  case
                    when jsonb_typeof(custom_field_values) = 'array' then custom_field_values
                    else '[]'::jsonb
                  end
                ) as field
                where lower(trim(coalesce(field->>'value', ''))) = $2
                   or exists (
                    select 1
                    from jsonb_array_elements_text(
                      case
                        when jsonb_typeof(field->'value') = 'array' then field->'value'
                        else '[]'::jsonb
                      end
                    ) as field_value(value)
                    where lower(trim(field_value.value)) = $2
                  )
              )
            )
        ) as exists
      `,
      [input.eventId, trimmedEmail]
    );

    if (duplicateResult.rows[0]?.exists) {
      throw new Error("User is already registered for this event.");
    }
  }

  const insertResult = await client.query<PublicEventRegistrationRow>(
    `
      insert into public.public_event_registrations (
        event_id,
        participant_name,
        email,
        whatsapp,
        notes,
        student_name,
        parent_name,
        school_name,
        class_input,
        student_names,
        custom_field_values,
        amount_due,
        status
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, 'pending')
      returning registration_no
    `,
    [
      input.eventId,
      derivedParticipantName,
      storedEmail,
      derivedWhatsapp,
      input.notes || null,
      derivedStudentName || null,
      derivedParentName || null,
      derivedSchoolName || null,
      derivedClassInput || null,
      derivedStudentNames.length > 0 ? JSON.stringify(derivedStudentNames) : null,
      JSON.stringify(customFieldValues),
      event.event_fee_amount ?? 0,
    ]
  );

  return {
    registrationNumber: insertResult.rows[0]?.registration_no || "",
    amountDue:
      event.event_fee_amount === null || event.event_fee_amount === undefined
        ? "0"
        : String(event.event_fee_amount),
    eventTitle: event.title,
    eventStartAt:
      event.start_at instanceof Date
        ? event.start_at.toISOString()
        : String(event.start_at),
    eventEndAt:
      event.end_at instanceof Date ? event.end_at.toISOString() : String(event.end_at),
    registrationDeadline:
      event.registration_deadline instanceof Date
        ? event.registration_deadline.toISOString()
        : String(event.registration_deadline),
    registrationFormSchema: registrationFields,
    customFieldValues,
  };
}

export async function listActivePaymentMethods() {
  const client = getPgPool();
  const result = await client.query<PaymentMethodRow>(`
    select
      name,
      method_key,
      account_title,
      account_number,
      iban,
      bank_name,
      branch_code,
      instructions
    from public.payment_methods
    where status = 'active'
    order by created_at asc
  `);

  return result.rows.map((row) => ({
    name: row.name ?? "",
    methodKey: row.method_key ?? "",
    accountTitle: row.account_title ?? "",
    accountNumber: row.account_number ?? "",
    iban: row.iban ?? "",
    bankName: row.bank_name ?? "",
    branchCode: row.branch_code ?? "",
    instructions: row.instructions ?? "",
  }));
}
