import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedAdmin() {
    const adminEmail = 'admin@clinq.com';
    const adminPassword = 'Admin-Secure-Password-123!';

    console.log(`Attempting to sign up admin user (${adminEmail})...`);

    // Sign up the admin user
    const { data, error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
            data: {
                role: 'admin',
                fullName: 'Clinq Administrator'
            }
        }
    });

    if (error) {
        if (error.message.includes('already registered')) {
            console.log(`\nAdmin user ${adminEmail} already exists!`);
        } else {
            console.error("Error creating admin user:", error.message);
        }
    } else {
        console.log(`\n--- NEW ADMIN USER CREATED SUCCESSFULLY ---`);
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`(Make sure email confirmations are disabled in Supabase, or confirm via email)`);
        console.log(`-------------------------------------------`);
    }
}

seedAdmin().catch(console.error);
