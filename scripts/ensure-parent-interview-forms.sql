-- Parents Interview Forms (Supabase Postgres)
-- Shared with external LMS at lms.ashshajrah.com
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

ALTER TABLE public.parent_interview_forms
ADD COLUMN IF NOT EXISTS form_version TEXT NOT NULL DEFAULT '2';

CREATE INDEX IF NOT EXISTS idx_parent_interview_status
  ON public.parent_interview_forms(status);

CREATE INDEX IF NOT EXISTS idx_parent_interview_parent_email
  ON public.parent_interview_forms(parent_email);

CREATE INDEX IF NOT EXISTS idx_parent_interview_created_at
  ON public.parent_interview_forms(created_at DESC);
