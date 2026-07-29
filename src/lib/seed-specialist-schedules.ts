/**
 * Usage: npx tsx src/lib/seed-specialist-schedules.ts
 * Seeds departments, 15 specialists, their weekly availability templates,
 * and 4 weeks of dated schedule slots derived from those templates.
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

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

// ─── Time slot presets ────────────────────────────────────────
const MORNING_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
const AFTERNOON_SLOTS = ["01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];
const FULL_DAY = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];
const HALF_MORNING = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"];
const HALF_AFTERNOON = ["01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM"];
const WEEKEND_SLOTS = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM", "02:00 PM"];

// day_of_week: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
type AvailabilityTemplate = { day_of_week: number; time_slots: string[] }[];

// ─── Per-doctor weekly schedule templates ────────────────────
const DOCTOR_SCHEDULES: Record<string, AvailabilityTemplate> = {
    "Dr. Aris Thorne": [
        { day_of_week: 1, time_slots: FULL_DAY },   // Mon
        { day_of_week: 3, time_slots: FULL_DAY },   // Wed
        { day_of_week: 5, time_slots: HALF_MORNING } // Fri (half day)
    ],
    "Dr. Sarah Jenkins": [
        { day_of_week: 2, time_slots: FULL_DAY },   // Tue
        { day_of_week: 4, time_slots: FULL_DAY },   // Thu
        { day_of_week: 6, time_slots: WEEKEND_SLOTS } // Sat
    ],
    "Dr. Raymond Cole": [
        { day_of_week: 1, time_slots: AFTERNOON_SLOTS }, // Mon afternoon
        { day_of_week: 2, time_slots: FULL_DAY },         // Tue
        { day_of_week: 4, time_slots: FULL_DAY }          // Thu
    ],
    "Dr. Amara Obi": [
        { day_of_week: 1, time_slots: FULL_DAY },   // Mon
        { day_of_week: 3, time_slots: HALF_AFTERNOON }, // Wed afternoon
        { day_of_week: 5, time_slots: FULL_DAY }    // Fri
    ],
    "Dr. Elena Vance": [
        { day_of_week: 1, time_slots: FULL_DAY },   // Mon
        { day_of_week: 2, time_slots: HALF_MORNING }, // Tue morning
        { day_of_week: 4, time_slots: FULL_DAY },   // Thu
        { day_of_week: 5, time_slots: HALF_AFTERNOON } // Fri afternoon
    ],
    "Dr. Kwame Asante": [
        { day_of_week: 2, time_slots: FULL_DAY },   // Tue
        { day_of_week: 3, time_slots: FULL_DAY },   // Wed
        { day_of_week: 5, time_slots: HALF_MORNING } // Fri morning
    ],
    "Dr. Julian Marc": [
        { day_of_week: 1, time_slots: FULL_DAY },   // Mon
        { day_of_week: 3, time_slots: FULL_DAY },   // Wed
        { day_of_week: 4, time_slots: HALF_MORNING }, // Thu morning
        { day_of_week: 6, time_slots: WEEKEND_SLOTS } // Sat
    ],
    "Dr. Lisa Chen": [
        { day_of_week: 2, time_slots: FULL_DAY },   // Tue
        { day_of_week: 4, time_slots: FULL_DAY },   // Thu
        { day_of_week: 0, time_slots: WEEKEND_SLOTS } // Sun
    ],
    "Dr. Marcus Vance": [
        { day_of_week: 1, time_slots: FULL_DAY },   // Mon
        { day_of_week: 2, time_slots: HALF_AFTERNOON }, // Tue afternoon
        { day_of_week: 4, time_slots: FULL_DAY },   // Thu
        { day_of_week: 5, time_slots: HALF_MORNING } // Fri morning
    ],
    "Dr. Fatima Al-Rashid": [
        { day_of_week: 1, time_slots: HALF_MORNING }, // Mon morning
        { day_of_week: 3, time_slots: FULL_DAY },     // Wed
        { day_of_week: 5, time_slots: FULL_DAY }      // Fri
    ],
    "Dr. Clara Shore": [
        { day_of_week: 2, time_slots: FULL_DAY },   // Tue
        { day_of_week: 3, time_slots: HALF_MORNING }, // Wed morning
        { day_of_week: 5, time_slots: FULL_DAY },   // Fri
        { day_of_week: 6, time_slots: WEEKEND_SLOTS } // Sat
    ],
    "Dr. David Kim": [
        { day_of_week: 1, time_slots: AFTERNOON_SLOTS }, // Mon afternoon
        { day_of_week: 3, time_slots: FULL_DAY },         // Wed
        { day_of_week: 4, time_slots: HALF_MORNING }      // Thu morning
    ],
    "Dr. Priya Sharma": [
        { day_of_week: 1, time_slots: FULL_DAY },   // Mon
        { day_of_week: 3, time_slots: FULL_DAY },   // Wed
        { day_of_week: 5, time_slots: FULL_DAY }    // Fri
    ],
    "Dr. Nkechi Eze": [
        { day_of_week: 2, time_slots: FULL_DAY },   // Tue
        { day_of_week: 4, time_slots: FULL_DAY },   // Thu
        { day_of_week: 6, time_slots: WEEKEND_SLOTS } // Sat
    ],
    "Dr. Michael Torres": [
        { day_of_week: 1, time_slots: FULL_DAY },   // Mon
        { day_of_week: 2, time_slots: FULL_DAY },   // Tue
        { day_of_week: 3, time_slots: HALF_AFTERNOON }, // Wed afternoon
        { day_of_week: 4, time_slots: FULL_DAY },   // Thu
        { day_of_week: 5, time_slots: HALF_MORNING } // Fri morning
    ]
};

async function seedAll() {
    console.log("=== Seeding Departments, 15 Specialists, Availability & Schedules ===\n");

    // ── 1. Departments ──────────────────────────────────────────
    const departmentsList = [
        { name: "Cardiology",        slug: "cardiology",        description: "Heart health, cardiovascular diseases, and vascular testing.",                icon_name: "Heart",      doctors_count: 4, category: "Specialty"    },
        { name: "Dermatology",       slug: "dermatology",       description: "Advanced skincare solutions and chronic skin restoration.",                   icon_name: "Sparkles",   doctors_count: 2, category: "Clinical"     },
        { name: "Pediatrics",        slug: "pediatrics",        description: "Dedicated wellness checks for infants and children.",                         icon_name: "Baby",       doctors_count: 2, category: "Primary Care" },
        { name: "Neurology",         slug: "neurology",         description: "Expert diagnosis and neurodegenerative disorder treatments.",                 icon_name: "Brain",      doctors_count: 2, category: "Specialty"    },
        { name: "Orthopedics",       slug: "orthopedics",       description: "Specialized joint reconstruction, skeletal, and muscle care.",                icon_name: "Activity",   doctors_count: 2, category: "Specialty"    },
        { name: "Ophthalmology",     slug: "ophthalmology",     description: "Comprehensive eye care and surgical expertise.",                              icon_name: "Eye",        doctors_count: 1, category: "Clinical"     },
        { name: "Gynecology",        slug: "gynecology",        description: "Maternal consulting and female reproductive wellness care.",                  icon_name: "User",       doctors_count: 1, category: "Specialty"    },
        { name: "Internal Medicine", slug: "internal-medicine", description: "Primary care, chronic disease management, and prevention.",                  icon_name: "Globe",      doctors_count: 1, category: "Specialty"    },
        { name: "Radiology",         slug: "radiology",         description: "Diagnostic screenings, X-Ray, MRI, and imaging scans.",                      icon_name: "Image",      doctors_count: 0, category: "Specialty"    }
    ];

    console.log("Upserting departments...");
    for (const dept of departmentsList) {
        const { error } = await supabase.from("departments").upsert([dept], { onConflict: "slug" });
        if (error) console.error(`  ✗ ${dept.name}:`, error.message);
    }
    console.log("  ✓ departments done\n");

    const { data: dbDepts } = await supabase.from("departments").select("id, name");
    const deptMap = new Map((dbDepts || []).map(d => [d.name, d.id]));

    // ── 2. Specialists ──────────────────────────────────────────
    const specialistsList = [
        // ─── Cardiology (4) ───
        {
            full_name: "Dr. Aris Thorne", specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"), experience: "15+ Years", rating: 4.9,
            bio: "Specializing in cardiac surgery and heart failure management with over 3000 successful procedures.",
            initials: "AT", color_grad: "from-blue-600 to-indigo-800",
            is_available: true, availability_text: "MON / WED / FRI",
            image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "Spanish"]
        },
        {
            full_name: "Dr. Sarah Jenkins", specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"), experience: "8 Years", rating: 4.9,
            bio: "Pioneered heart rhythm diagnostics and coronary angioplasty across leading institutions.",
            initials: "SJ", color_grad: "from-teal-600 to-blue-800",
            is_available: true, availability_text: "TUE / THU / SAT",
            image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English"]
        },
        {
            full_name: "Dr. Raymond Cole", specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"), experience: "20+ Years", rating: 4.8,
            bio: "Interventional cardiologist with expertise in structural heart disease and valve replacement.",
            initials: "RC", color_grad: "from-sky-600 to-blue-900",
            is_available: true, availability_text: "MON / TUE / THU",
            image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "French"]
        },
        {
            full_name: "Dr. Amara Obi", specialty: "Cardiology Specialist",
            department_id: deptMap.get("Cardiology"), experience: "6 Years", rating: 4.7,
            bio: "Focused on preventive cardiology, cardiac rehabilitation, and echocardiography diagnostics.",
            initials: "AO", color_grad: "from-indigo-500 to-purple-800",
            is_available: true, availability_text: "MON / WED / FRI",
            image_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Yoruba"]
        },
        // ─── Neurology (2) ───
        {
            full_name: "Dr. Elena Vance", specialty: "Neurology Specialist",
            department_id: deptMap.get("Neurology"), experience: "12+ Years", rating: 4.8,
            bio: "Expert in neurodegenerative disorders, epilepsy management, and advanced migraine treatments.",
            initials: "EV", color_grad: "from-purple-600 to-indigo-800",
            is_available: true, availability_text: "MON / TUE / THU / FRI",
            image_url: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Spanish"]
        },
        {
            full_name: "Dr. Kwame Asante", specialty: "Neurology Specialist",
            department_id: deptMap.get("Neurology"), experience: "9 Years", rating: 4.6,
            bio: "Neurophysiology researcher specializing in stroke prevention and cognitive rehabilitation.",
            initials: "KA", color_grad: "from-violet-600 to-fuchsia-800",
            is_available: true, availability_text: "TUE / WED / FRI",
            image_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "Twi"]
        },
        // ─── Pediatrics (2) ───
        {
            full_name: "Dr. Julian Marc", specialty: "Pediatrics Lead",
            department_id: deptMap.get("Pediatrics"), experience: "10+ Years", rating: 4.7,
            bio: "Dedicated to holistic child healthcare from infancy through adolescence and adolescent behavioral therapy.",
            initials: "JM", color_grad: "from-emerald-500 to-teal-700",
            is_available: true, availability_text: "MON / WED / THU / SAT",
            image_url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "French"]
        },
        {
            full_name: "Dr. Lisa Chen", specialty: "Pediatrics Specialist",
            department_id: deptMap.get("Pediatrics"), experience: "7 Years", rating: 4.8,
            bio: "Neonatal care specialist with a focus on early childhood developmental milestones and immunization.",
            initials: "LC", color_grad: "from-green-500 to-emerald-700",
            is_available: true, availability_text: "TUE / THU / SUN",
            image_url: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Mandarin"]
        },
        // ─── Orthopedics (2) ───
        {
            full_name: "Dr. Marcus Vance", specialty: "Orthopedics Surgeon",
            department_id: deptMap.get("Orthopedics"), experience: "14+ Years", rating: 4.8,
            bio: "Specializes in athletic joint reconstructive surgery, bone pathology, and sports medicine.",
            initials: "MV", color_grad: "from-orange-500 to-rose-700",
            is_available: true, availability_text: "MON / TUE / THU / FRI",
            image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English"]
        },
        {
            full_name: "Dr. Fatima Al-Rashid", specialty: "Orthopedics Specialist",
            department_id: deptMap.get("Orthopedics"), experience: "11 Years", rating: 4.7,
            bio: "Expert in spinal surgery, joint replacement, and pediatric orthopedic conditions.",
            initials: "FA", color_grad: "from-amber-500 to-orange-800",
            is_available: true, availability_text: "MON / WED / FRI",
            image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Arabic"]
        },
        // ─── Dermatology (2) ───
        {
            full_name: "Dr. Clara Shore", specialty: "Clinical Dermatologist",
            department_id: deptMap.get("Dermatology"), experience: "11 Years", rating: 4.9,
            bio: "Focuses on skin restoration, chronic dermatology conditions, and cosmetic dermatology.",
            initials: "CS", color_grad: "from-pink-500 to-purple-800",
            is_available: true, availability_text: "TUE / WED / FRI / SAT",
            image_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English"]
        },
        {
            full_name: "Dr. David Kim", specialty: "Clinical Dermatologist",
            department_id: deptMap.get("Dermatology"), experience: "5 Years", rating: 4.5,
            bio: "Specializes in laser treatments, acne therapy, and immune-mediated skin disorders.",
            initials: "DK", color_grad: "from-rose-500 to-red-800",
            is_available: true, availability_text: "MON / WED / THU",
            image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "Korean"]
        },
        // ─── Ophthalmology (1) ───
        {
            full_name: "Dr. Priya Sharma", specialty: "Ophthalmology Specialist",
            department_id: deptMap.get("Ophthalmology"), experience: "13 Years", rating: 4.8,
            bio: "Expert in cataract surgery, glaucoma management, and retinal disease treatment.",
            initials: "PS", color_grad: "from-cyan-500 to-blue-700",
            is_available: true, availability_text: "MON / WED / FRI",
            image_url: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Hindi"]
        },
        // ─── Gynecology (1) ───
        {
            full_name: "Dr. Nkechi Eze", specialty: "Gynecology Specialist",
            department_id: deptMap.get("Gynecology"), experience: "16+ Years", rating: 4.9,
            bio: "Leading expert in maternal-fetal medicine, minimally invasive gynecologic surgery, and fertility treatment.",
            initials: "NE", color_grad: "from-fuchsia-500 to-pink-800",
            is_available: true, availability_text: "TUE / THU / SAT",
            image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
            gender: "Female", languages: ["English", "Igbo"]
        },
        // ─── Internal Medicine (1) ───
        {
            full_name: "Dr. Michael Torres", specialty: "Internal Medicine Lead",
            department_id: deptMap.get("Internal Medicine"), experience: "18+ Years", rating: 4.9,
            bio: "Board-certified internist managing complex multi-system diseases, diabetes, and hypertension.",
            initials: "MT", color_grad: "from-slate-600 to-gray-800",
            is_available: true, availability_text: "MON–FRI",
            image_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
            gender: "Male", languages: ["English", "Spanish"]
        }
    ];

    console.log(`Upserting ${specialistsList.length} specialists...`);
    for (const spec of specialistsList) {
        // Check if specialist already exists by full_name
        const { data: existing } = await supabase
            .from("specialists")
            .select("id")
            .eq("full_name", spec.full_name)
            .maybeSingle();

        if (existing) {
            // Update existing record
            const { error } = await supabase
                .from("specialists")
                .update(spec)
                .eq("id", existing.id);
            if (error) console.error(`  ✗ update ${spec.full_name}:`, error.message);
        } else {
            // Insert new record
            const { error } = await supabase.from("specialists").insert([spec]);
            if (error) console.error(`  ✗ insert ${spec.full_name}:`, error.message);
        }
    }
    console.log("  ✓ specialists done\n");

    const { data: dbSpecs } = await supabase.from("specialists").select("id, full_name");
    if (!dbSpecs || dbSpecs.length === 0) {
        console.error("No specialists found in DB — aborting.");
        return;
    }
    const specMap = new Map(dbSpecs.map(s => [s.full_name, s.id]));
    console.log(`  Found ${dbSpecs.length} specialists in DB\n`);

    // ── 3. Seed specialist_availability (weekly templates) ──────
    console.log("Seeding specialist_availability templates...");
    let availRows: any[] = [];
    for (const [name, template] of Object.entries(DOCTOR_SCHEDULES)) {
        const specId = specMap.get(name);
        if (!specId) { console.warn(`  ⚠ No DB id for ${name}`); continue; }
        for (const entry of template) {
            availRows.push({
                specialist_id: specId,
                day_of_week: entry.day_of_week,
                time_slots: entry.time_slots
            });
        }
    }
    const { error: availError } = await supabase
        .from("specialist_availability")
        .upsert(availRows, { onConflict: "specialist_id,day_of_week" });
    if (availError) console.error("  ✗ availability upsert error:", availError.message);
    else console.log(`  ✓ ${availRows.length} availability rows seeded\n`);

    // ── 4. Generate 4 weeks of dated slots from templates ───────
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

    console.log(`Seeding specialist_schedules: ${allDates.length} days × ${dbSpecs.length} specialists...`);

    const BATCH_SIZE = 300;
    let rows: any[] = [];
    let total = 0;

    for (const spec of dbSpecs) {
        const template = DOCTOR_SCHEDULES[spec.full_name];
        if (!template) continue;

        // Build a quick lookup: dayOfWeek → time_slots[]
        const daySlotMap = new Map(template.map(t => [t.day_of_week, t.time_slots]));

        for (const d of allDates) {
            const slots = daySlotMap.get(d.dayOfWeek);
            if (!slots) continue; // doctor doesn't work this day

            for (const s of slots) {
                rows.push({
                    specialist_id: spec.id,
                    available_date: d.dateStr,
                    date_val: d.dateVal,
                    time_slot: s,
                    is_booked: false
                });

                if (rows.length >= BATCH_SIZE) {
                    const { error } = await supabase
                        .from("specialist_schedules")
                        .upsert(rows, { onConflict: "specialist_id,available_date,time_slot" });
                    if (error) console.error("  batch error:", error.message);
                    else total += rows.length;
                    rows = [];
                }
            }
        }
    }

    if (rows.length > 0) {
        const { error } = await supabase
            .from("specialist_schedules")
            .upsert(rows, { onConflict: "specialist_id,available_date,time_slot" });
        if (error) console.error("  final batch error:", error.message);
        else total += rows.length;
    }

    console.log(`\n🎉 Done! Seeded ${total} schedule slots for ${dbSpecs.length} specialists across ${allDates.length} days.`);
}

seedAll().catch(console.error);
