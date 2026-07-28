/**
 * Usage: npx tsx src/lib/seed-staff-directory.ts
 * Description: Populates Supabase 'departments', 'specialists', and 'department_performance' tables with image URLs.
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

async function seedStaffDirectory() {
    console.log("Seeding staff directory...");

    // 1. Seed or update Departments
    const depts = [
        { name: 'Cardiology', slug: 'cardiology', description: 'Comprehensive heart care', icon_name: 'HeartPulse', doctors_count: 5, category: 'Specialty' },
        { name: 'Neurology', slug: 'neurology', description: 'Expert diagnosis for nervous system', icon_name: 'Brain', doctors_count: 4, category: 'Specialty' },
        { name: 'Pediatrics', slug: 'pediatrics', description: 'Dedicated care for infants', icon_name: 'Baby', doctors_count: 6, category: 'Primary Care' },
        { name: 'Orthopedics', slug: 'orthopedics', description: 'Specialized care for bones', icon_name: 'Activity', doctors_count: 5, category: 'Specialty' },
        { name: 'Oncology', slug: 'oncology', description: 'Advanced tumor therapeutics', icon_name: 'Activity', doctors_count: 2, category: 'Specialty' },
        { name: 'Emergency', slug: 'emergency', description: 'Critical emergency care', icon_name: 'Activity', doctors_count: 10, category: 'Clinical' }
    ];

    console.log("Upserting departments...");
    for (const d of depts) {
        const { error } = await supabase
            .from("departments")
            .upsert([d], { onConflict: "slug" });
        if (error) {
            console.error(`Failed to upsert department ${d.name}:`, error.message);
        } else {
            console.log(`Upserted department: ${d.name}`);
        }
    }

    // Get department map
    const { data: dbDepts, error: readError } = await supabase.from("departments").select("id, slug");
    if (readError) {
        console.error("Failed to read departments:", readError.message);
        return;
    }

    const deptMap = new Map(dbDepts.map(d => [d.slug, d.id]));

    // 2. Clear old specialists and seed new ones
    console.log("Clearing existing specialists...");
    const { error: clearError } = await supabase.from("specialists").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (clearError) {
        console.warn("Could not delete from specialists:", clearError.message);
    }

    const specialistsToSeed = [
        {
            full_name: "Dr. Julian Vance",
            specialty: "MD, FACC • Cardiology",
            department_id: deptMap.get("cardiology"),
            experience: "15+ Years",
            rating: 4.9,
            bio: "Specializing in cardiovascular care, heart failure management, and clinical cardiology therapeutics.",
            initials: "JV",
            color_grad: "from-blue-600 to-indigo-800",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            retention_rate: 98.2,
            tag: "CLINICAL FACULTY",
            status: "Active",
            shift: "08:00 - 20:00 (Floor 4)",
            image_url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
        },
        {
            full_name: "Dr. Elena Rodriguez",
            specialty: "Ph.D, Neuro • Neurology",
            department_id: deptMap.get("neurology"),
            experience: "12+ Years",
            rating: 4.8,
            bio: "Expert in neurodegenerative disorders and advanced migraine treatments using state-of-the-art neurology models.",
            initials: "ER",
            color_grad: "from-purple-600 to-indigo-800",
            is_available: false,
            availability_text: "NEXT SLOT: TOMORROW",
            retention_rate: 94.5,
            tag: "RESIDENT",
            status: "Off Duty",
            shift: "Tomorrow, 08:00",
            image_url: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400"
        },
        {
            full_name: "Dr. Marcus Thorne",
            specialty: "MD • Pediatrics",
            department_id: deptMap.get("pediatrics"),
            experience: "10+ Years",
            rating: 4.7,
            bio: "Dedicated to holistic child healthcare from infancy through adolescence.",
            initials: "MT",
            color_grad: "from-emerald-500 to-teal-700",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            retention_rate: 91.0,
            tag: "RESIDENT",
            status: "Active",
            shift: "12:00 - 00:00 (Wing B)",
            image_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400"
        },
        {
            full_name: "Dr. Sarah Jenkins",
            specialty: "MD, M.Sc • Oncology",
            department_id: deptMap.get("oncology"),
            experience: "14+ Years",
            rating: 5.0,
            bio: "Pioneer in oncology screenings and tumor therapeutics.",
            initials: "SJ",
            color_grad: "from-pink-500 to-purple-800",
            is_available: false,
            availability_text: "NEXT SLOT: MON",
            retention_rate: 96.7,
            tag: "FELLOW",
            status: "Emergency Leave",
            shift: "Emergency Leave",
            image_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
        },
        {
            full_name: "Dr. Leo Grant",
            specialty: "MD, Ortho • Orthopedics",
            department_id: deptMap.get("orthopedics"),
            experience: "11 Years",
            rating: 4.6,
            bio: "Specialist in athletic joint reconstructive surgery and complex bone pathology.",
            initials: "LG",
            color_grad: "from-orange-500 to-rose-700",
            is_available: true,
            availability_text: "AVAILABLE TODAY",
            retention_rate: 92.1,
            tag: "CONSULTANT",
            status: "Active",
            shift: "08:30 - 18:00 (Surgery Unit)",
            image_url: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400"
        }
    ];

    // Check if the image_url column exists in specialists table
    console.log("Checking database schema for 'image_url' column...");
    const { error: testColError } = await supabase
        .from("specialists")
        .select("image_url")
        .limit(1);

    const hasImageUrl = !testColError || !testColError.message.includes("does not exist");
    console.log(`Database schema supports 'image_url': ${hasImageUrl}`);

    console.log("Inserting specialists...");
    for (const spec of specialistsToSeed) {
        const payload: any = { ...spec };
        if (!hasImageUrl) {
            delete payload.image_url;
        }
        const { error } = await supabase
            .from("specialists")
            .insert([payload]);
        if (error) {
            console.error(`Failed to insert specialist ${spec.full_name}:`, error.message);
        } else {
            console.log(`Inserted specialist: ${spec.full_name}`);
        }
    }

    // 3. Clear and seed department performance
    console.log("Clearing department performance...");
    const { error: clearDPError } = await supabase.from("department_performance").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (clearDPError) {
        console.warn("Could not clear department_performance:", clearDPError.message);
    }

    const performanceMetrics = [
        {
            name: "Cardiology",
            location: "Floor 4 North Wing",
            head_of_dept: "Dr. Julian Vance",
            staff_count: 42,
            throughput: "164 pts / week",
            efficiency: 94,
            status: "Optimal"
        },
        {
            name: "Neurology",
            location: "Floor 2 East Wing",
            head_of_dept: "Dr. Elena Rodriguez",
            staff_count: 28,
            throughput: "112 pts / week",
            efficiency: 88,
            status: "Optimal"
        },
        {
            name: "Emergency Room",
            location: "Floor 1 Main Lobby",
            head_of_dept: "Dr. Robert Chen",
            staff_count: 56,
            throughput: "420 pts / week",
            efficiency: 62,
            status: "Stressed"
        }
    ];

    console.log("Inserting department performance stats...");
    for (const pm of performanceMetrics) {
        const { error } = await supabase
            .from("department_performance")
            .insert([pm]);
        if (error) {
            console.error(`Failed to insert performance metrics for ${pm.name}:`, error.message);
        } else {
            console.log(`Inserted performance metrics for: ${pm.name}`);
        }
    }

    console.log("Seeding process completed!");
}

seedStaffDirectory().catch(console.error);
