import { getPgPool } from "@/lib/postgres";
import { PARENT_INTERVIEW_FORM_VERSION } from "@/lib/parents-interview/questions";
import type { ParentInterviewResponsePayload } from "@/lib/parents-interview/validation";

export type ParentInterviewStatus = "pending" | "submitted" | "reviewed";

export type ParentInterviewSummary = {
  id: string;
  registrationId: string;
  parentName: string;
  parentEmail: string;
  childName: string | null;
  childAge: string | null;
  interestedProgramme: string | null;
  status: ParentInterviewStatus;
  formVersion: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ParentInterviewDetail = ParentInterviewSummary & {
  responses: ParentInterviewResponsePayload | Record<string, unknown> | null;
};

export type ParentInterviewPublicMeta = {
  parentName: string;
  parentEmail: string;
  childName: string | null;
  childAge: string | null;
  interestedProgramme: string | null;
  status: ParentInterviewStatus;
};

type DbRow = {
  id: string;
  registration_id: string;
  parent_name: string;
  parent_email: string;
  child_name: string | null;
  child_age: string | null;
  interested_programme: string | null;
  status: string;
  form_version: string;
  responses: ParentInterviewResponsePayload | Record<string, unknown> | null;
  submitted_at: Date | null;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

const SUMMARY_COLUMNS = `
  id,
  registration_id,
  parent_name,
  parent_email,
  child_name,
  child_age,
  interested_programme,
  status,
  form_version,
  submitted_at,
  reviewed_at,
  created_at,
  updated_at
`;

function mapSummary(row: Omit<DbRow, "responses">): ParentInterviewSummary {
  return {
    id: row.id,
    registrationId: row.registration_id,
    parentName: row.parent_name,
    parentEmail: row.parent_email,
    childName: row.child_name,
    childAge: row.child_age,
    interestedProgramme: row.interested_programme,
    status: row.status as ParentInterviewStatus,
    formVersion: row.form_version || String(PARENT_INTERVIEW_FORM_VERSION),
    submittedAt: row.submitted_at ? row.submitted_at.toISOString() : null,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapDetail(row: DbRow): ParentInterviewDetail {
  return {
    ...mapSummary(row),
    responses: row.responses,
  };
}

let ensured = false;

export async function ensureParentInterviewFormsTable(): Promise<void> {
  if (ensured) return;
  const client = getPgPool();

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.parent_interview_forms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      registration_id TEXT UNIQUE NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      parent_name TEXT NOT NULL,
      parent_email TEXT NOT NULL,
      child_name TEXT,
      child_age TEXT,
      interested_programme TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'submitted', 'reviewed')),
      form_version TEXT NOT NULL DEFAULT '2',
      responses JSONB,
      submitted_at TIMESTAMPTZ,
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_parent_interview_status
      ON public.parent_interview_forms(status);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_parent_interview_parent_email
      ON public.parent_interview_forms(parent_email);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_parent_interview_created_at
      ON public.parent_interview_forms(created_at DESC);
  `);
  await client.query(`
    ALTER TABLE public.parent_interview_forms
    ADD COLUMN IF NOT EXISTS form_version TEXT NOT NULL DEFAULT '2';
  `);

  ensured = true;
}

export async function createParentInterviewForm(input: {
  registrationId: string;
  tokenHash: string;
  parentName: string;
  parentEmail: string;
  childName?: string | null;
  childAge?: string | null;
  interestedProgramme?: string | null;
}): Promise<ParentInterviewSummary> {
  await ensureParentInterviewFormsTable();
  const client = getPgPool();

  const existing = await client.query<Omit<DbRow, "responses">>(
    `
      SELECT ${SUMMARY_COLUMNS}
      FROM public.parent_interview_forms
      WHERE registration_id = $1
      LIMIT 1
    `,
    [input.registrationId]
  );

  if (existing.rows[0]) {
    return mapSummary(existing.rows[0]);
  }

  const result = await client.query<Omit<DbRow, "responses">>(
    `
      INSERT INTO public.parent_interview_forms (
        registration_id,
        token_hash,
        parent_name,
        parent_email,
        child_name,
        child_age,
        interested_programme,
        status,
        form_version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
      RETURNING ${SUMMARY_COLUMNS}
    `,
    [
      input.registrationId,
      input.tokenHash,
      input.parentName,
      input.parentEmail,
      input.childName || null,
      input.childAge || null,
      input.interestedProgramme || null,
      String(PARENT_INTERVIEW_FORM_VERSION),
    ]
  );

  return mapSummary(result.rows[0]);
}

export async function rotateParentInterviewToken(input: {
  registrationId: string;
  tokenHash: string;
}): Promise<ParentInterviewSummary | null> {
  await ensureParentInterviewFormsTable();
  const client = getPgPool();
  const result = await client.query<Omit<DbRow, "responses">>(
    `
      UPDATE public.parent_interview_forms
      SET token_hash = $1,
          form_version = $3,
          updated_at = NOW()
      WHERE registration_id = $2 AND status = 'pending'
      RETURNING ${SUMMARY_COLUMNS}
    `,
    [
      input.tokenHash,
      input.registrationId,
      String(PARENT_INTERVIEW_FORM_VERSION),
    ]
  );
  return result.rows[0] ? mapSummary(result.rows[0]) : null;
}

export async function getParentInterviewByTokenHash(
  tokenHash: string
): Promise<ParentInterviewDetail | null> {
  await ensureParentInterviewFormsTable();
  const client = getPgPool();
  const result = await client.query<DbRow>(
    `
      SELECT ${SUMMARY_COLUMNS}, responses
      FROM public.parent_interview_forms
      WHERE token_hash = $1
      LIMIT 1
    `,
    [tokenHash]
  );
  return result.rows[0] ? mapDetail(result.rows[0]) : null;
}

export async function getParentInterviewPublicMetaByTokenHash(
  tokenHash: string
): Promise<ParentInterviewPublicMeta | null> {
  const row = await getParentInterviewByTokenHash(tokenHash);
  if (!row) return null;
  return {
    parentName: row.parentName,
    parentEmail: row.parentEmail,
    childName: row.childName,
    childAge: row.childAge,
    interestedProgramme: row.interestedProgramme,
    status: row.status,
  };
}

export async function submitParentInterviewByTokenHash(input: {
  tokenHash: string;
  responses: ParentInterviewResponsePayload;
}): Promise<ParentInterviewDetail | null> {
  await ensureParentInterviewFormsTable();
  const client = getPgPool();
  const result = await client.query<DbRow>(
    `
      UPDATE public.parent_interview_forms
      SET
        responses = $1::jsonb,
        status = 'submitted',
        form_version = $3,
        submitted_at = NOW(),
        updated_at = NOW()
      WHERE token_hash = $2
        AND status = 'pending'
      RETURNING ${SUMMARY_COLUMNS}, responses
    `,
    [
      JSON.stringify(input.responses),
      input.tokenHash,
      String(PARENT_INTERVIEW_FORM_VERSION),
    ]
  );
  return result.rows[0] ? mapDetail(result.rows[0]) : null;
}
