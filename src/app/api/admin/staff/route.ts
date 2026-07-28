import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Specialist, DepartmentPerformance } from '@/lib/types';

// Let's define the fallback data in case Supabase is not configured or fails.
const fallbackSpecialists: Specialist[] = [
    {
        id: '1',
        full_name: 'Dr. Julian Vance',
        specialty: 'MD, FACC • Cardiology',
        department_id: '',
        department_name: 'Cardiology',
        experience: '15+ Years',
        rating: 4.9,
        bio: 'Specializing in cardiovascular care, heart failure management, and clinical cardiology therapeutics.',
        initials: 'JV',
        color_grad: 'from-blue-600 to-indigo-800',
        is_available: true,
        availability_text: 'AVAILABLE TODAY',
        retention_rate: 98.2,
        tag: 'CLINICAL FACULTY',
        status: 'Active',
        shift: '08:00 - 20:00 (Floor 4)',
        image_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: '2',
        full_name: 'Dr. Elena Rodriguez',
        specialty: 'Ph.D, Neuro • Neurology',
        department_id: '',
        department_name: 'Neurology',
        experience: '12+ Years',
        rating: 4.8,
        bio: 'Expert in neurodegenerative disorders and advanced migraine treatments using state-of-the-art neurology models.',
        initials: 'ER',
        color_grad: 'from-purple-600 to-indigo-800',
        is_available: false,
        availability_text: 'NEXT SLOT: TOMORROW',
        retention_rate: 94.5,
        tag: 'RESIDENT',
        status: 'Off Duty',
        shift: 'Tommorow, 08:00',
        image_url: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: '3',
        full_name: 'Dr. Marcus Thorne',
        specialty: 'MD • Pediatrics',
        department_id: '',
        department_name: 'Pediatrics',
        experience: '10+ Years',
        rating: 4.7,
        bio: 'Dedicated to holistic child healthcare from infancy through adolescence.',
        initials: 'MT',
        color_grad: 'from-emerald-500 to-teal-700',
        is_available: true,
        availability_text: 'AVAILABLE TODAY',
        retention_rate: 91.0,
        tag: 'RESIDENT',
        status: 'Active',
        shift: '12:00 - 00:00 (Wing B)',
        image_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: '4',
        full_name: 'Dr. Sarah Jenkins',
        specialty: 'MD, M.Sc • Oncology',
        department_id: '',
        department_name: 'Oncology',
        experience: '14+ Years',
        rating: 5.0,
        bio: 'Pioneer in oncology screenings and tumor therapeutics.',
        initials: 'SJ',
        color_grad: 'from-pink-500 to-purple-800',
        is_available: false,
        availability_text: 'NEXT SLOT: MON',
        retention_rate: 96.7,
        tag: 'FELLOW',
        status: 'Emergency Leave',
        shift: 'Emergency Leave',
        image_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: '5',
        full_name: 'Dr. Leo Grant',
        specialty: 'MD, Ortho • Orthopedics',
        department_id: '',
        department_name: 'Orthopedics',
        experience: '11 Years',
        rating: 4.6,
        bio: 'Specialist in athletic joint reconstructive surgery and complex bone pathology.',
        initials: 'LG',
        color_grad: 'from-orange-500 to-rose-700',
        is_available: true,
        availability_text: 'AVAILABLE TODAY',
        retention_rate: 92.1,
        tag: 'CONSULTANT',
        status: 'Active',
        shift: '08:30 - 18:00 (Surgery Unit)',
        image_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400'
    }
];

const fallbackPerformance: DepartmentPerformance[] = [
    {
        id: '1',
        name: 'Cardiology',
        location: 'Floor 4 North Wing',
        head_of_dept: 'Dr. Julian Vance',
        staff_count: 42,
        throughput: '164 pts / week',
        efficiency: 94,
        status: 'Optimal',
        created_at: ''
    },
    {
        id: '2',
        name: 'Neurology',
        location: 'Floor 2 East Wing',
        head_of_dept: 'Dr. Elena Rodriguez',
        staff_count: 28,
        throughput: '112 pts / week',
        efficiency: 88,
        status: 'Optimal',
        created_at: ''
    },
    {
        id: '3',
        name: 'Emergency Room',
        location: 'Floor 1 Main Lobby',
        head_of_dept: 'Dr. Robert Chen',
        staff_count: 56,
        throughput: '420 pts / week',
        efficiency: 62,
        status: 'Stressed',
        created_at: ''
    }
];

function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('your-project-id') && !key.includes('your-anon-key'));
}

// GET — Retrieve specialists list, performance, and KPI metrics
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? '';
    const department = searchParams.get('department') ?? ''; // e.g. Cardiology, Neurology, all
    const tag = searchParams.get('tag') ?? ''; // Seniority: e.g. Resident, Fellow, CLINICAL FACULTY
    const availability = searchParams.get('availability') ?? ''; // Status: Active, Off Duty, Emergency Leave
    const sortByPerformance = searchParams.get('sort') === 'performance';

    if (!isSupabaseConfigured()) {
        let filtered = [...fallbackSpecialists];

        if (search) {
            filtered = filtered.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()));
        }
        if (department && department !== 'All Specializations') {
            filtered = filtered.filter(s => s.department_name?.toLowerCase() === department.toLowerCase());
        }
        if (tag && tag !== 'Seniority Level') {
            filtered = filtered.filter(s => s.tag?.toLowerCase() === tag.toLowerCase());
        }
        if (availability && availability !== 'Availability') {
            filtered = filtered.filter(s => s.status?.toLowerCase() === availability.toLowerCase());
        }
        if (sortByPerformance) {
            filtered.sort((a, b) => (b.retention_rate ?? 0) - (a.retention_rate ?? 0));
        }

        return NextResponse.json({
            specialists: filtered,
            kpis: {
                totalActiveStaff: 1280,
                currentlyOnDuty: 342,
                staffRetention: 94.2,
                openPositions: 12
            },
            departmentPerformance: fallbackPerformance
        });
    }

    try {
        const supabase = await createClient();

        // 1. Fetch Specialists joining departments
        let specQuery = supabase.from('specialists').select('*, departments(name)');

        if (search) {
            specQuery = specQuery.ilike('full_name', `%${search}%`);
        }
        if (tag && tag !== 'Seniority Level') {
            specQuery = specQuery.eq('tag', tag);
        }
        if (availability && availability !== 'Availability') {
            specQuery = specQuery.eq('status', availability);
        }

        const { data: specData, error: specError } = await specQuery;
        if (specError) throw specError;

        let specialists: Specialist[] = (specData || []).map((s: any) => ({
            ...s,
            department_name: s.departments?.name || 'Unassigned'
        }));

        // Filter by department (after join is fetched)
        if (department && department !== 'All Specializations') {
            specialists = specialists.filter(s => (s.department_name || '').toLowerCase() === department.toLowerCase());
        }

        // Apply Performance Sorting (Retention Rate desc, then Rating desc)
        if (sortByPerformance) {
            specialists.sort((a, b) => {
                const retA = a.retention_rate ?? 0;
                const retB = b.retention_rate ?? 0;
                if (retB !== retA) return retB - retA;
                return (b.rating ?? 0) - (a.rating ?? 0);
            });
        }

        // 2. Fetch Department Performance Metrics
        const { data: perfData, error: perfError } = await supabase
            .from('department_performance')
            .select('*')
            .order('name', { ascending: true });
        if (perfError) throw perfError;

        const departmentPerformance: DepartmentPerformance[] = perfData || fallbackPerformance;

        // 3. Retrieve or Calculate KPIs
        // We'll base KPIs dynamically: total staff is 1280 base plus current specialists
        const totalActiveStaff = 1279 + specialists.length;
        const currentlyOnDuty = specialists.filter(s => s.status === 'Active').length + 338; // 338 base + active

        // Calculate average retention of database specialists
        let avgRetention = 94.2;
        if (specialists.length > 0) {
            const hasRetention = specialists.filter(s => s.retention_rate !== undefined);
            if (hasRetention.length > 0) {
                avgRetention = parseFloat((hasRetention.reduce((acc, curr) => acc + (curr.retention_rate || 0), 0) / hasRetention.length).toFixed(1));
            }
        }

        const kpis = {
            totalActiveStaff,
            currentlyOnDuty,
            staffRetention: avgRetention,
            openPositions: 12
        };

        return NextResponse.json({
            specialists,
            kpis,
            departmentPerformance
        }, {
            headers: { 'Cache-Control': 'no-store' }
        });
    } catch (err: any) {
        console.error('[admin/staff GET]', err.message);
        return NextResponse.json({
            specialists: fallbackSpecialists,
            kpis: {
                totalActiveStaff: 1280,
                currentlyOnDuty: 342,
                staffRetention: 94.2,
                openPositions: 12
            },
            departmentPerformance: fallbackPerformance
        });
    }
}

// POST — Add a new medical specialist/staff member
export async function POST(req: NextRequest) {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    try {
        const body = await req.json();
        const { full_name, specialty, tag, status, experience, bio, rating, retention_rate, shift, image_url } = body;

        if (!full_name || !specialty) {
            return NextResponse.json({ error: 'full_name and specialty are required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Find or create the corresponding department to link the specialist
        let deptName = specialty.split(' • ').pop() || specialty;
        // Trim any extras
        deptName = deptName.trim();

        const { data: deptData } = await supabase
            .from('departments')
            .select('id')
            .ilike('name', `%${deptName}%`)
            .limit(1)
            .single();

        let department_id = deptData?.id;

        if (!department_id) {
            // Default to cardiology or neurology if not matched
            const { data: fallbackDept } = await supabase
                .from('departments')
                .select('id')
                .limit(1)
                .single();
            department_id = fallbackDept?.id;
        }

        // Generate initials
        const initials = full_name
            .split(' ')
            .filter((n: string) => !n.includes('.')) // skip "Dr."
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'Dr';

        // Select a color gradient based on department
        const gradients = [
            'from-blue-600 to-indigo-800',
            'from-purple-600 to-indigo-800',
            'from-emerald-500 to-teal-700',
            'from-teal-600 to-blue-800',
            'from-orange-500 to-rose-700',
            'from-pink-500 to-purple-800'
        ];
        const randomGrad = gradients[Math.floor(Math.random() * gradients.length)];

        // Build data structure to insert
        const newSpecialist = {
            full_name,
            specialty,
            department_id,
            experience: experience || '1 Year',
            rating: Number(rating) || 5.0,
            bio: bio || 'Specialist clinician on Clinq platform.',
            initials,
            color_grad: randomGrad,
            is_available: status === 'Active',
            availability_text: status === 'Active' ? 'AVAILABLE TODAY' : 'OFF DUTY',
            retention_rate: Number(retention_rate) || 95.0,
            tag: tag || 'CONSULTANT',
            status: status || 'Active',
            shift: shift || '09:00 - 17:00 (Floor 1)',
            image_url: image_url || null
        };

        const { data, error } = await supabase
            .from('specialists')
            .insert([newSpecialist])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ specialist: data }, { status: 201 });
    } catch (err: any) {
        console.error('[admin/staff POST]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
