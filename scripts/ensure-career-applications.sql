-- Career applications — Supabase Postgres only (resume stored as BYTEA)
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

-- Remove external storage / legacy columns if they still exist
ALTER TABLE public.career_applications
  DROP COLUMN IF EXISTS resume_file_key,
  DROP COLUMN IF EXISTS resume_file_url,
  DROP COLUMN IF EXISTS linkedin,
  DROP COLUMN IF EXISTS portfolio;

ALTER TABLE public.career_applications
  ADD COLUMN IF NOT EXISTS resume_file_data BYTEA,
  ADD COLUMN IF NOT EXISTS resume_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS resume_size_bytes INTEGER;

CREATE INDEX IF NOT EXISTS career_applications_submitted_at_idx
  ON public.career_applications (submitted_at DESC);

CREATE INDEX IF NOT EXISTS career_applications_status_idx
  ON public.career_applications (status);

CREATE INDEX IF NOT EXISTS career_applications_email_idx
  ON public.career_applications (lower(email));
