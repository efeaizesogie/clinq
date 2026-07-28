import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface PatientRecord {
    id: string;
    full_name: string;
    email: string;
    age: number;
    gender: string;
    medical_id: string;
    assigned_doctor: string;
    department: string;
    last_visit: string;
    admission_status: string; // 'Inpatient' | 'Outpatient' | 'Observation' | 'Emergency'
    status: string;           // 'Active' | 'Archived' | 'Observation' | 'ER/Critical'
    insurance: string;
    initials: string;
    created_at: string;
}

const fallbackPatients: PatientRecord[] = [
    { id: '1', full_name: 'Eleanor Watson',   email: 'eleanor@example.com',  age: 42, gender: 'F', medical_id: '#MC-99201', assigned_doctor: 'Dr. Julian Marcus', department: 'Cardiology',  last_visit: 'Oct 24, 2023', admission_status: 'Observation', status: 'Active',      insurance: 'BlueShield', initials: 'EW', created_at: '' },
    { id: '2', full_name: 'Theodore Hughes',  email: 'theodore@example.com', age: 68, gender: 'M', medical_id: '#MC-88312', assigned_doctor: 'Dr. Sarah Chen',    department: 'Neurology',   last_visit: 'Oct 22, 2023', admission_status: 'Outpatient',  status: 'Archived',    insurance: 'Aetna',      initials: 'TH', created_at: '' },
    { id: '3', full_name: 'Miriam Santiago',  email: 'miriam@example.com',   age: 31, gender: 'F', medical_id: '#MC-12005', assigned_doctor: 'Dr. Julian Marcus', department: 'Pediatrics',  last_visit: 'Oct 25, 2023', admission_status: 'Observation', status: 'Observation', insurance: 'Medicare',   initials: 'MS', created_at: '' },
    { id: '4', full_name: 'Bradley Knight',   email: 'bradley@example.com',  age: 55, gender: 'M', medical_id: '#MC-44567', assigned_doctor: 'Dr. Anita Varma',   department: 'Orthopedics', last_visit: 'Oct 21, 2023', admission_status: 'Inpatient',   status: 'Active',      insurance: 'United',     initials: 'BK', created_at: '' },
    { id: '5', full_name: 'Leah Franklin',    email: 'leah@example.com',     age: 19, gender: 'F', medical_id: '#MC-77811', assigned_doctor: 'Dr. Sarah Chen',    department: 'Emergency',   last_visit: 'Oct 18, 2023', admission_status: 'Emergency',   status: 'ER/Critical', insurance: 'BlueShield', initials: 'LF', created_at: '' },
];

function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('your-project-id') && !key.includes('your-anon-key'));
}

// GET — paginated patient list with optional filters
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const search = searchParams.get('search') ?? '';
    const admissionStatus = searchParams.get('admission_status') ?? '';
    const department = searchParams.get('department') ?? '';
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    if (!isSupabaseConfigured()) {
        let filtered = fallbackPatients;
        if (search) filtered = filtered.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()));
        if (admissionStatus) filtered = filtered.filter(p => p.admission_status === admissionStatus);
        if (department) filtered = filtered.filter(p => p.department === department);
        return NextResponse.json({ patients: filtered.slice(from, to + 1), total: filtered.length });
    }

    try {
        const supabase = await createClient();
        let query = supabase.from('patient_records').select('*', { count: 'exact' });
        if (search) query = query.ilike('full_name', `%${search}%`);
        if (admissionStatus) query = query.eq('admission_status', admissionStatus);
        if (department) query = query.eq('department', department);
        const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
        if (error) throw error;
        return NextResponse.json({ patients: data ?? [], total: count ?? 0 });
    } catch (err: any) {
        console.error('[admin/patients GET]', err.message);
        return NextResponse.json({ patients: fallbackPatients, total: fallbackPatients.length });
    }
}

// POST — add new patient (creates temp account, sends invite email via Supabase Auth)
export async function POST(req: NextRequest) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const body = await req.json();
        const { full_name, email, age, gender, department, assigned_doctor, admission_status, insurance } = body;

        if (!full_name || !email) {
            return NextResponse.json({ error: 'full_name and email are required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Generate medical ID
        const medical_id = `#MC-${Math.floor(10000 + Math.random() * 90000)}`;
        const initials = full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

        // Insert patient record
        const { data: patient, error: insertError } = await supabase
            .from('patient_records')
            .insert({
                full_name,
                email,
                age: age ?? 0,
                gender: gender ?? 'Unknown',
                medical_id,
                assigned_doctor: assigned_doctor ?? '',
                department: department ?? '',
                last_visit: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                admission_status: admission_status ?? 'Inpatient',
                status: 'Active',
                insurance: insurance ?? '',
                initials,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // Send invite email via Supabase Auth (creates temp account)
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: { full_name, role: 'patient', medical_id },
            redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '')}/register`,
        });

        // Invite error is non-fatal — patient record is already created
        if (inviteError) {
            console.warn('[admin/patients] invite email failed:', inviteError.message);
        }

        return NextResponse.json({ patient, inviteEmailSent: !inviteError }, { status: 201 });
    } catch (err: any) {
        console.error('[admin/patients POST]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH — update patient status or other editable fields
export async function PATCH(req: NextRequest) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;
        if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('patient_records')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ patient: data });
    } catch (err: any) {
        console.error('[admin/patients PATCH]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
