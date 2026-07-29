-- ============================================================
-- Clinq — Combined Migration
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns to specialists (if not already present)
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS gender    TEXT     DEFAULT 'Male';
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS languages TEXT[]   DEFAULT ARRAY['English'];
ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create specialist_availability table (weekly schedule templates)
--    day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday,
--                 4=Thursday, 5=Friday, 6=Saturday
CREATE TABLE IF NOT EXISTS public.specialist_availability (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  specialist_id UUID NOT NULL REFERENCES public.specialists(id) ON DELETE CASCADE,
  day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_slots    TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(specialist_id, day_of_week)
);

ALTER TABLE public.specialist_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read specialist_availability"
  ON public.specialist_availability FOR SELECT USING (true);

CREATE POLICY "Admin or service role can insert specialist_availability"
  ON public.specialist_availability FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin or service role can update specialist_availability"
  ON public.specialist_availability FOR UPDATE USING (true);

-- 3. Ensure specialist_schedules exists with correct unique constraint
CREATE TABLE IF NOT EXISTS public.specialist_schedules (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  specialist_id  UUID NOT NULL REFERENCES public.specialists(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  date_val       INTEGER NOT NULL,
  time_slot      TEXT NOT NULL,
  is_booked      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(specialist_id, available_date, time_slot)
);

ALTER TABLE public.specialist_schedules ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'specialist_schedules' AND policyname = 'Public read specialist_schedules'
  ) THEN
    CREATE POLICY "Public read specialist_schedules"
      ON public.specialist_schedules FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'specialist_schedules' AND policyname = 'Authenticated users or admin can update specialist_schedules'
  ) THEN
    CREATE POLICY "Authenticated users or admin can update specialist_schedules"
      ON public.specialist_schedules FOR UPDATE USING (
        (auth.role() = 'authenticated') OR
        (auth.jwt()->'user_metadata'->>'role') = 'admin'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'specialist_schedules' AND policyname = 'Admin or service role can insert specialist_schedules'
  ) THEN
    CREATE POLICY "Admin or service role can insert specialist_schedules"
      ON public.specialist_schedules FOR INSERT WITH CHECK (true);
  END IF;
END
$$;
