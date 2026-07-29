import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');

        // We need service_role_key to delete users from auth on Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: "Missing backend credentials." }, { status: 500 });
        }

        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        // 1. Verify user with Anon Client using the provided token
        const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data: { user }, error: authError } = await anonSupabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "Invalid token or unauthorized" }, { status: 401 });
        }

        // 2. Init Admin Client
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

        // Note: Due to foreign key constraints, we might need to delete associated data first, 
        // or rely on ON DELETE CASCADE. Assuming CASCADE is configured for patient_profiles, settings, etc.
        // If not, supabase.auth.admin.deleteUser might fail or leave orphans.
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error("Delete user error:", deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Account deleted successfully." });

    } catch (error: any) {
        console.error("Delete route exception:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
