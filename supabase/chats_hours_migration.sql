-- Add is_ai column to conversations to distinguish AI doctors from real doctors
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS is_ai BOOLEAN NOT NULL DEFAULT true;

-- Add minutes_balance to patient profiles to track allocation for real doctor consultations
ALTER TABLE public.patient_profiles ADD COLUMN IF NOT EXISTS minutes_balance NUMERIC DEFAULT 30;
