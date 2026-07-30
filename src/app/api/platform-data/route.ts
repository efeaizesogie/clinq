import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Department, Specialist, BlogPost, PlatformData, PlatformStats, Resource } from '@/lib/types';

// ─── Supabase availability check ──────────────────────────────────────
function isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('your-project-id') && !key.includes('your-anon-key'));
}

// ─── GET /api/platform-data ───────────────────────────────────────────
export async function GET() {
    if (!isSupabaseConfigured()) {
        return NextResponse.json({ error: "Supabase authentication is not configured in the backend environment." }, { status: 503 });
    }

    try {
        const supabase = await createClient();

        // Parallel queries for maximum performance
        const [deptResult, specResult, blogResult, resourcesResult] = await Promise.all([
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

            supabase
                .from('resources')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false }),
        ]);

        if (deptResult.error) throw deptResult.error;
        if (specResult.error) throw specResult.error;
        if (blogResult.error) throw blogResult.error;
        if (resourcesResult.error) throw resourcesResult.error;

        // Map specialists to include department_name from the joined relation
        const specialists: Specialist[] = (specResult.data || []).map((s: any) => ({
            ...s,
            department_name: s.departments?.name || '',
        }));

        const departments: Department[] = deptResult.data || [];
        const blogPosts: BlogPost[] = blogResult.data || [];
        const resources: Resource[] = resourcesResult.data || [];

        const stats: PlatformStats = {
            totalSpecialists: specialists.length,
            totalDepartments: departments.length,
            totalPatients: 10000, // Future: count from patients table
        };

        const data: PlatformData = { departments, specialists, blogPosts, resources, stats };

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
        });
    } catch (error: any) {
        console.error('[platform-data] Supabase fetch failed:', error.message);
        return NextResponse.json({ error: error.message || "Failed to fetch platform data." }, { status: 500 });
    }
}

