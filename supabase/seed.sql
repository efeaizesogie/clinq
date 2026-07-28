-- ============================================================
-- Clinq Platform — Database Schema & Seed Data
-- Run this in the Supabase SQL Editor to set up all tables.
-- ============================================================

-- ─── DEPARTMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon_name   TEXT NOT NULL DEFAULT 'Stethoscope',
  doctors_count INTEGER NOT NULL DEFAULT 0,
  category    TEXT NOT NULL DEFAULT 'Specialty',  -- 'Primary Care', 'Specialty', 'Clinical'
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read departments"
  ON departments FOR SELECT
  USING (true);

-- ─── SPECIALISTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS specialists (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name         TEXT NOT NULL,
  specialty         TEXT NOT NULL,
  department_id     UUID REFERENCES departments(id) ON DELETE SET NULL,
  experience        TEXT NOT NULL DEFAULT '',
  rating            NUMERIC(3,1) NOT NULL DEFAULT 0.0,
  bio               TEXT NOT NULL DEFAULT '',
  initials          TEXT NOT NULL DEFAULT '',
  color_grad        TEXT NOT NULL DEFAULT 'from-blue-600 to-indigo-800',
  is_available      BOOLEAN NOT NULL DEFAULT true,
  availability_text TEXT NOT NULL DEFAULT 'AVAILABLE TODAY',
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read specialists"
  ON specialists FOR SELECT
  USING (true);

-- ─── BLOG POSTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category     TEXT NOT NULL DEFAULT 'NEWS',
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  slug         TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read blog_posts"
  ON blog_posts FOR SELECT
  USING (true);


-- ============================================================
-- SEED DATA — Mirrors the current mockData so nothing is lost
-- ============================================================

-- Departments
INSERT INTO departments (name, slug, description, icon_name, doctors_count, category) VALUES
  ('Cardiology',    'cardiology',    'Comprehensive heart care including diagnostic screenings, interventional procedures, and advanced cardiac…',                    'HeartPulse', 5, 'Specialty'),
  ('Neurology',     'neurology',     'Expert diagnosis and treatment for disorders of the nervous system, specializing in complex neurological…',                    'Brain',      4, 'Specialty'),
  ('Pediatrics',    'pediatrics',    'Dedicated care for infants, children, and adolescents, focusing on physical growth, developmental milestones, and…',          'Baby',       6, 'Primary Care'),
  ('Dermatology',   'dermatology',   'Advanced skincare solutions ranging from medical dermatology for chronic conditions to state-of-the-art cosmetic',             'Sparkles',   3, 'Clinical'),
  ('Orthopedics',   'orthopedics',   'Specialized care for bones, joints, ligaments, tendons, and muscles, including joint replacement surgeries…',                 'Activity',   5, 'Specialty'),
  ('Ophthalmology', 'ophthalmology', 'Comprehensive eye care and surgical expertise for vision restoration, glaucoma treatment, and advanced…',                     'Eye',        4, 'Clinical')
ON CONFLICT (slug) DO NOTHING;

-- Specialists (using subqueries to link by department name)
INSERT INTO specialists (full_name, specialty, department_id, experience, rating, bio, initials, color_grad, is_available, availability_text) VALUES
  ('Dr. Aris Thorne',   'Senior Cardiology Surgeon',   (SELECT id FROM departments WHERE slug='cardiology'),   '15+ Years', 4.9, 'Specializing in minimally invasive cardiac surgery and heart failure management with a focus on...',           'AT', 'from-blue-600 to-indigo-800',   true,  'AVAILABLE TODAY'),
  ('Dr. Elena Vance',   'Neurology Specialist',        (SELECT id FROM departments WHERE slug='neurology'),    '12+ Years', 4.8, 'Expert in neurodegenerative disorders and advanced migraine treatments using state-of-...',                    'EV', 'from-purple-600 to-indigo-800', true,  'AVAILABLE TODAY'),
  ('Dr. Julian Marc',   'Pediatrics Lead',             (SELECT id FROM departments WHERE slug='pediatrics'),   '10+ Years', 4.7, 'Dedicated to holistic child healthcare from infancy through adolescence, specializing in...',                 'JM', 'from-emerald-500 to-teal-700',  true,  'AVAILABLE TODAY'),
  ('Dr. Sarah Jenkins', 'Interventional Cardiologist', (SELECT id FROM departments WHERE slug='cardiology'),   '8 Years',   4.9, 'Pioneered heart rhythm diagnostics and coronary angioplasty therapeutic treatments.',                         'SJ', 'from-teal-600 to-blue-800',     false, 'NEXT SLOT: MON'),
  ('Dr. Marcus Vance',  'Orthopedics Surgeon',         (SELECT id FROM departments WHERE slug='orthopedics'),  '14+ Years', 4.8, 'Specializes in athletic joint reconstructive surgery and complex bone pathology therapeutic models.',         'MV', 'from-orange-500 to-rose-700',   true,  'AVAILABLE TODAY'),
  ('Dr. Clara Shore',   'Clinical Dermatologist',      (SELECT id FROM departments WHERE slug='dermatology'),  '11 Years',  4.9, 'Focuses on chronic skin restoration therapeutics, oncology screening, and cosmetic micro-sessions.',          'CS', 'from-pink-500 to-purple-800',   false, 'NEXT SLOT: WED');

-- Blog Posts
INSERT INTO blog_posts (category, title, description, slug, published_at) VALUES
  ('GUIDE', 'Flu Season Guide 2024',      'Protect yourself and your family with these 5 essential steps for the upcoming winter season.',               'flu-season-guide-2024',      '2024-10-15'),
  ('NEWS',  'New Wellness Wing Open',     'We are excited to announce the grand opening of our advanced physical therapy and wellness center.',          'new-wellness-wing-open',     '2024-09-28'),
  ('TIPS',  'Understanding Heart Health', 'Dr. Arya Sharma shares lifestyle changes that significantly improve cardiovascular longevity.',               'understanding-heart-health', '2024-09-10')
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- ADMIN DASHBOARD TABLES
-- ============================================================

-- ─── PATIENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name    TEXT NOT NULL,
  age          INTEGER NOT NULL DEFAULT 0,
  gender       TEXT NOT NULL DEFAULT 'Unknown',
  admission_id TEXT NOT NULL UNIQUE,
  department   TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'Stable',  -- 'Stable' | 'Critical' | 'Observation' | 'Discharged'
  bpm          INTEGER NOT NULL DEFAULT 72,
  spo2         INTEGER NOT NULL DEFAULT 98,
  admitted_at  TIMESTAMPTZ DEFAULT now(),
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read patients" ON patients FOR SELECT USING (true);

-- ─── APPOINTMENTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name   TEXT NOT NULL,
  specialist_id  UUID REFERENCES specialists(id) ON DELETE SET NULL,
  department     TEXT NOT NULL DEFAULT '',
  scheduled_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  status         TEXT NOT NULL DEFAULT 'Pending',  -- 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read appointments" ON appointments FOR SELECT USING (true);

-- ─── STAFF MEMBERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_members (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name  TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT '',
  department TEXT NOT NULL DEFAULT '',
  is_on_duty BOOLEAN NOT NULL DEFAULT true,
  initials   TEXT NOT NULL DEFAULT '',
  color_bg   TEXT NOT NULL DEFAULT '#D2E4FF',
  color_text TEXT NOT NULL DEFAULT '#00355F',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read staff_members" ON staff_members FOR SELECT USING (true);

-- ─── SEED PATIENTS ───────────────────────────────────────────
INSERT INTO patients (full_name, age, gender, admission_id, department, status, bpm, spo2) VALUES
  ('Robert J. Henderson', 52, 'Male',   '#ADM-9021', 'Cardiology',  'Stable',      72,  98),
  ('Elena Lockwood',      29, 'Female', '#ADM-8842', 'Emergency',   'Critical',    114, 89),
  ('Marcus K. Chen',      41, 'Male',   '#ADM-9055', 'Neurology',   'Observation', 68,  99)
ON CONFLICT (admission_id) DO NOTHING;

-- ─── SEED APPOINTMENTS ───────────────────────────────────────
INSERT INTO appointments (patient_name, department, scheduled_at, status) VALUES
  ('Robert J. Henderson', 'Cardiology',  now() - interval '2 hours',  'Confirmed'),
  ('Elena Lockwood',      'Emergency',   now() - interval '1 hour',   'Confirmed'),
  ('Marcus K. Chen',      'Neurology',   now() - interval '30 minutes','Confirmed'),
  ('Priya Nair',          'Pediatrics',  now() + interval '1 hour',   'Pending'),
  ('James Okafor',        'Orthopedics', now() + interval '2 hours',  'Pending'),
  ('Sofia Reyes',         'Dermatology', now() + interval '3 hours',  'Pending'),
  ('Tom Briggs',          'Cardiology',  now() + interval '4 hours',  'Pending'),
  ('Amara Diallo',        'Neurology',   now() + interval '5 hours',  'Pending'),
  ('Chen Wei',            'Ophthalmology',now() + interval '6 hours', 'Pending'),
  ('Fatima Al-Hassan',    'Cardiology',  now() + interval '7 hours',  'Pending'),
  ('David Osei',          'Emergency',   now() + interval '8 hours',  'Pending'),
  ('Lena Müller',         'Pediatrics',  now() + interval '9 hours',  'Pending')
ON CONFLICT DO NOTHING;

-- ─── SEED STAFF MEMBERS ──────────────────────────────────────
INSERT INTO staff_members (full_name, role, department, is_on_duty, initials, color_bg, color_text) VALUES
  ('Dr. Sarah Vance',   'Chief Surgeon', 'Surgery',    true,  'SV', '#D2E4FF', '#00355F'),
  ('Dr. Michael Thorne','Cardiologist',  'Cardiology', true,  'MT', '#D5E3FC', '#00355F'),
  ('NP Jamie Rollins',  'ER Triage',     'Emergency',  true,  'JR', '#D4E6E5', '#576867'),
  ('Dr. Alan Gregson',  'Pediatrician',  'Pediatrics', false, 'AG', '#E0E3E5', '#42474F')
ON CONFLICT DO NOTHING;

-- ─── PATIENT RECORDS (Admin Directory) ──────────────────────
CREATE TABLE IF NOT EXISTS patient_records (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name        TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  age              INTEGER NOT NULL DEFAULT 0,
  gender           TEXT NOT NULL DEFAULT 'Unknown',
  medical_id       TEXT NOT NULL UNIQUE,
  assigned_doctor  TEXT NOT NULL DEFAULT '',
  department       TEXT NOT NULL DEFAULT '',
  last_visit       TEXT NOT NULL DEFAULT '',
  admission_status TEXT NOT NULL DEFAULT 'Inpatient',
  status           TEXT NOT NULL DEFAULT 'Active',
  insurance        TEXT NOT NULL DEFAULT '',
  initials         TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read patient_records"  ON patient_records FOR SELECT USING (true);
CREATE POLICY "Public insert patient_records" ON patient_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update patient_records" ON patient_records FOR UPDATE USING (true);

INSERT INTO patient_records (full_name, email, age, gender, medical_id, assigned_doctor, department, last_visit, admission_status, status, insurance, initials) VALUES
  ('Eleanor Watson',  'eleanor.watson@example.com',  42, 'F', '#MC-99201', 'Dr. Julian Marcus', 'Cardiology',  'Oct 24, 2023', 'Observation', 'Active',      'BlueShield', 'EW'),
  ('Theodore Hughes', 'theodore.hughes@example.com', 68, 'M', '#MC-88312', 'Dr. Sarah Chen',    'Neurology',   'Oct 22, 2023', 'Outpatient',  'Archived',    'Aetna',      'TH'),
  ('Miriam Santiago', 'miriam.santiago@example.com', 31, 'F', '#MC-12005', 'Dr. Julian Marcus', 'Pediatrics',  'Oct 25, 2023', 'Observation', 'Observation', 'Medicare',   'MS'),
  ('Bradley Knight',  'bradley.knight@example.com',  55, 'M', '#MC-44567', 'Dr. Anita Varma',   'Orthopedics', 'Oct 21, 2023', 'Inpatient',   'Active',      'United',     'BK'),
  ('Leah Franklin',   'leah.franklin@example.com',   19, 'F', '#MC-77811', 'Dr. Sarah Chen',    'Emergency',   'Oct 18, 2023', 'Emergency',   'ER/Critical', 'BlueShield', 'LF')
ON CONFLICT (email) DO NOTHING;
