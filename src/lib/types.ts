// ==========================================
// Clinq Platform — Shared Type Definitions
// ==========================================

// ---------- Department ----------
export interface Department {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon_name: string;
    doctors_count: number;
    category: string;       // 'Primary Care' | 'Specialty' | 'Clinical'
    is_active: boolean;
    created_at: string;
}

// ---------- Specialist ----------
export interface Specialist {
    id: string;
    full_name: string;
    specialty: string;
    department_id: string;
    department_name?: string;  // joined from departments table
    experience: string;
    rating: number;
    bio: string;
    initials: string;
    color_grad: string;
    is_available: boolean;
    availability_text: string;
    created_at?: string;
    retention_rate?: number;
    tag?: string;
    status?: string;
    shift?: string;
    image_url?: string;
}

// ---------- Department Performance ----------
export interface DepartmentPerformance {
    id: string;
    name: string;
    location: string;
    head_of_dept: string;
    staff_count: number;
    throughput: string;
    efficiency: number;
    status: string;
    created_at: string;
}


// ---------- Blog Post ----------
export interface BlogPost {
    id: string;
    category: string;
    title: string;
    description: string;
    slug: string;
    published_at: string;
    is_published: boolean;
}

// ---------- Platform Stats ----------
export interface PlatformStats {
    totalSpecialists: number;
    totalDepartments: number;
    totalPatients: number;
}

// ---------- Unified API Response ----------
export interface PlatformData {
    departments: Department[];
    specialists: Specialist[];
    blogPosts: BlogPost[];
    stats: PlatformStats;
}

// ---------- Legacy compat (re-exports for gradual migration) ----------
/** @deprecated Use Specialist instead */
export type Doctor = Specialist;
/** @deprecated Use BlogPost instead */
export type BlogItem = BlogPost;
