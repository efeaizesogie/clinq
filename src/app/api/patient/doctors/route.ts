import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all specialists to list in the start chat panel
        const { data: specialists, error } = await supabase
            .from('specialists')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ specialists: specialists || [] });
    } catch (err: any) {
        console.error("GET patient doctors error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
