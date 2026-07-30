const fs = require('fs');
const path = require('path');

// 1. Read env variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.error("No .env.local file found.");
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        env[key] = val;
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL/Key in .env.local.");
    process.exit(1);
}

const departments = [
    { slug: 'cardiology', detailed_content: 'Our Cardiology department offers comprehensive cardiovascular care. Equipped with advanced diagnostic tools like 12-lead ECG, echocardiograms, and state-of-the-art angiography suites, our clinical team delivers personalized treatment options. From preventive heart health screenings to complex interventional cardiology procedures, we focus on surgical precision and long-term diagnostic recovery.' },
    { slug: 'neurology', detailed_content: 'The Neurology department provides expert diagnosis and management for all neurological disorders. Serving patients with epilepsy, strokes, multiple sclerosis, and complex neurodegenerative conditions. Our advanced neuro-imaging center, comprehensive EEG labs, and dedicated neuro-rehabilitation staff work in synergy to restore cognitive and motor functions.' },
    { slug: 'pediatrics', detailed_content: 'Pediatrics at Clinq is centered on nurturing physical growth and cognitive milestones for children and adolescents. We provide immunizations, wellness check-ups, and emergency pediatric interventions. Our bright, kid-friendly clinical rooms are staffed by empathetic professionals dedicated to supporting your child’s health at every developmental stage.' },
    { slug: 'orthopedics', detailed_content: 'Orthopedics offers specialized care for MSK issues, fractures, spinal health, and athletic injuries. Our board-certified orthopedic surgeons execute joint replacements and minimally invasive arthroscopy. We integrate post-surgical physical therapy directly into rehabilitation schedules to ensure full athletic and mobility restoration.' },
    { slug: 'dermatology', detailed_content: 'Dermatology provides medical, surgical, and cosmetic solutions for skin conditions. We manage chronic disorders such as eczema, psoriasis, and dermatitis, and perform advanced dermatologic screenings and skin cancer removals. Our practitioners leverage clinical dermatology techniques to restore healthy skin textures.' },
    { slug: 'ophthalmology', detailed_content: 'Ophthalmology delivers eye care, from visual acuity tests to microsurgical corrections for glaucoma and cataracts. Backed by diagnostic scans and optical therapy, we help preserve and optimize your vision. Our clinicians provide specialized treatments tailored to patients of all age groups.' }
];

const blogPosts = [
    {
        category: 'GUIDE',
        title: 'Flu Season Guide 2024',
        description: 'Protect yourself and your family with these 5 essential steps for the upcoming winter season.',
        slug: 'flu-season-guide-2024',
        image_url: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&q=80&w=600',
        content: '### Influenza Prevention & Best Practices for 2024\n\nAs the temperature drops and winter approaches, it is critical to prepare for the seasonal flu cycle. Influenza is a highly contagious respiratory infection that can lead to severe health complications if not properly managed.\n\n#### 1. Schedule your seasonal flu shot\nVaccination remains the most effective defense against influenza. Getting vaccinated not only reduces your risk of catching the virus but also decreases severity if you do contract it.\n\n#### 2. Practice hand hygiene\nWash hands frequently with warm water and soap for at least 20 seconds. Use alcohol-based hand sanitizers as a fallback when public utility washing is unavailable.\n\n#### 3. Maintain your immune ecosystem\nFocus on balanced nutrition rich in Vitamin C, adequate hydration, regular sleep cycles, and moderate physical exercise. A strong underlying immune defense is key in resisting environmental pathogens.'
    },
    {
        category: 'NEWS',
        title: 'New Wellness Wing Open',
        description: 'We are excited to announce the grand opening of our advanced physical therapy and wellness center.',
        slug: 'new-wellness-wing-open',
        image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
        content: '### Announcing Next-Gen Physical Therapy and Wellness at Clinq\n\nWe are proud to unveil our brand new Wellness Wing, designed to offer cutting-edge physical medicine, recovery units, and therapeutic sessions under one roof.\n\n#### Advanced Equipment & Amenities\nOur new facility is fitted with state-of-the-art diagnostic devices, hydrotherapy pools, and custom resistance training equipment. Each station is designed to support clinical coordinators and physical therapists in tracking patient mobility trends in real time.\n\n#### Integrated Rehabilitation Plans\nWhether recovering from orthopedic surgery or managing sports injuries, our team designs custom rehab workflows tailored to your specific recovery speed and threshold.'
    },
    {
        category: 'TIPS',
        title: 'Understanding Heart Health',
        description: 'Dr. Arya Sharma shares lifestyle changes that significantly improve cardiovascular longevity.',
        slug: 'understanding-heart-health',
        image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
        content: '### Cardiovascular Health: A Proactive Approach\n\nYour heart is the engine of your body. Maintaining cardiovascular strength requires consistent lifestyle practices and early diagnostic screening.\n\n#### Dietary Actionables\nReduce trans fats and high sodium intake, focusing instead on leafy greens, rich whole grains, and lean proteins. Incorporating Omega-3 fatty acids helps build strong arterial walls.\n\n#### Regular Screening Intervals\nEnsure you schedule routine blood pressure checks and cholesterol level panels. Early discovery of hypertensive trends allows clinical specialists to prescribe preventative lifestyle adjustments before severe symptoms manifest.'
    }
];

const resources = [
    {
        title: 'Diabetes Meal Planner Guide',
        description: 'A professional checklist mapping carbohydrate allowances, glycemic indices, and portion control plans.',
        slug: 'diabetes-meal-planner',
        category: 'Guides',
        content: '### Professional Diabetes Nutritional Guide\n\nManaging your blood glucose requires careful portion mapping and glycemic knowledge. This guide, formatted by our primary care nutritionists, details essential dietary structures:\n\n- **Carbohydrate Tracking**: Learn to balance net carbs per session to prevent critical insulin spikes.\n- **High-Fiber Integration**: Why whole grains and legumes support digestion and stabilize glucose absorption.\n- **Meal Timing Strategies**: Spacing intervals to maintain consistent glycogen supply.',
        icon_name: 'ClipboardCheck',
        image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600'
    },
    {
        title: 'Pediatric Immunization Tracker',
        description: 'Official clinician schedule detailing recommended dates for child health immunizations (0 - 15 Years).',
        slug: 'pediatric-immunization-schedule',
        category: 'Guides',
        content: '### Child Immunization Schedules: A Comprehensive Calendar\n\nEnsure your child receives full immunological coverage. Download our clinical timeline for vaccine administrations:\n\n- **Infants (0-12 Months)**: Critical initial doses for Hepatitis B, DTaP, Rotavirus, and IPV.\n- **Toddlers (1-3 Years)**: MMR and Varicella booster windows.\n- **School Age**: Health school entry immunization records prep.',
        icon_name: 'Baby',
        image_url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=600'
    },
    {
        title: 'HMO Insurance Coverage Matrix',
        description: 'Interactive checklist to verify co-pay amounts, specialist referrals, and hospital billing coverage.',
        slug: 'hmo-coverage-matrix',
        category: 'Tools',
        content: '### Understanding HMO Coverage and Co-Pay Dynamics\n\nAvoid surprise hospital billing codes with our policy matrix guide:\n\n- **Specialist Referrals**: How to obtain primary care physician sign-offs prior to scheduling specialist appointments.\n- **Co-Pay Calculations**: Verify standard fees for outpatient consults and specialized clinical diagnostics.\n- **Emergency Admissions**: Coverage regulations and hospital policies when admitted out-of-network.',
        icon_name: 'ShieldCheck',
        image_url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600'
    }
];

// Build PowerShell script using Invoke-RestMethod
let psScript = `$headers = @{
    "apikey" = "${supabaseKey}"
    "Authorization" = "Bearer ${supabaseKey}"
    "Content-Type" = "application/json"
}

$headers_upsert = @{
    "apikey" = "${supabaseKey}"
    "Authorization" = "Bearer ${supabaseKey}"
    "Content-Type" = "application/json"
    "Prefer" = "resolution=merge-duplicates"
}\n\n`;

// patch departments
departments.forEach(d => {
    const payload = JSON.stringify({ detailed_content: d.detailed_content });
    // Escape single quotes for PowerShell
    const escapedPayload = payload.replace(/'/g, "''");
    psScript += `Write-Host "Updating department ${d.slug}..."\n`;
    psScript += `Invoke-RestMethod -Uri "${supabaseUrl}/rest/v1/departments?slug=eq.${d.slug}" -Method Patch -Headers $headers -Body '${escapedPayload}'\n\n`;
});

// upsert blogs
blogPosts.forEach(b => {
    const payload = JSON.stringify([b]);
    const escapedPayload = payload.replace(/'/g, "''");
    psScript += `Write-Host "Upserting blog post: ${b.slug}..."\n`;
    psScript += `Invoke-RestMethod -Uri "${supabaseUrl}/rest/v1/blog_posts" -Method Post -Headers $headers_upsert -Body '${escapedPayload}'\n\n`;
});

// upsert resources
resources.forEach(r => {
    const payload = JSON.stringify([r]);
    const escapedPayload = payload.replace(/'/g, "''");
    psScript += `Write-Host "Upserting resource: ${r.slug}..."\n`;
    psScript += `Invoke-RestMethod -Uri "${supabaseUrl}/rest/v1/resources" -Method Post -Headers $headers_upsert -Body '${escapedPayload}'\n\n`;
});

psScript += `Write-Host "Done seeding database natively!"\n`;

fs.writeFileSync(path.resolve(process.cwd(), 'seed_db.ps1'), psScript, 'utf8');
console.log("Generated seed_db.ps1 successfully!");
