import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Reset status to 'Pending' and restore default pending color
        const { data, error } = await supabase
            .from('patient_billing')
            .update({
                status: 'Pending',
                status_color: 'bg-[#FFDAD6] text-[#93000A]'
            })
            .eq('patient_id', user.id)
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, count: data?.length || 0 });

    } catch (err: any) {
        console.error("Database Reset Billing Error:", err.message);
        return NextResponse.json({ error: err.message || "Failed to reset billing statuses." }, { status: 500 });
    }
}
