import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const hasSupabase = Boolean(supabaseUrl && supabaseKey);
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseKey) : null;

export interface AppointmentRecord {
    id: string;
    patient_name: string;
    department: string;
    type: string;
    date: string; // "YYYY-MM-DD"
    time_start: string; // "HH:mm"
    time_end: string;
    day_of_week: string;
    is_urgent: boolean;
    notes?: string;
    created_at: string;
}

export async function GET(request: Request) {
    if (!hasSupabase || !supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const departmentStr = searchParams.get("department");
        const startDate = searchParams.get("start"); // YYYY-MM-DD
        const endDate = searchParams.get("end"); // YYYY-MM-DD

        let query = supabase.from("appointments").select("*").order("date", { ascending: true }).order("time_start", { ascending: true });

        if (departmentStr) {
            const depts = departmentStr.split(',');
            query = query.in("department", depts);
        }

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json({ appointments: data || [], total: data?.length || 0 });
    } catch (error: any) {
        console.error("Supabase error (appointments GET):", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    if (!hasSupabase || !supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    try {
        const body = await req.json();
        const { patient_name, department, type, date, time_start, time_end, day_of_week, is_urgent } = body;

        const appointment = {
            patient_name: patient_name || "Unknown",
            department: department || "General Practice",
            date: date,
            time_start: time_start,
            time_end: time_end,
            day_of_week: day_of_week,
            is_urgent: is_urgent || false,
        };

        const { data, error } = await supabase
            .from("appointments")
            .insert([appointment])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ appointment: data }, { status: 201 });
    } catch (err: any) {
        console.error("Error creating appointment:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
