-- ─── DATABASE MIGRATION FOR RESOURCES, DETAILED DEPARTMENTS, AND BLOG IMAGES ───
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/your-project-id/sql/new)

-- 1. Update public.blog_posts table
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';

-- 2. Update public.departments table
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS detailed_content TEXT NOT NULL DEFAULT '';

-- 3. Create public.resources table
CREATE TABLE IF NOT EXISTS public.resources (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  slug         TEXT NOT NULL UNIQUE,
  category     TEXT NOT NULL, -- 'Guides' | 'Articles' | 'Tools'
  content      TEXT NOT NULL DEFAULT '',
  icon_name    TEXT NOT NULL DEFAULT 'ClipboardCheck',
  image_url    TEXT,
  download_url TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) for the resources table
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to resources table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'resources' AND policyname = 'Public read resources'
    ) THEN
        CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (true);
    END IF;
END
$$;

-- 4. Seed/Upsert Detailed Department Contents
-- Cardiology, Neurology, Pediatrics, Orthopedics, Ophthalmology, Dermatology
UPDATE public.departments 
SET detailed_content = 'Our Cardiology department offers comprehensive cardiovascular care. Equipped with advanced diagnostic tools like 12-lead ECG, echocardiograms, and state-of-the-art angiography suites, our clinical team delivers personalized treatment options. From preventative heart health screenings to complex interventional cardiology procedures, we focus on surgical precision and long-term diagnostic recovery.'
WHERE slug = 'cardiology';

UPDATE public.departments 
SET detailed_content = 'The Neurology department provides expert diagnosis and management for all neurological disorders. Serving patients with epilepsy, strokes, multiple sclerosis, and complex neurodegenerative conditions. Our advanced neuro-imaging center, comprehensive EEG labs, and dedicated neuro-rehabilitation staff work in synergy to restore cognitive and motor functions.'
WHERE slug = 'neurology';

UPDATE public.departments 
SET detailed_content = 'Pediatrics at Clinq is centered on nurturing physical growth and cognitive milestones for children and adolescents. We provide immunizations, wellness check-ups, and emergency pediatric interventions. Our bright, kid-friendly clinical rooms are staffed by empathetic professionals dedicated to supporting your child’s health at every developmental stage.'
WHERE slug = 'pediatrics';

UPDATE public.departments 
SET detailed_content = 'Orthopedics offers specialized care for MSK issues, fractures, spinal health, and athletic injuries. Our board-certified orthopedic surgeons execute joint replacements and minimally invasive arthroscopy. We integrate post-surgical physical therapy directly into rehabilitation schedules to ensure full athletic and mobility restoration.'
WHERE slug = 'orthopedics';

UPDATE public.departments 
SET detailed_content = 'Dermatology provides medical, surgical, and cosmetic solutions for skin conditions. We manage chronic disorders such as eczema, psoriasis, and dermatitis, and perform advanced dermatologic screenings and skin cancer removals. Our practitioners leverage clinical dermatology techniques to restore healthy skin textures.'
WHERE slug = 'dermatology';

UPDATE public.departments 
SET detailed_content = 'Ophthalmology delivers eye care, from visual acuity tests to microsurgical corrections for glaucoma and cataracts. Backed by diagnostic scans and optical therapy, we help preserve and optimize your vision. Our clinicians provide specialized treatments tailored to patients of all age groups.'
WHERE slug = 'ophthalmology';

-- 5. Seed detailed Blog Posts (with images and full content)
-- Update existing posts or upsert them
-- Flu Season Guide 2024
INSERT INTO public.blog_posts (category, title, description, slug, image_url, content)
VALUES (
  'GUIDE', 
  'Flu Season Guide 2024', 
  'Protect yourself and your family with these 5 essential steps for the upcoming winter season.',
  'flu-season-guide-2024',
  'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&q=80&w=600',
  '### Influenza Prevention & Best Practices for 2024\n\nAs the temperature drops and winter approaches, it is critical to prepare for the seasonal flu cycle. Influenza is a highly contagious respiratory infection that can lead to severe health complications if not properly managed.\n\n#### 1. Schedule your seasonal flu shot\nVaccination remains the most effective defense against influenza. Getting vaccinated not only reduces your risk of catching the virus but also decreases severity if you do contract it.\n\n#### 2. Practice hand hygiene\nWash hands frequently with warm water and soap for at least 20 seconds. Use alcohol-based hand sanitizers as a fallback when public utility washing is unavailable.\n\n#### 3. Maintain your immune ecosystem\nFocus on balanced nutrition rich in Vitamin C, adequate hydration, regular sleep cycles, and moderate physical exercise. A strong underlying immune defense is key in resisting environmental pathogens.'
)
ON CONFLICT (slug) DO UPDATE 
SET image_url = EXCLUDED.image_url, content = EXCLUDED.content;

-- New Wellness Wing Open
INSERT INTO public.blog_posts (category, title, description, slug, image_url, content)
VALUES (
  'NEWS', 
  'New Wellness Wing Open', 
  'We are excited to announce the grand opening of our advanced physical therapy and wellness center.',
  'new-wellness-wing-open',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
  '### Announcing Next-Gen Physical Therapy and Wellness at Clinq\n\nWe are proud to unveil our brand new Wellness Wing, designed to offer cutting-edge physical medicine, recovery units, and therapeutic sessions under one roof.\n\n#### Advanced Equipment & Amenities\nOur new facility is fitted with state-of-the-art diagnostic devices, hydrotherapy pools, and custom resistance training equipment. Each station is designed to support clinical coordinators and physical therapists in tracking patient mobility trends in real time.\n\n#### Integrated Rehabilitation Plans\nWhether recovering from orthopedic surgery or managing sports injuries, our team designs custom rehab workflows tailored to your specific recovery speed and threshold.'
)
ON CONFLICT (slug) DO UPDATE 
SET image_url = EXCLUDED.image_url, content = EXCLUDED.content;

-- Understanding Heart Health
INSERT INTO public.blog_posts (category, title, description, slug, image_url, content)
VALUES (
  'TIPS', 
  'Understanding Heart Health', 
  'Dr. Arya Sharma shares lifestyle changes that significantly improve cardiovascular longevity.',
  'understanding-heart-health',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
  '### Cardiovascular Health: A Proactive Approach\n\nYour heart is the engine of your body. Maintaining cardiovascular strength requires consistent lifestyle practices and early diagnostic screening.\n\n#### Dietary Actionables\nReduce trans fats and high sodium intake, focusing instead on leafy greens, rich whole grains, and lean proteins. Incorporating Omega-3 fatty acids helps build strong arterial walls.\n\n#### Regular Screening Intervals\nEnsure you schedule routine blood pressure checks and cholesterol level panels. Early discovery of hypertensive trends allows clinical specialists to prescribe preventative lifestyle adjustments before severe symptoms manifest.'
)
ON CONFLICT (slug) DO UPDATE 
SET image_url = EXCLUDED.image_url, content = EXCLUDED.content;


-- 6. Seed Health Resources
INSERT INTO public.resources (title, description, slug, category, content, icon_name, image_url)
VALUES 
  (
    'Diabetes Meal Planner Guide', 
    'A professional checklist mapping carbohydrate allowances, glycemic indices, and portion control plans.', 
    'diabetes-meal-planner', 
    'Guides', 
    '### Professional Diabetes Nutritional Guide\n\nManaging your blood glucose requires careful portion mapping and glycemic knowledge. This guide, formatted by our primary care nutritionists, details essential dietary structures:\n\n- **Carbohydrate Tracking**: Learn to balance net carbs per session to prevent critical insulin spikes.\n- **High-Fiber Integration**: Why whole grains and legumes support digestion and stabilize glucose absorption.\n- **Meal Timing Strategies**: Spacing intervals to maintain consistent glycogen supply.',
    'ClipboardCheck',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600'
  ),
  (
    'Pediatric Immunization Tracker', 
    'Official clinician schedule detailing recommended dates for child health immunizations (0 - 15 Years).', 
    'pediatric-immunization-schedule', 
    'Guides', 
    '### Child Immunization Schedules: A Comprehensive Calendar\n\nEnsure your child receives full immunological coverage. Download our clinical timeline for vaccine administrations:\n\n- **Infants (0-12 Months)**: Critical initial doses for Hepatitis B, DTaP, Rotavirus, and IPV.\n- **Toddlers (1-3 Years)**: MMR and Varicella booster windows.\n- **School Age**: Health school entry immunization records prep.',
    'Baby',
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=600'
  ),
  (
    'HMO Insurance Coverage Matrix', 
    'Interactive checklist to verify co-pay amounts, specialist referrals, and hospital billing coverage.', 
    'hmo-coverage-matrix', 
    'Tools', 
    '### Understanding HMO Coverage and Co-Pay Dynamics\n\nAvoid surprise hospital billing codes with our policy matrix guide:\n\n- **Specialist Referrals**: How to obtain primary care physician sign-offs prior to scheduling specialist appointments.\n- **Co-Pay Calculations**: Verify standard fees for outpatient consults and specialized clinical diagnostics.\n- **Emergency Admissions**: Coverage regulations and hospital policies when admitted out-of-network.',
    'ShieldCheck',
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600'
  )
ON CONFLICT (slug) DO NOTHING;
