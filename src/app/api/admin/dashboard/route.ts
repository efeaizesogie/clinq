import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface Patient {
    id: string;
    full_name: string;
    age: number;
    gender: string;
    admission_id: string;
    department: string;
    status: string;
    bpm: number;
    spo2: number;
    admitted_at: string;
}

export interface StaffMember {
    id: string;
    full_name: string;
    role: string;
    department: string;
    is_on_duty: boolean;
    initials: string;
    color_bg: string;
    color_text: string;
}

export interface AdminDashboardData {
    kpis: {
        totalPatients: number;
        patientGrowth: number;
        bedOccupancy: number;
        appointments: number;
        pendingCheckIn: number;
        dailyRevenue: number;
        revenueGrowth: number;
    };
    recentAdmissions: Patient[];
    onDutyStaff: StaffMember[];
    onDutyCount: number;
}

function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('your-project-id') && !key.includes('your-anon-key'));
}

export async function GET() {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    try {
        const supabase = await createClient();

        const [patientsCount, appointmentsResult, staffResult, recentAdmissions] = await Promise.all([
            supabase.from('patients').select('*', { count: 'exact', head: false }),
            supabase.from('appointments').select('*', { count: 'exact', head: false }).eq('status', 'Pending'),
            supabase.from('staff_members').select('*').order('is_on_duty', { ascending: false }),
            supabase.from('patients').select('*').order('admitted_at', { ascending: false }).limit(3),
        ]);

        if (patientsCount.error) throw patientsCount.error;
        if (appointmentsResult.error) throw appointmentsResult.error;
        if (staffResult.error) throw staffResult.error;
        if (recentAdmissions.error) throw recentAdmissions.error;

        const totalPatients = patientsCount.count ?? 0;
        const pendingCheckIn = appointmentsResult.count ?? 0;
        const appointments = appointmentsResult.data?.length ?? 0;
        const onDutyStaff: StaffMember[] = staffResult.data ?? [];
        const onDutyCount = onDutyStaff.filter(s => s.is_on_duty).length;
        const recentAdmissionsData: Patient[] = recentAdmissions.data ?? [];

        const data: AdminDashboardData = {
            kpis: {
                totalPatients,
                patientGrowth: 4.2,
                bedOccupancy: 82,
                appointments: appointments,
                pendingCheckIn,
                dailyRevenue: 42800,
                revenueGrowth: 12.1,
            },
            recentAdmissions: recentAdmissionsData,
            onDutyStaff,
            onDutyCount: onDutyCount,
        };

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error: any) {
        console.error('[admin/dashboard] fetch failed:', error.message);
        return NextResponse.json({ error: error.message || "Failed to fetch admin dashboard stats." }, { status: 500 });
    }
}

