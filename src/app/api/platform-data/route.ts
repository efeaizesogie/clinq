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

        // Map specialists to include department_name from the joined relation
        const specialists: Specialist[] = (specResult.data || []).map((s: any) => ({
            ...s,
            department_name: s.departments?.name || '',
        }));

        const departments: Department[] = (deptResult.data || []).map((d: any) => {
            // Count specialists referencing this department index/name
            const count = specialists.filter(s =>
                s.department_id === d.id ||
                s.department_name?.toLowerCase() === d.name.toLowerCase()
            ).length;
            return {
                ...d,
                doctors_count: count
            };
        });

        const blogPosts: BlogPost[] = (blogResult.error ? [] : (blogResult.data || [])).map((b: any) => {
            const defaultImages: Record<string, string> = {
                'flu-season-guide-2024': 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&q=80&w=600',
                'new-wellness-wing-open': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
                'understanding-heart-health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600'
            };
            const defaultContents: Record<string, string> = {
                'flu-season-guide-2024': '### Influenza Prevention & Best Practices for 2024\n\nAs the temperature drops and winter approaches, it is critical to prepare for the seasonal flu cycle. Influenza is a highly contagious respiratory infection that can lead to severe health complications if not properly managed.\n\n#### 1. Schedule your seasonal flu shot\nVaccination remains the most effective defense against influenza. Getting vaccinated not only reduces your risk of catching the virus but also decreases severity if you do contract it.\n\n#### 2. Practice hand hygiene\nWash hands frequently with warm water and soap for at least 20 seconds. Use alcohol-based hand sanitizers as a fallback when public utility washing is unavailable.\n\n#### 3. Maintain your immune ecosystem\nFocus on balanced nutrition rich in Vitamin C, adequate hydration, regular sleep cycles, and moderate physical exercise. A strong underlying immune defense is key in resisting environmental pathogens.',
                'new-wellness-wing-open': '### Announcing Next-Gen Physical Therapy and Wellness at Clinq\n\nWe are proud to unveil our brand new Wellness Wing, designed to offer cutting-edge physical medicine, recovery units, and therapeutic sessions under one roof.\n\n#### Advanced Equipment & Amenities\nOur new facility is fitted with state-of-the-art diagnostic devices, hydrotherapy pools, and custom resistance training equipment. Each station is designed to support clinical coordinators and physical therapists in tracking patient mobility trends in real time.\n\n#### Integrated Rehabilitation Plans\nWhether recovering from orthopedic surgery or managing sports injuries, our team designs custom rehab workflows tailored to your specific recovery speed and threshold.',
                'understanding-heart-health': '### Cardiovascular Health: A Proactive Approach\n\nYour heart is the engine of your body. Maintaining cardiovascular strength requires consistent lifestyle practices and early diagnostic screening.\n\n#### Dietary Actionables\nReduce trans fats and high sodium intake, focusing instead on leafy grains, rich whole grains, and lean proteins. Incorporating Omega-3 fatty acids helps build strong arterial walls.\n\n#### Regular Screening Intervals\nEnsure you schedule routine blood pressure checks and cholesterol level panels. Early discovery of hypertensive trends allows clinical specialists to prescribe preventative lifestyle adjustments before severe symptoms manifest.'
            };
            return {
                ...b,
                image_url: b.image_url || defaultImages[b.slug] || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
                content: b.content || defaultContents[b.slug] || b.description || ''
            };
        });

        let resources: Resource[] = [];
        if (resourcesResult.error) {
            console.warn('[platform-data] Resources query failed:', resourcesResult.error.message);
        } else {
            resources = resourcesResult.data || [];
        }

        if (blogResult.error) {
            console.warn('[platform-data] Blog Posts query failed (likely DDL schema changes pending):', blogResult.error.message);
        }

        const stats: PlatformStats = {
            totalSpecialists: specialists.length,
            totalDepartments: departments.length,
            totalPatients: 10000,
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

