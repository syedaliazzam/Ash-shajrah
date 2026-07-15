import { randomUUID } from "crypto";
import { getPgPool } from "@/lib/postgres";
import type { CareerStatus } from "@/lib/careers";
import { sanitizeFileName } from "@/lib/careers";
import { getLmsCareersAdminUrl } from "@/lib/lms-url";

export type CareerApplicationRow = {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  interestedRole: string;
  message: string | null;
  resumeFileName: string;
  resumeMimeType: string;
  resumeSizeBytes: number;
  source: string;
  status: CareerStatus;
  adminNotes: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type CareerResumeFile = {
  resumeFileName: string;
  resumeMimeType: string;
  resumeFileData: Buffer;
};

/** Safe payload for admin UI — never includes resume binary. */
export type AdminCareerApplication = CareerApplicationRow & {
  resumeAccessPath: string;
};

export function toAdminCareerApplication(
  row: CareerApplicationRow
): AdminCareerApplication {
  return {
    ...row,
    resumeAccessPath: getLmsCareersAdminUrl(row.id),
  };
}

type DbMetaRow = {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  interested_role: string;
  message: string | null;
  resume_file_name: string;
  resume_mime_type: string;
  resume_size_bytes: number;
  source: string;
  status: string;
  admin_notes: string | null;
  submitted_at: Date;
  updated_at: Date;
};

const META_COLUMNS = `
  id,
  full_name,
  email,
  whatsapp,
  interested_role,
  message,
  resume_file_name,
  resume_mime_type,
  resume_size_bytes,
  source,
  status,
  admin_notes,
  submitted_at,
  updated_at
`;

function mapMetaRow(row: DbMetaRow): CareerApplicationRow {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    interestedRole: row.interested_role,
    message: row.message,
    resumeFileName: row.resume_file_name,
    resumeMimeType: row.resume_mime_type,
    resumeSizeBytes: Number(row.resume_size_bytes),
    source: row.source,
    status: row.status as CareerStatus,
    adminNotes: row.admin_notes,
    submittedAt: row.submitted_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

let ensured = false;

export async function ensureCareerApplicationsTable(): Promise<void> {
  if (ensured) return;
  const client = getPgPool();

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.career_applications (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      interested_role TEXT NOT NULL,
      message TEXT,
      resume_file_name TEXT NOT NULL,
      resume_mime_type TEXT NOT NULL,
      resume_size_bytes INTEGER NOT NULL,
      resume_file_data BYTEA NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      admin_notes TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Migrate away from external blob / optional-link columns if present.
  await client.query(`
    ALTER TABLE public.career_applications
      DROP COLUMN IF EXISTS resume_file_key,
      DROP COLUMN IF EXISTS resume_file_url,
      DROP COLUMN IF EXISTS linkedin,
      DROP COLUMN IF EXISTS portfolio;
  `);

  await client.query(`
    ALTER TABLE public.career_applications
      ADD COLUMN IF NOT EXISTS resume_file_data BYTEA,
      ADD COLUMN IF NOT EXISTS resume_mime_type TEXT,
      ADD COLUMN IF NOT EXISTS resume_size_bytes INTEGER;
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS career_applications_submitted_at_idx
      ON public.career_applications (submitted_at DESC);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS career_applications_status_idx
      ON public.career_applications (status);
  `);

  ensured = true;
}

export async function insertCareerApplication(input: {
  fullName: string;
  email: string;
  whatsapp: string;
  interestedRole: string;
  message?: string | null;
  resumeFileName: string;
  resumeMimeType: string;
  resumeSizeBytes: number;
  resumeFileData: Buffer;
  source: string;
}): Promise<CareerApplicationRow> {
  await ensureCareerApplicationsTable();
  const client = getPgPool();
  const id = randomUUID();
  const safeName =
    sanitizeFileName(input.resumeFileName) || "resume.pdf";

  const result = await client.query<DbMetaRow>(
    `
      INSERT INTO public.career_applications (
        id,
        full_name,
        email,
        whatsapp,
        interested_role,
        message,
        resume_file_name,
        resume_mime_type,
        resume_size_bytes,
        resume_file_data,
        source,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'new'
      )
      RETURNING ${META_COLUMNS}
    `,
    [
      id,
      input.fullName,
      input.email,
      input.whatsapp,
      input.interestedRole,
      input.message || null,
      safeName,
      input.resumeMimeType,
      input.resumeSizeBytes,
      input.resumeFileData,
      input.source,
    ]
  );

  return mapMetaRow(result.rows[0]);
}

export async function listCareerApplications(filters: {
  status?: string;
  interestedRole?: string;
  source?: string;
  search?: string;
}): Promise<CareerApplicationRow[]> {
  await ensureCareerApplicationsTable();
  const client = getPgPool();
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }
  if (filters.interestedRole) {
    values.push(filters.interestedRole);
    clauses.push(`interested_role = $${values.length}`);
  }
  if (filters.source) {
    values.push(filters.source);
    clauses.push(`source = $${values.length}`);
  }
  if (filters.search?.trim()) {
    values.push(`%${filters.search.trim().toLowerCase()}%`);
    const i = values.length;
    clauses.push(
      `(lower(full_name) LIKE $${i} OR lower(email) LIKE $${i} OR lower(whatsapp) LIKE $${i} OR lower(interested_role) LIKE $${i})`
    );
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await client.query<DbMetaRow>(
    `
      SELECT ${META_COLUMNS}
      FROM public.career_applications
      ${where}
      ORDER BY submitted_at DESC
    `,
    values
  );

  return result.rows.map(mapMetaRow);
}

export async function getCareerApplicationById(
  id: string
): Promise<CareerApplicationRow | null> {
  await ensureCareerApplicationsTable();
  const client = getPgPool();
  const result = await client.query<DbMetaRow>(
    `
      SELECT ${META_COLUMNS}
      FROM public.career_applications
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );
  return result.rows[0] ? mapMetaRow(result.rows[0]) : null;
}

export async function getCareerResumeById(
  id: string
): Promise<CareerResumeFile | null> {
  await ensureCareerApplicationsTable();
  const client = getPgPool();
  const result = await client.query<{
    resume_file_name: string;
    resume_mime_type: string;
    resume_file_data: Buffer;
  }>(
    `
      SELECT resume_file_name, resume_mime_type, resume_file_data
      FROM public.career_applications
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  const row = result.rows[0];
  if (!row?.resume_file_data) return null;

  return {
    resumeFileName: row.resume_file_name,
    resumeMimeType: row.resume_mime_type,
    resumeFileData: Buffer.isBuffer(row.resume_file_data)
      ? row.resume_file_data
      : Buffer.from(row.resume_file_data),
  };
}

export async function updateCareerApplication(
  id: string,
  input: { status?: CareerStatus; adminNotes?: string | null }
): Promise<CareerApplicationRow | null> {
  await ensureCareerApplicationsTable();
  const client = getPgPool();
  const sets: string[] = ["updated_at = NOW()"];
  const values: unknown[] = [];

  if (input.status !== undefined) {
    values.push(input.status);
    sets.push(`status = $${values.length}`);
  }
  if (input.adminNotes !== undefined) {
    values.push(input.adminNotes);
    sets.push(`admin_notes = $${values.length}`);
  }

  values.push(id);
  const result = await client.query<DbMetaRow>(
    `
      UPDATE public.career_applications
      SET ${sets.join(", ")}
      WHERE id = $${values.length}
      RETURNING ${META_COLUMNS}
    `,
    values
  );

  return result.rows[0] ? mapMetaRow(result.rows[0]) : null;
}
