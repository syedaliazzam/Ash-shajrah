import { getPgPool } from "@/lib/postgres";
import { slugifyPublicEventTitle, type PublicEvent } from "@/lib/public-events";

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
};

type PublicEventRegistrationRow = {
  registration_no: string;
};

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

function toPublicEvent(row: PublicEventRow): PublicEvent {
  const startDate = toDate(row.start_at);
  const endDate = toDate(row.end_at);
  const registrationDeadline = toDate(row.registration_deadline);
  const now = Date.now();
  const start = startDate.getTime();
  const end = endDate.getTime();

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
  };
}

export async function getPublicEventBySlugFromDb(slug: string) {
  const { currentUpcoming, past } = await listPublicEventsFromDb();
  return [...currentUpcoming, ...past].find((event) => event.slug === slug) || null;
}

export async function listPublicEventsFromDb() {
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
      image_stored_path
    from public.public_events
    where publication_status = 'published'
    order by start_at asc
  `);

  const events = result.rows.map(toPublicEvent);
  return {
    currentUpcoming: events.filter((event) => event.lifecycle !== "past"),
    past: events.filter((event) => event.lifecycle === "past"),
  };
}

export async function createPublicEventRegistrationInDb(input: {
  eventId: string;
  participantName: string;
  email: string;
  whatsapp: string;
  notes: string;
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
  }>(
    `
      select
        id,
        title,
        start_at,
        end_at,
        registration_deadline,
        event_fee_amount,
        publication_status
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

  const duplicateResult = await client.query<{ exists: boolean }>(
    `
      select exists(
        select 1
        from public.public_event_registrations
        where event_id = $1
          and lower(trim(email)) = lower(trim($2))
          and status <> 'cancelled'
      ) as exists
    `,
    [input.eventId, input.email]
  );

  if (duplicateResult.rows[0]?.exists) {
    throw new Error("User is already registered for this event.");
  }

  const insertResult = await client.query<PublicEventRegistrationRow>(
    `
      insert into public.public_event_registrations (
        event_id,
        participant_name,
        email,
        whatsapp,
        notes,
        amount_due
      ) values ($1, $2, $3, $4, $5, $6)
      returning registration_no
    `,
    [
      input.eventId,
      input.participantName,
      input.email,
      input.whatsapp,
      input.notes || null,
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
