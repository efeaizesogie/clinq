/**
 * Usage: npx tsx src/lib/seed-specialist-schedules.ts
 * Description: Populates departments, 15 specialists (with photos), and 4 weeks of schedule slots.
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase configuration in .env.local.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getMonday(d: Date): Date {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    dt.setDate(dt.getDate() + diff);
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function fmtDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

async function seedSchedules() {
    console.log("=== Seeding 15 Specialists + Schedules ===");

    // 1. Departments
    const departmentsList = [
        { name: "Cardiology", slug: "cardiology", description: "Heart health, cardiovascular diseases, and vascular testing.", icon_name: "Heart", doctors_count: 4, category: "Specialty" },
        { name: "Dermatology", slug: "dermatology", description: "Advanced skincare solutions and chronic skin restoration.", icon_name: "Sparkles", doctors_count: 2, category: "Clinical" },
        { name: "Pediatrics", slug: "pediatrics", description: "Dedicated wellness checks for infants and children.", icon_name: "Baby", doctors_count: 2, category: "Primary Care" },
        { name: "Neurology", slug: "neurology", description: "Expert diagnosis and neurodegenerative disorder treatments.", icon_name: "Brain", doctors_count: 2, category: "Specialty" },
        { name: "Orthopedics", slug: "orthopedics", description: "Specialized joint reconstruction, skeletal, and muscle care.", icon_name: "Activity", doctors_count: 2, category: "Specialty" },
        { name: "Ophthalmology", slug: "ophthalmology", description: "Comprehensive eye care and surgical expertise.", icon_name: "Eye", doctors_count: 1, category: "Clinical" },
        { name: "Gynecology", slug: "gynecology", description: "Maternal consulting and female reproductive wellness care.", icon_name: "User", doctors_count: 1, category: "Specialty" },
        { name: "Internal Medicine", slug: "internal-medicine", description: "Primary care, chronic disease management, and prevention.", icon_name: "Globe", doctors_count: 1, category: "Specialty" },
        { name: "Radiology", slug: "radiology", description: "Diagnostic screenings, X-Ray, MRI, and imaging scans.", icon_name: "Image", doctors_count: 0, category: "Specialty" }
    ];

    console.log("Upserting departments...");
    for (const dept of departmentsList) {
        const { error } = await supabase.from("departments").upsert([dept], { onConflict: "slug" });
        if (error) console.error(`  ✗ ${dept.name}:`, error.message);
    }
    console.log("  ✓ departments done");

    const { data: dbDepts } = await supabase.from("departments").select("id, name");
    const deptMap = new Map((dbDepts || []).map(d => [d.name, d.id]));

    // 2. 15 Specialists with diverse fields
    const specialistsList = [
        // ─── Cardiology (4) ───
        {
            full_name: "Dr. Aris Thorne",
            specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"),
            experience: "15+ Years", rating: 4.9,
            bio: "Specializing in cardiac surgery and heart failure management with over 3000 successful procedures.",
            initials: "AT", color_grad: "from-blue-600 to-indigo-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "Spanish"]
        },
        {
            full_name: "Dr. Sarah Jenkins",
            specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"),
            experience: "8 Years", rating: 4.9,
            bio: "Pioneered heart rhythm diagnostics and coronary angioplasty across leading institutions.",
            initials: "SJ", color_grad: "from-teal-600 to-blue-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English"]
        },
        {
            full_name: "Dr. Raymond Cole",
            specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"),
            experience: "20+ Years", rating: 4.8,
            bio: "Interventional cardiologist with expertise in structural heart disease and valve replacement.",
            initials: "RC", color_grad: "from-sky-600 to-blue-900",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "French"]
        },
        {
            full_name: "Dr. Amara Obi",
            specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"),
            experience: "6 Years", rating: 4.7,
            bio: "Focused on preventive cardiology, cardiac rehabilitation, and echocardiography diagnostics.",
            initials: "AO", color_grad: "from-indigo-500 to-purple-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Yoruba"]
        },
        // ─── Neurology (2) ───
        {
            full_name: "Dr. Elena Vance",
            specialty: "Neurology Specialist",
            department_id: deptMap.get("Neurology"),
            experience: "12+ Years", rating: 4.8,
            bio: "Expert in neurodegenerative disorders, epilepsy management, and advanced migraine treatments.",
            initials: "EV", color_grad: "from-purple-600 to-indigo-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Spanish"]
        },
        {
            full_name: "Dr. Kwame Asante",
            specialty: "Neurology Specialist",
            department_id: deptMap.get("Neurology"),
            experience: "9 Years", rating: 4.6,
            bio: "Neurophysiology researcher specializing in stroke prevention and cognitive rehabilitation.",
            initials: "KA", color_grad: "from-violet-600 to-fuchsia-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "Twi"]
        },
        // ─── Pediatrics (2) ───
        {
            full_name: "Dr. Julian Marc",
            specialty: "Pediatrics Lead",
            department_id: deptMap.get("Pediatrics"),
            experience: "10+ Years", rating: 4.7,
            bio: "Dedicated to holistic child healthcare from infancy through adolescence and adolescent behavioral therapy.",
            initials: "JM", color_grad: "from-emerald-500 to-teal-700",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "French"]
        },
        {
            full_name: "Dr. Lisa Chen",
            specialty: "Pediatrics Specialist",
            department_id: deptMap.get("Pediatrics"),
            experience: "7 Years", rating: 4.8,
            bio: "Neonatal care specialist with a focus on early childhood developmental milestones and immunization.",
            initials: "LC", color_grad: "from-green-500 to-emerald-700",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Mandarin"]
        },
        // ─── Orthopedics (2) ───
        {
            full_name: "Dr. Marcus Vance",
            specialty: "Orthopedics Surgeon",
            department_id: deptMap.get("Orthopedics"),
            experience: "14+ Years", rating: 4.8,
            bio: "Specializes in athletic joint reconstructive surgery, bone pathology, and sports medicine.",
            initials: "MV", color_grad: "from-orange-500 to-rose-700",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English"]
        },
        {
            full_name: "Dr. Fatima Al-Rashid",
            specialty: "Orthopedics Specialist",
            department_id: deptMap.get("Orthopedics"),
            experience: "11 Years", rating: 4.7,
            bio: "Expert in spinal surgery, joint replacement, and pediatric orthopedic conditions.",
            initials: "FA", color_grad: "from-amber-500 to-orange-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Arabic"]
        },
        // ─── Dermatology (2) ───
        {
            full_name: "Dr. Clara Shore",
            specialty: "Clinical Dermatologist",
            department_id: deptMap.get("Dermatology"),
            experience: "11 Years", rating: 4.9,
            bio: "Focuses on skin restoration, chronic dermatology conditions, and cosmetic dermatology.",
            initials: "CS", color_grad: "from-pink-500 to-purple-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English"]
        },
        {
            full_name: "Dr. David Kim",
            specialty: "Clinical Dermatologist",
            department_id: deptMap.get("Dermatology"),
            experience: "5 Years", rating: 4.5,
            bio: "Specializes in laser treatments, acne therapy, and immune-mediated skin disorders.",
            initials: "DK", color_grad: "from-rose-500 to-red-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "Korean"]
        },
        // ─── Ophthalmology (1) ───
        {
            full_name: "Dr. Priya Sharma",
            specialty: "Ophthalmology Specialist",
            department_id: deptMap.get("Ophthalmology"),
            experience: "13 Years", rating: 4.8,
            bio: "Expert in cataract surgery, glaucoma management, and retinal disease treatment.",
            initials: "PS", color_grad: "from-cyan-500 to-blue-700",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Hindi"]
        },
        // ─── Gynecology (1) ───
        {
            full_name: "Dr. Nkechi Eze",
            specialty: "Gynecology Specialist",
            department_id: deptMap.get("Gynecology"),
            experience: "16+ Years", rating: 4.9,
            bio: "Leading expert in maternal-fetal medicine, minimally invasive gynecologic surgery, and fertility treatment.",
            initials: "NE", color_grad: "from-fuchsia-500 to-pink-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Igbo"]
        },
        // ─── Internal Medicine (1) ───
        {
            full_name: "Dr. Michael Torres",
            specialty: "Internal Medicine Lead",
            department_id: deptMap.get("Internal Medicine"),
            experience: "18+ Years", rating: 4.9,
            bio: "Board-certified internist managing complex multi-system diseases, diabetes, and hypertension.",
            initials: "MT", color_grad: "from-slate-600 to-gray-800",
            is_available: true, availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "Spanish"]
        }
    ];

    console.log(`Upserting ${specialistsList.length} specialists...`);
    for (const spec of specialistsList) {
        const { error } = await supabase.from("specialists").upsert([spec], { onConflict: "full_name" });
        if (error) console.error(`  ✗ ${spec.full_name}:`, error.message);
    }
    console.log("  ✓ specialists done");

    // Read specialists back
    const { data: dbSpecs } = await supabase.from("specialists").select("id, full_name");
    if (!dbSpecs || dbSpecs.length === 0) {
        console.error("No specialists in DB — aborting schedule seeding.");
        return;
    }
    console.log(`  Found ${dbSpecs.length} specialists in DB`);

    // 3. Generate 4 weeks of slots from current Monday
    const monday = getMonday(new Date());
    const WEEKS = 4;
    const allDates: { dateStr: string; dateVal: number; dayOfWeek: number }[] = [];

    for (let w = 0; w < WEEKS; w++) {
        for (let d = 0; d < 7; d++) {
            const dt = new Date(monday);
            dt.setDate(monday.getDate() + w * 7 + d);
            allDates.push({
                dateStr: fmtDate(dt),
                dateVal: dt.getDate(),
                dayOfWeek: dt.getDay()
            });
        }
    }

    const weekdaySlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
    ];
    const weekendSlots = [
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "01:00 PM", "01:30 PM", "02:00 PM"
    ];

    console.log(`Seeding schedules: ${allDates.length} days × ${dbSpecs.length} specialists...`);

    const BATCH_SIZE = 300;
    let rows: any[] = [];
    let total = 0;

    for (const spec of dbSpecs) {
        for (const d of allDates) {
            const isWeekend = d.dayOfWeek === 0 || d.dayOfWeek === 6;
            const daySlots = isWeekend ? weekendSlots : weekdaySlots;

            for (const s of daySlots) {
                rows.push({
                    specialist_id: spec.id,
                    available_date: d.dateStr,
                    date_val: d.dateVal,
                    time_slot: s,
                    is_booked: false
                });

                if (rows.length >= BATCH_SIZE) {
                    const { error } = await supabase.from("specialist_schedules")
                        .upsert(rows, { onConflict: "specialist_id,available_date,time_slot" });
                    if (error) console.error("  batch error:", error.message);
                    else total += rows.length;
                    rows = [];
                }
            }
        }
    }

    if (rows.length > 0) {
        const { error } = await supabase.from("specialist_schedules")
            .upsert(rows, { onConflict: "specialist_id,available_date,time_slot" });
        if (error) console.error("  final batch error:", error.message);
        else total += rows.length;
    }

    console.log(`\n🎉 Done! Seeded ${total} schedule slots for ${dbSpecs.length} specialists across ${allDates.length} days.`);
}

seedSchedules().catch(console.error);
