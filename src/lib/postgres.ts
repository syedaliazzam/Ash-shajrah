import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Runtime queries prefer DATABASE_URL (pooled connection).
 * Fall back to DIRECT_URL so production still works when only the direct URL
 * is configured in Vercel.
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
  const raw = process.env.DATABASE_URL || process.env.DIRECT_URL || null;
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

export type ExistingRegistration = {
  id: string;
  parentName: string;
  phone: string;
  email: string;
  childName: string;
  childAge: string;
  level: string;
  cityCountry: string;
  message: string;
};

export async function getLatestInterestedStudentByEmail(
  email: string
): Promise<ExistingRegistration | null> {
  const client = getPgPool();

  const result = await client.query<{
    id: string | number;
    parent_name: string | null;
    phone: string | null;
    email: string | null;
    child_name: string | null;
    child_age: string | null;
    class_level: string | null;
    city_country: string | null;
    message: string | null;
  }>(
    `
      select
        id::text as id,
        parent_name,
        phone,
        email,
        child_name,
        child_age,
        class_level,
        city_country,
        message
      from public.interested_students
      where lower(trim(email)) = lower(trim($1))
      order by id desc
      limit 1
    `,
    [email]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: String(row.id),
    parentName: row.parent_name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? email,
    childName: row.child_name ?? "",
    childAge: row.child_age ?? "",
    level: row.class_level ?? "",
    cityCountry: row.city_country ?? "",
    message: row.message ?? "",
  };
}

export async function getInterestedStudentById(
  id: string
): Promise<ExistingRegistration | null> {
  const client = getPgPool();

  const result = await client.query<{
    id: string | number;
    parent_name: string | null;
    phone: string | null;
    email: string | null;
    child_name: string | null;
    child_age: string | null;
    class_level: string | null;
    city_country: string | null;
    message: string | null;
  }>(
    `
      select
        id::text as id,
        parent_name,
        phone,
        email,
        child_name,
        child_age,
        class_level,
        city_country,
        message
      from public.interested_students
      where id::text = $1
      limit 1
    `,
    [id]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: String(row.id),
    parentName: row.parent_name ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    childName: row.child_name ?? "",
    childAge: row.child_age ?? "",
    level: row.class_level ?? "",
    cityCountry: row.city_country ?? "",
    message: row.message ?? "",
  };
}

export type PendingParentInterviewCandidate = {
  registrationId: string;
  parentName: string;
  email: string;
  childName: string;
  childAge: string;
  level: string;
};

export async function listPendingParentInterviewCandidates(): Promise<
  PendingParentInterviewCandidate[]
> {
  const client = getPgPool();

  const result = await client.query<{
    registration_id: string | number;
    parent_name: string | null;
    email: string | null;
    child_name: string | null;
    child_age: string | null;
    class_level: string | null;
  }>(`
    select
      i.id::text as registration_id,
      i.parent_name,
      i.email,
      i.child_name,
      i.child_age,
      i.class_level
    from public.interested_students i
    where i.email is not null
      and trim(i.email) <> ''
      and not exists (
        select 1
        from public.parent_interview_forms p
        where p.registration_id = i.id::text
      )
    order by i.id desc
  `);

  return result.rows.map((row) => ({
    registrationId: String(row.registration_id),
    parentName: row.parent_name ?? "",
    email: row.email ?? "",
    childName: row.child_name ?? "",
    childAge: row.child_age ?? "",
    level: row.class_level ?? "",
  }));
}
