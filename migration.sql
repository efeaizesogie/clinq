-- Run this script in the Supabase SQL Editor
-- This adds the missing columns to support the dynamic calendar
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time_start TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time_end TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS day_of_week TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN;
