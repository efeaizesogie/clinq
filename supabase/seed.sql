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
