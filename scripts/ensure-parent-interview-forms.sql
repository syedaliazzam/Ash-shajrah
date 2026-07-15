-- Parents Interview Forms (Supabase Postgres)
-- Shared with external LMS at lms.ashshajrah.com
-- One row per registration; answers stored in responses JSONB.

CREATE TABLE IF NOT EXISTS public.parent_interview_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  child_name TEXT,
  child_age TEXT,
  interested_programme TEXT,
  form_version INTEGER NOT NULL DEFAULT 2,
  responses JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'reviewed')),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.parent_interview_forms
  ADD COLUMN IF NOT EXISTS form_version INTEGER NOT NULL DEFAULT 2;

ALTER TABLE public.parent_interview_forms
  ADD COLUMN IF NOT EXISTS responses JSONB;

CREATE INDEX IF NOT EXISTS idx_parent_interview_registration
  ON public.parent_interview_forms(registration_id);

CREATE INDEX IF NOT EXISTS idx_parent_interview_parent_email
  ON public.parent_interview_forms(parent_email);

CREATE INDEX IF NOT EXISTS idx_parent_interview_status
  ON public.parent_interview_forms(status);

CREATE INDEX IF NOT EXISTS idx_parent_interview_created_at
  ON public.parent_interview_forms(created_at DESC);
