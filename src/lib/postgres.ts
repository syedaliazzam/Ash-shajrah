import { Pool } from "pg";

let pool: Pool | null = null;
let ensuredInterestedStudentsRegistrationCode = false;

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
  childDob: string;
  level: string;
  city: string;
  country: string;
  message: string;
}): Promise<string> {
  await ensureInterestedStudentsRegistrationCode();
  const client = getPgPool();

  const result = await client.query<{ id: string | number }>(
    `
      insert into public.interested_students (
        student_name,
        parent_name,
        phone,
        email,
        child_name,
        child_dob,
        class_level,
        city,
        country,
        message,
        website,
        registration_source,
        parent_relation,
        gender,
        current_school,
        why_interested,
        heard_about,
        questions_comments
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        '', 'website', null, null, null, null, null, null
      )
      returning coalesce(
        registration_code,
        'ALHA-' || lpad(id::text, 4, '0')
      ) as id
    `,
    [
      input.childName,
      input.parentName,
      input.phone,
      input.email,
      input.childName,
      input.childDob || input.childAge,
      input.level,
      input.city,
      input.country,
      input.message || null,
    ]
  );

  const id = result.rows[0]?.id;
  if (!id) {
    throw new Error("Registration insert did not return an id.");
  }
  return String(id);
}

export async function markInterestedStudentInterviewLinkSent(input: {
  registrationId: string;
  interviewUrl?: string | null;
}): Promise<void> {
  await ensureInterestedStudentsRegistrationCode();
  const client = getPgPool();

  await client.query(`
    ALTER TABLE public.interested_students
      ADD COLUMN IF NOT EXISTS parent_interview_link_sent_at TIMESTAMPTZ;
  `);
  await client.query(`
    ALTER TABLE public.interested_students
      ADD COLUMN IF NOT EXISTS parent_interview_url TEXT;
  `);
  await client.query(`
    ALTER TABLE public.interested_students
      ADD COLUMN IF NOT EXISTS parent_interview_status TEXT;
  `);

  await client.query(
    `
      UPDATE public.interested_students
      SET
        parent_interview_status = 'link_sent',
        parent_interview_link_sent_at = NOW(),
        parent_interview_url = COALESCE($1, parent_interview_url)
      WHERE coalesce(registration_code, 'ALHA-' || lpad(id::text, 4, '0')) = $2
         OR id::text = $2
    `,
    [input.interviewUrl || null, input.registrationId]
  );
}

export async function markInterestedStudentInterviewSubmitted(input: {
  registrationId: string;
}): Promise<void> {
  await ensureInterestedStudentsRegistrationCode();
  const client = getPgPool();

  await client.query(`
    ALTER TABLE public.interested_students
      ADD COLUMN IF NOT EXISTS parent_interview_submitted_at TIMESTAMPTZ;
  `);
  await client.query(`
    ALTER TABLE public.interested_students
      ADD COLUMN IF NOT EXISTS parent_interview_status TEXT;
  `);
  await client.query(
    `
      UPDATE public.interested_students
      SET
        parent_interview_status = 'submitted',
        parent_interview_submitted_at = NOW()
      WHERE coalesce(registration_code, 'ALHA-' || lpad(id::text, 4, '0')) = $1
         OR id::text = $1
    `,
    [input.registrationId]
  );
}

async function ensureInterestedStudentsRegistrationCode(): Promise<void> {
  if (ensuredInterestedStudentsRegistrationCode) return;
  const client = getPgPool();

  await client.query(`
    CREATE SEQUENCE IF NOT EXISTS public.interested_students_registration_code_seq;
  `);

  await client.query(`
    ALTER TABLE public.interested_students
      ADD COLUMN IF NOT EXISTS registration_code TEXT;
  `);
  await client.query(`
    ALTER TABLE public.interested_students
      ADD COLUMN IF NOT EXISTS city TEXT;
  `);
  await client.query(`
    ALTER TABLE public.interested_students
      ADD COLUMN IF NOT EXISTS country TEXT;
  `);

  await client.query(`
    DO $$
    DECLARE
      max_suffix bigint;
    BEGIN
      SELECT COALESCE(
        MAX(NULLIF(regexp_replace(registration_code, '^ALHA-', ''), '')::bigint),
        0
      )
      INTO max_suffix
      FROM public.interested_students
      WHERE registration_code ~ '^ALHA-[0-9]+$';

      PERFORM setval(
        'public.interested_students_registration_code_seq',
        GREATEST(max_suffix, 0) + 1,
        false
      );
    END $$;
  `);

  await client.query(`
    UPDATE public.interested_students
    SET registration_code = 'ALHA-' || lpad(nextval('public.interested_students_registration_code_seq')::text, 4, '0')
    WHERE registration_code IS NULL OR registration_code = '';
  `);

  await client.query(`
    ALTER TABLE public.interested_students
      ALTER COLUMN registration_code
      SET DEFAULT ('ALHA-' || lpad(nextval('public.interested_students_registration_code_seq')::text, 4, '0'));
  `);

  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_interested_students_registration_code
      ON public.interested_students(registration_code);
  `);

  ensuredInterestedStudentsRegistrationCode = true;
}

export async function hasInterestedStudentDuplicate(input: {
  email: string;
  childName: string;
}): Promise<boolean> {
  const client = getPgPool();

  const result = await client.query<{ exists: boolean }>(
    `
      select exists(
        select 1
        from public.interested_students
        where lower(trim(email)) = lower(trim($1))
          and lower(trim(child_name)) = lower(trim($2))
      ) as exists
    `,
    [input.email, input.childName]
  );

  return Boolean(result.rows[0]?.exists);
}

export type ExistingRegistration = {
  id: string;
  parentName: string;
  phone: string;
  email: string;
  childName: string;
  childAge: string;
  childDob: string;
  level: string;
  city: string;
  country: string;
  message: string;
};

export async function getLatestInterestedStudentByEmail(
  email: string
): Promise<ExistingRegistration | null> {
  const client = getPgPool();

  const result = await client.query<{
    id: string | number;
    registration_code: string | null;
    parent_name: string | null;
    phone: string | null;
    email: string | null;
    child_name: string | null;
    child_dob: string | null;
    class_level: string | null;
    city: string | null;
    country: string | null;
    message: string | null;
  }>(
    `
      select
        coalesce(registration_code, 'ALHA-' || lpad(id::text, 4, '0')) as id,
        parent_name,
        phone,
        email,
        child_name,
        child_dob as child_age,
        class_level,
        city,
        country,
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
    childAge: row.child_dob ?? "",
    childDob: row.child_dob ?? "",
    level: row.class_level ?? "",
    city: row.city ?? "",
    country: row.country ?? "",
    message: row.message ?? "",
  };
}

export async function getInterestedStudentById(
  id: string
): Promise<ExistingRegistration | null> {
  const client = getPgPool();

  const result = await client.query<{
    id: string | number;
    registration_code: string | null;
    parent_name: string | null;
    phone: string | null;
    email: string | null;
    child_name: string | null;
    child_dob: string | null;
    class_level: string | null;
    city: string | null;
    country: string | null;
    message: string | null;
  }>(
    `
      select
        coalesce(registration_code, 'ALHA-' || lpad(id::text, 4, '0')) as id,
        parent_name,
        phone,
        email,
        child_name,
        child_dob as child_age,
        class_level,
        city,
        country,
        message
      from public.interested_students
      where id::text = $1
         or registration_code = $1
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
    childAge: row.child_dob ?? "",
    childDob: row.child_dob ?? "",
    level: row.class_level ?? "",
    city: row.city ?? "",
    country: row.country ?? "",
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
  city: string;
  country: string;
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
    child_dob: string | null;
    class_level: string | null;
    city: string | null;
    country: string | null;
  }>(`
    select
      coalesce(i.registration_code, 'ALHA-' || lpad(i.id::text, 4, '0')) as registration_id,
      i.parent_name,
      i.email,
      i.child_name,
      i.child_dob as child_age,
      i.class_level,
      i.city,
      i.country
    from public.interested_students i
    where i.email is not null
      and trim(i.email) <> ''
      and not exists (
        select 1
        from public.parent_interview_forms p
        where p.registration_id = coalesce(i.registration_code, 'ALHA-' || lpad(i.id::text, 4, '0'))
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
    city: row.city ?? "",
    country: row.country ?? "",
  }));
}
