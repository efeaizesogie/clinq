import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const targetEmail = 'efeaizesogie@gmail.com';

if (!supabaseUrl || !supabaseServiceKey) {
    console.log("\n========================================================");
    console.log("SUPABASE_SERVICE_ROLE_KEY is not defined in .env.local.");
    console.log("========================================================\n");
    console.log("Please run this SQL snippet directly in your Supabase SQL Editor to elevate your user:");
    console.log(`\nUPDATE auth.users \nSET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb \nWHERE email = '${targetEmail}';\n`);
    process.exit(0);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function promoteUser() {
    console.log(`Connecting to Supabase and looking up user: ${targetEmail}...`);

    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
        console.error("Error listing users:", listError.message);
        return;
    }

    const user = usersData.users.find(u => u.email === targetEmail);
    if (!user) {
        console.error(`\nError: User ${targetEmail} was not found. Please register this account first.`);
        return;
    }

    console.log(`Found user: ${user.id}. Updating user metadata...`);

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, role: 'admin' },
        app_metadata: { ...user.app_metadata, role: 'admin' }
    });

    if (updateError) {
        console.error("Error promoting user:", updateError.message);
    } else {
        console.log(`\nSUCCESS: User ${targetEmail} has been successfully promoted to admin in Supabase!`);
    }
}

promoteUser().catch(console.error);
