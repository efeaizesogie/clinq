-- ============================================================
-- Clinq Patient Portal — Schema & Vitals tables
-- ============================================================

-- 1. Patient Profiles (Vital signs and demographics)
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL,
  phone_number        TEXT,
  date_birth          DATE,
  avatar_url          TEXT,
  gender              TEXT NOT NULL DEFAULT 'Unknown',
  height_inches       NUMERIC(4,1) DEFAULT 70.0,
  weight_lbs          NUMERIC(5,1) DEFAULT 180.0,
  heart_rate_bpm      INTEGER DEFAULT 72,
  blood_pressure_mmhg TEXT DEFAULT '120/80',
  blood_group         TEXT,
  allergies_count     INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and add policies
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.patient_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.patient_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.patient_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Patient Allergies
CREATE TABLE IF NOT EXISTS public.patient_allergies (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergy_name TEXT NOT NULL,
  reaction     TEXT NOT NULL,
  severity     TEXT NOT NULL DEFAULT 'Mild',
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own allergies" ON public.patient_allergies
  FOR ALL USING (auth.uid() = patient_id);

-- 3. Patient Immunizations
CREATE TABLE IF NOT EXISTS public.patient_immunizations (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  date_administered DATE NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_immunizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own immunizations" ON public.patient_immunizations
  FOR ALL USING (auth.uid() = patient_id);

-- 4. Patient Prescriptions
CREATE TABLE IF NOT EXISTS public.patient_prescriptions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name   TEXT NOT NULL,
  dosage            TEXT NOT NULL,
  frequency         TEXT NOT NULL,
  expires           TEXT NOT NULL,
  refills_remaining TEXT NOT NULL DEFAULT '0 Refills',
  action_label      TEXT NOT NULL DEFAULT 'Request Refill',
  status            TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Completed', 'Expired'
  prescriber        TEXT NOT NULL DEFAULT 'Dr. Aris Thorne',
  prescribed_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  form              TEXT, -- e.g. "500mg Oral Capsule"
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own prescriptions" ON public.patient_prescriptions
  FOR ALL USING (auth.uid() = patient_id);

-- 5. Patient Lab Results
CREATE TABLE IF NOT EXISTS public.patient_lab_results (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  date        TEXT NOT NULL,
  provider    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Reviewed'
  status_bg   TEXT DEFAULT 'bg-[#DCE9FF]',
  status_text TEXT DEFAULT 'text-[#42474F]',
  file_url    TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own lab results" ON public.patient_lab_results
  FOR ALL USING (auth.uid() = patient_id);

-- 6. Patient Medical History Timeline Events
CREATE TABLE IF NOT EXISTS public.patient_timeline_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  event_date  DATE NOT NULL,
  category    TEXT NOT NULL, -- 'Surgical', 'Diagnostic', 'Treatment', 'Consultation'
  description TEXT NOT NULL,
  file_name   TEXT,
  file_url    TEXT,
  status      TEXT DEFAULT 'Completed',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own timeline" ON public.patient_timeline_events
  FOR ALL USING (auth.uid() = patient_id);

-- 7. Patient Billing (Invoices)
CREATE TABLE IF NOT EXISTS public.patient_billing (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date         TEXT NOT NULL,
  service      TEXT NOT NULL,
  amount       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'Pending', -- 'Paid', 'Pending'
  status_color TEXT NOT NULL DEFAULT 'bg-[#FFDAD6] text-[#93000A]',
  invoice_url  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own billing" ON public.patient_billing
  FOR ALL USING (auth.uid() = patient_id);

-- 8. Patient Payment Methods
CREATE TABLE IF NOT EXISTS public.patient_payment_methods (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'card', -- 'card', 'bank'
  card_brand  TEXT,
  last_four   TEXT NOT NULL,
  expiration  TEXT NOT NULL,
  bank_name   TEXT,
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own payment methods" ON public.patient_payment_methods
  FOR ALL USING (auth.uid() = patient_id);

-- 9. Patient Insurance Cards
CREATE TABLE IF NOT EXISTS public.patient_insurance (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  carrier      TEXT NOT NULL,
  member_id    TEXT NOT NULL,
  group_number TEXT NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_insurance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own insurance" ON public.patient_insurance
  FOR ALL USING (auth.uid() = patient_id);

-- 10. Patient Settings & Notification Preferences
CREATE TABLE IF NOT EXISTS public.patient_settings (
  patient_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_auth          BOOLEAN DEFAULT false,
  theme                    TEXT NOT NULL DEFAULT 'light',
  language                 TEXT NOT NULL DEFAULT 'English (United States)',
  notif_appointments_email BOOLEAN DEFAULT true,
  notif_appointments_sms   BOOLEAN DEFAULT true,
  notif_appointments_push  BOOLEAN DEFAULT true,
  notif_labs_email         BOOLEAN DEFAULT true,
  notif_labs_sms           BOOLEAN DEFAULT false,
  notif_labs_push          BOOLEAN DEFAULT true,
  notif_billing_email      BOOLEAN DEFAULT true,
  notif_billing_sms        BOOLEAN DEFAULT false,
  notif_billing_push       BOOLEAN DEFAULT false,
  created_at               TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own settings" ON public.patient_settings
  FOR ALL USING (auth.uid() = patient_id);

-- 11. Patient Menu Items (Dynamically loaded sidebar/bottom items)
CREATE TABLE IF NOT EXISTS public.patient_menus (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label      TEXT NOT NULL,
  href       TEXT NOT NULL UNIQUE,
  icon       TEXT, -- lucide icon identifier
  svg_icon   TEXT, -- relative SVG path
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_bottom  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.patient_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read menus" ON public.patient_menus
  FOR SELECT TO authenticated USING (true);

-- 12. Conversations (Messaging rooms)
CREATE TABLE IF NOT EXISTS public.conversations (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_a           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Patient
  participant_b_name      TEXT NOT NULL, -- Doctor / dept name
  participant_b_initials  TEXT NOT NULL DEFAULT '',
  participant_b_avatar_bg TEXT NOT NULL DEFAULT 'bg-[#DCE9FF]',
  online                  BOOLEAN NOT NULL DEFAULT false,
  dimmed                  BOOLEAN NOT NULL DEFAULT false,
  is_billing              BOOLEAN NOT NULL DEFAULT false,
  last_message_at         TIMESTAMPTZ DEFAULT now(),
  created_at              TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = participant_a);

-- 13. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL if doctor / dept / system
  sender_name     TEXT NOT NULL,
  text            TEXT NOT NULL,
  attachment_name TEXT,
  attachment_url  TEXT,
  attachment_size TEXT,
  attachment_type TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access messages inside own conversations" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE public.conversations.id = messages.conversation_id
      AND public.conversations.participant_a = auth.uid()
    )
  );

-- 14. Add patient_id to public.appointments to support secure lookup
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS and policies on public.appointments
DROP POLICY IF EXISTS "Public read appointments" ON public.appointments;

CREATE POLICY "Users can read own appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = patient_id OR 
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    patient_id IS NULL
  );

CREATE POLICY "Users can insert own appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    auth.uid() = patient_id OR 
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Users can update own appointments" ON public.appointments
  FOR UPDATE USING (
    auth.uid() = patient_id OR 
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

CREATE POLICY "Users can delete own appointments" ON public.appointments
  FOR DELETE USING (
    auth.uid() = patient_id OR 
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- 15. Trigger to automatically provision patient_profile and patient_settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_patient_signup()
RETURNS trigger AS $$
BEGIN
  -- Insert into profile
  INSERT INTO public.patient_profiles (id, full_name, gender)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'fullName', 'New Patient'),
    COALESCE(new.raw_user_meta_data->>'gender', 'Unknown')
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert into settings
  INSERT INTO public.patient_settings (patient_id)
  VALUES (new.id)
  ON CONFLICT (patient_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_patient_signup();

-- 16. Specialist Schedules (Selectable time slots for appointments)
ALTER TABLE IF EXISTS public.specialists ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS public.specialists ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male';
ALTER TABLE IF EXISTS public.specialists ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['English'];

CREATE TABLE IF NOT EXISTS public.specialist_schedules (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  specialist_id  UUID NOT NULL REFERENCES public.specialists(id) ON DELETE CASCADE,
  available_date DATE NOT NULL, -- e.g. '2024-10-21'
  date_val       INTEGER NOT NULL, -- e.g. 21
  time_slot      TEXT NOT NULL,
  is_booked      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(specialist_id, available_date, time_slot)
);

-- Enable Row Level Security on specialist_schedules
ALTER TABLE public.specialist_schedules ENABLE ROW LEVEL SECURITY;

-- Allow public read access to see specialist schedules
CREATE POLICY "Public read specialist_schedules" ON public.specialist_schedules
  FOR SELECT USING (true);

-- Allow authenticated users or admin to book/update slot availability
CREATE POLICY "Authenticated users or admin can update specialist_schedules" ON public.specialist_schedules
  FOR UPDATE USING (
    (auth.role() = 'authenticated') OR 
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- Allow inserting schedules for seeding (admin/service-role)
CREATE POLICY "Admin or service role can insert specialist_schedules" ON public.specialist_schedules
  FOR INSERT WITH CHECK (true);

