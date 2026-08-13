import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking for columns in database...");
    const { data: conv, error: convError } = await supabase.from("conversations").select("*").limit(1);
    if (convError) {
        console.error("Conversations error:", convError);
    } else {
        console.log("Conversations row columns:", conv[0] ? Object.keys(conv[0]) : "Empty table");
    }

    const { data: prof, error: profError } = await supabase.from("patient_profiles").select("*").limit(1);
    if (profError) {
        console.error("Profiles error:", profError);
    } else {
        console.log("Profiles row columns:", prof[0] ? Object.keys(prof[0]) : "Empty table");
    }
}

check().catch(console.error);
