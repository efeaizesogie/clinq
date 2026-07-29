/**
 * Usage: npx tsx src/lib/seed-specialist-schedules.ts
 * Description: Populates departments, specialists (with pictures), and schedule slots in Supabase.
 *              Generates 4 weeks of availability starting from the current Monday.
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

// ---------- helpers ----------
function getMonday(d: Date): Date {
    const dt = new Date(d);
    const day = dt.getDay(); // 0=Sun, 1=Mon …
    const diff = day === 0 ? -6 : 1 - day;
    dt.setDate(dt.getDate() + diff);
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function fmtDate(d: Date): string {
    return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

// ---------- main ----------
async function seedSchedules() {
    console.log("=== Seeding Appointments Booking Prerequisites ===");

    // 1. Seed / Upsert Departments matching the UI
    const departmentsList = [
        { name: "Cardiology", slug: "cardiology", description: "Heart health, cardiovascular diseases, and vascular testing.", icon_name: "Heart", doctors_count: 5, category: "Specialty" },
        { name: "Dermatology", slug: "dermatology", description: "Advanced skincare solutions and chronic skin restoration.", icon_name: "Sparkles", doctors_count: 3, category: "Clinical" },
        { name: "Pediatrics", slug: "pediatrics", description: "Dedicated wellness checks for infants and children.", icon_name: "Baby", doctors_count: 6, category: "Primary Care" },
        { name: "Neurology", slug: "neurology", description: "Expert diagnosis and neurodegenerative disorder treatments.", icon_name: "Brain", doctors_count: 4, category: "Specialty" },
        { name: "Orthopedics", slug: "orthopedics", description: "Specialized joint reconstruction, skeletal, and muscle care.", icon_name: "Activity", doctors_count: 5, category: "Specialty" },
        { name: "Ophthalmology", slug: "ophthalmology", description: "Comprehensive eye care and surgical expertise for vision restoration.", icon_name: "Eye", doctors_count: 4, category: "Clinical" },
        { name: "Gynecology", slug: "gynecology", description: "Maternal consulting and female reproductive wellness care.", icon_name: "User", doctors_count: 2, category: "Specialty" },
        { name: "Internal Medicine", slug: "internal-medicine", description: "Primary care, chronic disease management, and prevention.", icon_name: "Globe", doctors_count: 4, category: "Specialty" },
        { name: "Radiology", slug: "radiology", description: "Diagnostic screenings, X-Ray, MRI, and imaging scans.", icon_name: "Image", doctors_count: 3, category: "Specialty" }
    ];

    console.log("Upserting departments...");
    for (const dept of departmentsList) {
        const { error } = await supabase.from("departments").upsert([dept], { onConflict: "slug" });
        if (error) console.error(`Failed dept ${dept.name}:`, error.message);
    }

    // Read mapped IDs
    const { data: dbDepts } = await supabase.from("departments").select("id, name");
    const deptMap = new Map((dbDepts || []).map(d => [d.name, d.id]));

    // 2. Specialists list with image URLs
    const specialistsList = [
        {
            full_name: "Dr. Aris Thorne",
            specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"),
            experience: "15+ Years",
            rating: 4.9,
            bio: "Specializing in cardiac surgery and heart failure management.",
            initials: "AT",
            color_grad: "from-blue-600 to-indigo-800",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
            gender: "Male",
            languages: ["English", "Spanish"]
        },
        {
            full_name: "Dr. Sarah Jenkins",
            specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"),
            experience: "8 Years",
            rating: 4.9,
            bio: "Pioneered heart rhythm diagnostics and coronary angioplasty therapeutic treatments.",
            initials: "SJ",
            color_grad: "from-teal-600 to-blue-800",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            gender: "Female",
            languages: ["English"]
        },
        {
            full_name: "Dr. Elena Vance",
            specialty: "Neurology Specialist",
            department_id: deptMap.get("Neurology"),
            experience: "12+ Years",
            rating: 4.8,
            bio: "Expert in neurodegenerative disorders and advanced migraine treatments.",
            initials: "EV",
            color_grad: "from-purple-600 to-indigo-800",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
            gender: "Female",
            languages: ["English", "Spanish"]
        },
        {
            full_name: "Dr. Julian Marc",
            specialty: "Pediatrics Lead",
            department_id: deptMap.get("Pediatrics"),
            experience: "10+ Years",
            rating: 4.7,
            bio: "Dedicated to holistic child healthcare from infancy through adolescence.",
            initials: "JM",
            color_grad: "from-emerald-500 to-teal-700",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
            gender: "Male",
            languages: ["English", "French"]
        },
        {
            full_name: "Dr. Marcus Vance",
            specialty: "Orthopedics Surgeon",
            department_id: deptMap.get("Orthopedics"),
            experience: "14+ Years",
            rating: 4.8,
            bio: "Specializes in athletic joint reconstructive surgery and bone pathology.",
            initials: "MV",
            color_grad: "from-orange-500 to-rose-700",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
            gender: "Male",
            languages: ["English"]
        },
        {
            full_name: "Dr. Clara Shore",
            specialty: "Clinical Dermatologist",
            department_id: deptMap.get("Dermatology"),
            experience: "11 Years",
            rating: 4.9,
            bio: "Focuses on skin restoration and chronic dermatology conditions.",
            initials: "CS",
            color_grad: "from-pink-500 to-purple-800",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            image_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
            gender: "Female",
            languages: ["English"]
        }
    ];

    console.log("Upserting specialists...");
    for (const spec of specialistsList) {
        const { error } = await supabase.from("specialists").upsert([spec], { onConflict: "full_name" });
        if (error) console.error(`Failed specialist ${spec.full_name}:`, error.message);
    }

    // Read specialists
    const { data: dbSpecs } = await supabase.from("specialists").select("id, full_name");
    if (!dbSpecs || dbSpecs.length === 0) {
        console.error("No specialists in DB.");
        return;
    }

    // 3. Generate slots for the CURRENT week + next 3 weeks (4 weeks total, Mon-Sun)
    const now = new Date();
    const monday = getMonday(now);

    const WEEKS_TO_SEED = 4;
    const allDates: { dateStr: string; dateVal: number }[] = [];

    for (let w = 0; w < WEEKS_TO_SEED; w++) {
        for (let d = 0; d < 7; d++) {
            const dt = new Date(monday);
            dt.setDate(monday.getDate() + w * 7 + d);
            allDates.push({ dateStr: fmtDate(dt), dateVal: dt.getDate() });
        }
    }

    // Time slots — morning and afternoon blocks
    const slots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "11:30 AM",
        "01:00 PM", "01:30 PM", "02:00 PM", "03:00 PM", "04:00 PM", "04:30 PM"
    ];

    console.log(`Seeding ${allDates.length} days × ${slots.length} slots × ${dbSpecs.length} specialists...`);

    // Batch upserts in chunks of 200 for performance
    const BATCH_SIZE = 200;
    let rows: any[] = [];
    let totalSeeded = 0;

    for (const spec of dbSpecs) {
        for (const d of allDates) {
            // Weekday or weekend — weekends get fewer slots
            const dayOfWeek = new Date(d.dateStr + "T00:00:00").getDay(); // 0=Sun, 6=Sat
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const daySlots = isWeekend
                ? ["10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM"]
                : slots;

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
                    if (error) console.error("Batch insert error:", error.message);
                    else totalSeeded += rows.length;
                    rows = [];
                }
            }
        }
    }

    // Flush remaining
    if (rows.length > 0) {
        const { error } = await supabase.from("specialist_schedules")
            .upsert(rows, { onConflict: "specialist_id,available_date,time_slot" });
        if (error) console.error("Final batch insert error:", error.message);
        else totalSeeded += rows.length;
    }

    console.log(`🎉 Seeded ${totalSeeded} schedule slots for ${dbSpecs.length} specialists across ${allDates.length} days!`);
}

seedSchedules().catch(console.error);
