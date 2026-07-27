import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Department, Specialist, BlogPost, PlatformData, PlatformStats } from '@/lib/types';

// ─── Fallback seed data (used when Supabase is not yet configured) ────
const fallbackDepartments: Department[] = [
    { id: 'dept-1', name: 'Cardiology', slug: 'cardiology', description: 'Comprehensive heart care including diagnostic screenings, interventional procedures, and advanced cardiac…', icon_name: 'HeartPulse', doctors_count: 5, category: 'Specialty', is_active: true, created_at: '' },
    { id: 'dept-2', name: 'Neurology', slug: 'neurology', description: 'Expert diagnosis and treatment for disorders of the nervous system, specializing in complex neurological…', icon_name: 'Brain', doctors_count: 4, category: 'Specialty', is_active: true, created_at: '' },
    { id: 'dept-3', name: 'Pediatrics', slug: 'pediatrics', description: 'Dedicated care for infants, children, and adolescents, focusing on physical growth, developmental milestones, and…', icon_name: 'Baby', doctors_count: 6, category: 'Primary Care', is_active: true, created_at: '' },
    { id: 'dept-4', name: 'Dermatology', slug: 'dermatology', description: 'Advanced skincare solutions ranging from medical dermatology for chronic conditions to state-of-the-art cosmetic', icon_name: 'Sparkles', doctors_count: 3, category: 'Clinical', is_active: true, created_at: '' },
    { id: 'dept-5', name: 'Orthopedics', slug: 'orthopedics', description: 'Specialized care for bones, joints, ligaments, tendons, and muscles, including joint replacement surgeries…', icon_name: 'Activity', doctors_count: 5, category: 'Specialty', is_active: true, created_at: '' },
    { id: 'dept-6', name: 'Ophthalmology', slug: 'ophthalmology', description: 'Comprehensive eye care and surgical expertise for vision restoration, glaucoma treatment, and advanced…', icon_name: 'Eye', doctors_count: 4, category: 'Clinical', is_active: true, created_at: '' },
];

const fallbackSpecialists: Specialist[] = [
    { id: 'doc-1', full_name: 'Dr. Aris Thorne', specialty: 'Senior Cardiology Surgeon', department_id: 'dept-1', department_name: 'Cardiology', experience: '15+ Years', rating: 4.9, bio: 'Specializing in minimally invasive cardiac surgery and heart failure management with a focus on...', initials: 'AT', color_grad: 'from-blue-600 to-indigo-800', is_available: true, availability_text: 'AVAILABLE TODAY', created_at: '' },
    { id: 'doc-2', full_name: 'Dr. Elena Vance', specialty: 'Neurology Specialist', department_id: 'dept-2', department_name: 'Neurology', experience: '12+ Years', rating: 4.8, bio: 'Expert in neurodegenerative disorders and advanced migraine treatments using state-of-...', initials: 'EV', color_grad: 'from-purple-600 to-indigo-800', is_available: true, availability_text: 'AVAILABLE TODAY', created_at: '' },
    { id: 'doc-3', full_name: 'Dr. Julian Marc', specialty: 'Pediatrics Lead', department_id: 'dept-3', department_name: 'Pediatrics', experience: '10+ Years', rating: 4.7, bio: 'Dedicated to holistic child healthcare from infancy through adolescence, specializing in...', initials: 'JM', color_grad: 'from-emerald-500 to-teal-700', is_available: true, availability_text: 'AVAILABLE TODAY', created_at: '' },
    { id: 'doc-4', full_name: 'Dr. Sarah Jenkins', specialty: 'Interventional Cardiologist', department_id: 'dept-1', department_name: 'Cardiology', experience: '8 Years', rating: 4.9, bio: 'Pioneered heart rhythm diagnostics and coronary angioplasty therapeutic treatments.', initials: 'SJ', color_grad: 'from-teal-600 to-blue-800', is_available: false, availability_text: 'NEXT SLOT: MON', created_at: '' },
    { id: 'doc-5', full_name: 'Dr. Marcus Vance', specialty: 'Orthopedics Surgeon', department_id: 'dept-5', department_name: 'Orthopedics', experience: '14+ Years', rating: 4.8, bio: 'Specializes in athletic joint reconstructive surgery and complex bone pathology therapeutic models.', initials: 'MV', color_grad: 'from-orange-500 to-rose-700', is_available: true, availability_text: 'AVAILABLE TODAY', created_at: '' },
    { id: 'doc-6', full_name: 'Dr. Clara Shore', specialty: 'Clinical Dermatologist', department_id: 'dept-4', department_name: 'Dermatology', experience: '11 Years', rating: 4.9, bio: 'Focuses on chronic skin restoration therapeutics, oncology screening, and cosmetic micro-sessions.', initials: 'CS', color_grad: 'from-pink-500 to-purple-800', is_available: false, availability_text: 'NEXT SLOT: WED', created_at: '' },
];

const fallbackBlogPosts: BlogPost[] = [
    { id: 'blog-1', category: 'GUIDE', title: 'Flu Season Guide 2024', description: 'Protect yourself and your family with these 5 essential steps for the upcoming winter season.', slug: 'flu-season-guide-2024', published_at: '2024-10-15', is_published: true },
    { id: 'blog-2', category: 'NEWS', title: 'New Wellness Wing Open', description: 'We are excited to announce the grand opening of our advanced physical therapy and wellness center.', slug: 'new-wellness-wing-open', published_at: '2024-09-28', is_published: true },
    { id: 'blog-3', category: 'TIPS', title: 'Understanding Heart Health', description: 'Dr. Arya Sharma shares lifestyle changes that significantly improve cardiovascular longevity.', slug: 'understanding-heart-health', published_at: '2024-09-10', is_published: true },
];

// ─── Supabase availability check ──────────────────────────────────────
function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('your-project-id') && !key.includes('your-anon-key'));
}

// ─── GET /api/platform-data ───────────────────────────────────────────
export async function GET() {
    // If Supabase is not configured yet, return fallback data
    if (!isSupabaseConfigured()) {
        const fallbackStats: PlatformStats = {
            totalSpecialists: fallbackSpecialists.length,
            totalDepartments: fallbackDepartments.length,
            totalPatients: 10000,
        };

        const data: PlatformData = {
            departments: fallbackDepartments,
            specialists: fallbackSpecialists,
            blogPosts: fallbackBlogPosts,
            stats: fallbackStats,
        };

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
        });
    }

    // ─── Fetch from Supabase ──────────────────────────────────────────
    try {
        const supabase = await createClient();

        // Parallel queries for maximum performance
        const [deptResult, specResult, blogResult] = await Promise.all([
            supabase
                .from('departments')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true }),

            supabase
                .from('specialists')
                .select('*, departments(name)')
                .order('full_name', { ascending: true }),

            supabase
                .from('blog_posts')
                .select('*')
                .eq('is_published', true)
                .order('published_at', { ascending: false }),
        ]);

        if (deptResult.error) throw deptResult.error;
        if (specResult.error) throw specResult.error;
        if (blogResult.error) throw blogResult.error;

        // Map specialists to include department_name from the joined relation
        const specialists: Specialist[] = (specResult.data || []).map((s: any) => ({
            ...s,
            department_name: s.departments?.name || '',
        }));

        const departments: Department[] = deptResult.data || [];
        const blogPosts: BlogPost[] = blogResult.data || [];

        const stats: PlatformStats = {
            totalSpecialists: specialists.length,
            totalDepartments: departments.length,
            totalPatients: 10000, // Future: count from patients table
        };

        const data: PlatformData = { departments, specialists, blogPosts, stats };

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
        });
    } catch (error: any) {
        console.error('[platform-data] Supabase fetch failed, using fallback:', error.message);

        // Graceful degradation — return fallback data on DB error
        const data: PlatformData = {
            departments: fallbackDepartments,
            specialists: fallbackSpecialists,
            blogPosts: fallbackBlogPosts,
            stats: {
                totalSpecialists: fallbackSpecialists.length,
                totalDepartments: fallbackDepartments.length,
                totalPatients: 10000,
            },
        };

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
        });
    }
}
