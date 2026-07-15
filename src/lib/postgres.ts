import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Runtime queries use DATABASE_URL (Supabase pooled, port 6543 + pgbouncer=true).
 * DIRECT_URL is reserved for migrations/setup scripts — not for the app pool.
 */
function stripQuotes(url: string): string {
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    return url.slice(1, -1);
  }
  return url;
}

function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL || null;
  if (!raw) return null;

  const url = stripQuotes(raw.trim());

  if (url === "base" || !url.startsWith("postgres")) {
    console.error("Invalid DATABASE_URL configured (value redacted).");
    return null;
  }

  return url;
}

export function getDirectDatabaseUrl(): string | null {
  const raw = process.env.DIRECT_URL || process.env.DATABASE_URL || null;
  if (!raw) return null;
  const url = stripQuotes(raw.trim());
  if (!url.startsWith("postgres")) {
    console.error("Invalid DIRECT_URL configured (value redacted).");
    return null;
  }
  return url;
}

export function getPgPool(): Pool {
  if (pool) return pool;

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("supabase.com")
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return pool;
}

export async function getActiveCoordinatorEmails(): Promise<string[]> {
  const client = getPgPool();

  const result = await client.query<{ email: string | null }>(`
    select distinct lower(trim(u.email)) as email
    from public.coordinator_profiles cp
    join public.users u on u.id = cp.user_id
    where coalesce(cp.status::text, 'active') = 'active'
      and u.email is not null
      and trim(u.email) <> ''
  `);

  return result.rows
    .map((row) => row.email?.trim())
    .filter((email): email is string => Boolean(email));
}

export async function insertInterestedStudent(input: {
  parentName: string;
  phone: string;
  email: string;
  childName: string;
  childAge: string;
  level: string;
  cityCountry: string;
  message: string;
}): Promise<string> {
  const client = getPgPool();

  const result = await client.query<{ id: string | number }>(
    `
      insert into public.interested_students (
        student_name,
        parent_name,
        phone,
        email,
        child_name,
        child_age,
        class_level,
        city_country,
        message,
        website,
        registration_source,
        parent_relation,
        gender,
        child_dob,
        current_school,
        class_applying_for,
        why_interested,
        heard_about,
        questions_comments
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        '', 'website', null, null, null, null, $6, null, null, null
      )
      returning id::text as id
    `,
    [
      input.childName,
      input.parentName,
      input.phone,
      input.email,
      input.childName,
      input.childAge,
      input.level,
      input.cityCountry,
      input.message || null,
    ]
  );

  const id = result.rows[0]?.id;
  if (!id) {
    throw new Error("Registration insert did not return an id.");
  }
  return String(id);
}
