import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error("List users error:", error.message);
        return;
    }
    console.log("=== Auth Users ===");
    for (const u of users) {
        console.log(`Email: ${u.email}, Info:`, u.user_metadata);
    }
}

run().catch(console.error);
