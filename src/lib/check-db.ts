import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    let out = "";
    const log = (msg: string) => {
        console.log(msg);
        out += msg + "\n";
    };

    const { data: specialists, error: sErr } = await supabase.from("specialists").select("*");
    log(`SPECIALISTS ERROR: ${sErr?.message || "None"}`);
    log(`SPECIALISTS COUNT: ${specialists?.length || 0}`);
    if (specialists && specialists.length > 0) {
        log(`SPECIALIST EXAMPLE: ${JSON.stringify(specialists[0])}`);
    }

    const { data: perf, error: pErr } = await supabase.from("department_performance").select("*");
    log(`PERFORMANCE ERROR: ${pErr?.message || "None"}`);
    log(`PERFORMANCE COUNT: ${perf?.length || 0}`);
    if (perf && perf.length > 0) {
        log(`PERFORMANCE EXAMPLE: ${JSON.stringify(perf[0])}`);
    }

    fs.writeFileSync("db_log_utf8.txt", out, "utf-8");
}

check().catch(console.error);
