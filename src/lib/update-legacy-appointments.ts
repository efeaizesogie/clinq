import { createClient } from "@supabase/supabase-js";
import { startOfWeek, addDays, format, parseISO, setHours, setMinutes, addMinutes } from "date-fns";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase configuration in .env.local.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function upgradeLegacyData() {
    const { data: appointments, error: fetchErr } = await supabase
        .from("appointments")
        .select("*")
        .is("date", null); // Only touch ones that lack a date

    if (fetchErr) {
        console.error("Error fetching legacy appointments:", fetchErr);
        return;
    }

    if (!appointments || appointments.length === 0) {
        console.log("No legacy appointments missing 'date' found. Up to date.");
        return;
    }

    console.log(`Found ${appointments.length} legacy appointments. Upgrading...`);

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    // We'll walk sequentially through slots prioritizing 09:00am to 16:00pm M-F
    let currentDayOffset = 0;
    let currentHour = 9;

    for (const app of appointments) {
        const targetDate = addDays(weekStart, currentDayOffset);
        const dateStr = format(targetDate, "yyyy-MM-dd");

        const timeStartStr = `${String(currentHour).padStart(2, '0')}:00`;
        const timeEndStr = `${String(currentHour + 1).padStart(2, '0')}:00`;
        const dayOfWeek = format(targetDate, "EEEE");

        const payload = {
            date: dateStr,
            time_start: timeStartStr,
            time_end: timeEndStr,
            day_of_week: dayOfWeek,
            is_urgent: false
        };

        const { error: updateErr } = await supabase
            .from("appointments")
            .update(payload)
            .eq("id", app.id);

        if (updateErr) {
            console.error(`Failed to update appointment ${app.id}:`, updateErr.message);
        } else {
            console.log(`Updated ${app.patient_name} -> ${dateStr} ${timeStartStr}-${timeEndStr}`);
        }

        // Step to next hour for next legacy record
        currentHour += 1;
        if (currentHour > 16) {
            currentHour = 9;
            currentDayOffset += 1; // cycle to next day
            if (currentDayOffset > 4) currentDayOffset = 0; // wrap around Monday-Friday
        }
    }

    console.log("Legacy DB Upgrade Complete!");
}

upgradeLegacyData().catch(console.error);
