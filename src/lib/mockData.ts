export interface Department {
    id: string;
    name: string;
    description: string;
    icon_name: string;
}

export interface Doctor {
    id: string;
    full_name: string;
    specialty: string;
    department_name: string;
    rating: number;
}

export interface BlogItem {
    id: string;
    category: string;
    title: string;
    description: string;
}

export const staticDepartments: Department[] = [
    { id: 'dept-1', name: 'General Medicine', description: 'Primary healthcare screening', icon_name: 'Stethoscope' },
    { id: 'dept-2', name: 'Pediatrics', description: 'Specialized healthcare for children', icon_name: 'Baby' },
    { id: 'dept-3', name: 'Cardiology', description: 'Advanced heart conditions checkups', icon_name: 'HeartPulse' },
];

export const staticDoctors: Doctor[] = [
    { id: 'doc-1', full_name: 'Dr. Arya Sharma', specialty: 'Senior Cardiologist', department_name: 'Cardiology', rating: 4.9 },
    { id: 'doc-2', full_name: 'Dr. James Miller', specialty: 'Pediatric Surgeon', department_name: 'Pediatrics', rating: 4.8 },
    { id: 'doc-3', full_name: 'Dr. Lisa Chen', specialty: 'Orthopedic Specialist', department_name: 'General Medicine', rating: 4.9 },
];

export const staticBlogs: BlogItem[] = [
    {
        id: 'blog-1',
        category: 'GUIDE',
        title: 'Flu Season Guide 2024',
        description: 'Protect yourself and your family with these 5 essential steps for the upcoming winter season.',
    },
    {
        id: 'blog-2',
        category: 'NEWS',
        title: 'New Wellness Wing Open',
        description: 'We are excited to announce the grand opening of our advanced physical therapy and wellness center.',
    },
    {
        id: 'blog-3',
        category: 'TIPS',
        title: 'Understanding Heart Health',
        description: 'Dr. Arya Sharma shares lifestyle changes that significantly improve cardiovascular longevity.',
    },
];
