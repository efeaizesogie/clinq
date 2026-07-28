-- Run this script in the Supabase SQL Editor
-- This adds the missing columns to support the dynamic calendar
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time_start TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time_end TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS day_of_week TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN;

-- ─── STAFF DIRECTORY CONFIGURATION ───────────────────────────
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS retention_rate NUMERIC(4, 1) NOT NULL DEFAULT 95.0;
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT 'CONSULTANT';
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS shift TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.department_performance (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  location     TEXT NOT NULL DEFAULT '',
  head_of_dept TEXT NOT NULL DEFAULT '',
  staff_count  INTEGER NOT NULL DEFAULT 0,
  throughput   TEXT NOT NULL DEFAULT '',
  efficiency   INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'Optimal',
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.department_performance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'department_performance' AND policyname = 'Public read department_performance'
    ) THEN
        CREATE POLICY "Public read department_performance" ON public.department_performance FOR SELECT USING (true);
    END IF;
END
$$;

ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS image_url TEXT;
