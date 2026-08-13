import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const email = 'devmode47@gmail.com';
    const password = 'Password123!';

    console.log(`Setting password for ${email} to ${password}...`);

    // List users to get ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error("List users error:", listError.message);
        return;
    }

    const testUser = users.find(u => u.email === email);
    if (!testUser) {
        console.error(`User ${email} not found!`);
        return;
    }

    const { data, error } = await supabase.auth.admin.updateUserById(
        testUser.id,
        { password: password }
    );

    if (error) {
        console.error("Update password error:", error.message);
    } else {
        console.log(`Password updated successfully for ${email}!`);
    }
}

run().catch(console.error);
