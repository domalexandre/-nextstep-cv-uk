ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS completed_at timestamptz;
