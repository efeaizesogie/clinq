/**
 * Usage: npx tsx src/lib/seed-appointments.ts
 * Description: Populates Supabase 'appointments' table with fallback mock data locked to the active week.
 */
import { createClient } from "@supabase/supabase-js";
import { startOfWeek, addDays, format } from "date-fns";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase configuration in .env.local.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const today = new Date();
const mon = startOfWeek(today, { weekStartsOn: 1 });

const fallbackAppointments = [
    {
        patient_name: "V. Richards",
        department: "Cardiology",
        type: "Routine",
        date: format(addDays(mon, 0), "yyyy-MM-dd"), // Monday
        time_start: "09:00",
        time_end: "10:00",
        day_of_week: "Monday",
        is_urgent: false,
        created_at: new Date().toISOString()
    },
    {
        patient_name: "M. Theron",
        department: "Neurology",
        type: "Intake",
        date: format(addDays(mon, 0), "yyyy-MM-dd"), // Monday
        time_start: "11:00",
        time_end: "12:45",
        day_of_week: "Monday",
        is_urgent: false,
        created_at: new Date().toISOString()
    },
    {
        patient_name: "J. Doe",
        department: "Orthopedics",
        type: "Post-Op",
        date: format(addDays(mon, 1), "yyyy-MM-dd"), // Tuesday
        time_start: "14:00",
        time_end: "15:30",
        day_of_week: "Tuesday",
        is_urgent: false,
        created_at: new Date().toISOString()
    },
    {
        patient_name: "Group Consultation",
        department: "General Practice",
        type: "Group",
        date: format(addDays(mon, 2), "yyyy-MM-dd"), // Wednesday
        time_start: "08:15",
        time_end: "09:45",
        day_of_week: "Wednesday",
        is_urgent: false,
        created_at: new Date().toISOString()
    },
    {
        patient_name: "S. Case",
        department: "Cardiology",
        type: "Follow up",
        date: format(addDays(mon, 4), "yyyy-MM-dd"), // Friday
        time_start: "15:00",
        time_end: "15:45",
        day_of_week: "Friday",
        is_urgent: false,
        created_at: new Date().toISOString()
    }
];

async function seedAppointments() {
    console.log("Seeding appointments for week of:", format(mon, "yyyy-MM-dd"));

    for (const app of fallbackAppointments) {
        const { error } = await supabase
            .from("appointments")
            .insert([app]);

        if (error) {
            console.error(`Failed to insert appointment for ${app.patient_name}:`, error);
        } else {
            console.log(`Inserted appointment for ${app.patient_name} on ${app.date}`);
        }
    }

    console.log("Seeding complete.");
}

seedAppointments().catch(console.error);
