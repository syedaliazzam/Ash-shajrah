import { getPgPool } from "@/lib/postgres";

type InternalEventRow = {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: Date | string;
  scheduled_end: Date | string;
  status: string;
  image_bucket: string | null;
  image_object_path: string | null;
  image_stored_path: string | null;
  image_url: string | null;
  image_path: string | null;
};

export type CurriculumEvent = {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: "scheduled" | "completed" | "cancelled" | string;
  imageUrl: string;
};

function deriveSupabaseUrlFromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
  const hostMatch = databaseUrl.match(/postgres\.([a-z0-9]+)\./i);
  if (hostMatch?.[1]) return `https://${hostMatch[1]}.supabase.co`;

  const userMatch = databaseUrl.match(/postgresql:\/\/postgres\.([a-z0-9]+):/i);
  if (userMatch?.[1]) return `https://${userMatch[1]}.supabase.co`;

  return "";
}

function resolveInternalEventImageUrl(row: InternalEventRow) {
  const directUrl = row.image_url?.trim();
  if (directUrl) return directUrl;

  const stored = row.image_stored_path?.trim() || row.image_path?.trim();
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
      if (remainder.startsWith(`${bucket}/`)) return remainder.slice(bucket.length + 1);
      return remainder.replace(/^[^/]+\//, "");
    }

    if (trimmed.startsWith(`${bucket}/`)) return trimmed.slice(bucket.length + 1);

    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const url = new URL(trimmed);
        return extractObjectPath(url.pathname);
      } catch {
        return "";
      }
    }

    return trimmed;
  };

  if (stored) {
    if (/^https?:\/\//i.test(stored)) return stored;
    if (stored.startsWith("/") && !stored.startsWith("/storage/")) return stored;

    const storedObjectPath = extractObjectPath(stored);
    if (storedObjectPath) {
      const storageUrl = buildStorageUrl(storedObjectPath);
      if (storageUrl) return storageUrl;
    }
  }

  if (objectPath) {
    const storageUrl = buildStorageUrl(extractObjectPath(objectPath));
    if (storageUrl) return storageUrl;
  }

  return "";
}

function toIsoString(value: Date | string) {
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function toCurriculumEvent(row: InternalEventRow): CurriculumEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description?.trim() || "",
    startAt: toIsoString(row.scheduled_start),
    endAt: toIsoString(row.scheduled_end),
    status: row.status,
    imageUrl: resolveInternalEventImageUrl(row),
  };
}

export async function listCurriculumEventsFromDb() {
  const client = getPgPool();
  const result = await client.query<InternalEventRow>(`
    select
      id,
      title,
      description,
      scheduled_start,
      scheduled_end,
      status,
      image_bucket,
      image_object_path,
      image_stored_path,
      image_url,
      image_path
    from public.internal_events
    where status <> 'cancelled'
      and (
        nullif(trim(coalesce(image_url, '')), '') is not null
        or nullif(trim(coalesce(image_object_path, '')), '') is not null
        or nullif(trim(coalesce(image_stored_path, '')), '') is not null
        or nullif(trim(coalesce(image_path, '')), '') is not null
      )
    order by
      case when scheduled_end >= now() then 0 else 1 end,
      scheduled_start desc
    limit 24
  `);

  return result.rows
    .map(toCurriculumEvent)
    .filter((event) => event.imageUrl.trim().length > 0);
}
