import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tablesToCheck = [
    "patient_profiles",
    "patient_allergies",
    "patient_immunizations",
    "patient_prescriptions",
    "patient_lab_results",
    "patient_timeline_events",
    "patient_billing",
    "patient_payment_methods",
    "patient_insurance",
    "patient_settings",
    "patient_menus",
    "conversations",
    "messages",
    "appointments"
];

async function verifySchema() {
    console.log("=== Clinq Supabase Schema Verification ===");
    console.log("Supabase URL:", supabaseUrl);
    console.log("Using Key:", supabaseKey.slice(0, 15) + "...");
    console.log("------------------------------------------");

    let allOk = true;

    for (const table of tablesToCheck) {
        try {
            const { data, error } = await supabase.from(table).select("*").limit(1);

            if (error) {
                // If table doesn't exist, postgrest usually returns 42P01 or similar relation does not exist
                if (error.message.includes("does not exist") || error.code === "42P01") {
                    console.error(`❌ Table '${table}': does not exist.`);
                    allOk = false;
                } else {
                    console.warn(`⚠️ Table '${table}': query error but table might exist. Code: ${error.code}, Message: ${error.message}`);
                }
            } else {
                console.log(`✅ Table '${table}': exists and is accessible. Columns: ${JSON.stringify(data[0] ? Object.keys(data[0]) : "Empty table")}`);
            }
        } catch (err: any) {
            console.error(`❌ Table '${table}': network or client error:`, err.message);
            allOk = false;
        }
    }

    console.log("------------------------------------------");
    if (allOk) {
        console.log("🎉 All tables verified successfully!");
    } else {
        console.warn("⚠️ Some tables/relations are missing or inaccessible. Please run supabase/patient_dashboard_schema.sql in the Supabase SQL Editor.");
    }
}

verifySchema().catch(console.error);
