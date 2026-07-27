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

const fallbackData: AdminDashboardData = {
    kpis: {
        totalPatients: 1284,
        patientGrowth: 4.2,
        bedOccupancy: 82,
        appointments: 142,
        pendingCheckIn: 12,
        dailyRevenue: 42800,
        revenueGrowth: 12.1,
    },
    recentAdmissions: [
        { id: '1', full_name: 'Robert J. Henderson', age: 52, gender: 'Male', admission_id: '#ADM-9021', department: 'Cardiology',  status: 'Stable',      bpm: 72,  spo2: 98, admitted_at: new Date().toISOString() },
        { id: '2', full_name: 'Elena Lockwood',      age: 29, gender: 'Female', admission_id: '#ADM-8842', department: 'Emergency',   status: 'Critical',    bpm: 114, spo2: 89, admitted_at: new Date().toISOString() },
        { id: '3', full_name: 'Marcus K. Chen',      age: 41, gender: 'Male', admission_id: '#ADM-9055', department: 'Neurology',   status: 'Observation', bpm: 68,  spo2: 99, admitted_at: new Date().toISOString() },
    ],
    onDutyStaff: [
        { id: '1', full_name: 'Dr. Sarah Vance',    role: 'Chief Surgeon', department: 'Surgery',    is_on_duty: true,  initials: 'SV', color_bg: '#D2E4FF', color_text: '#00355F' },
        { id: '2', full_name: 'Dr. Michael Thorne', role: 'Cardiologist',  department: 'Cardiology', is_on_duty: true,  initials: 'MT', color_bg: '#D5E3FC', color_text: '#00355F' },
        { id: '3', full_name: 'NP Jamie Rollins',   role: 'ER Triage',     department: 'Emergency',  is_on_duty: true,  initials: 'JR', color_bg: '#D4E6E5', color_text: '#576867' },
        { id: '4', full_name: 'Dr. Alan Gregson',   role: 'Pediatrician',  department: 'Pediatrics', is_on_duty: false, initials: 'AG', color_bg: '#E0E3E5', color_text: '#42474F' },
    ],
    onDutyCount: 42,
};

function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('your-project-id') && !key.includes('your-anon-key'));
}

export async function GET() {
    if (!isSupabaseConfigured()) {
        return NextResponse.json(fallbackData);
    }

    try {
        const supabase = await createClient();

        const [patientsCount, appointmentsResult, staffResult, recentAdmissions] = await Promise.all([
            supabase.from('patients').select('*', { count: 'exact', head: false }),
            supabase.from('appointments').select('*', { count: 'exact', head: false }).eq('status', 'Pending'),
            supabase.from('staff_members').select('*').order('is_on_duty', { ascending: false }),
            supabase.from('patients').select('*').order('admitted_at', { ascending: false }).limit(3),
        ]);

        const totalPatients = patientsCount.count ?? fallbackData.kpis.totalPatients;
        const pendingCheckIn = appointmentsResult.count ?? fallbackData.kpis.pendingCheckIn;
        const appointments = appointmentsResult.data?.length ?? fallbackData.kpis.appointments;
        const onDutyStaff: StaffMember[] = staffResult.data ?? fallbackData.onDutyStaff;
        const onDutyCount = onDutyStaff.filter(s => s.is_on_duty).length;
        const recentAdmissionsData: Patient[] = recentAdmissions.data ?? fallbackData.recentAdmissions;

        const data: AdminDashboardData = {
            kpis: {
                totalPatients,
                patientGrowth: 4.2,
                bedOccupancy: 82,
                appointments: appointments || fallbackData.kpis.appointments,
                pendingCheckIn,
                dailyRevenue: 42800,
                revenueGrowth: 12.1,
            },
            recentAdmissions: recentAdmissionsData,
            onDutyStaff,
            onDutyCount: onDutyCount || 42,
        };

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error: any) {
        console.error('[admin/dashboard] fetch failed:', error.message);
        return NextResponse.json(fallbackData);
    }
}
