import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const globalMenus = [
    { label: "DASHBOARD", href: "/patient", icon: "LayoutDashboard", svg_icon: null, sort_order: 1, is_bottom: false },
    { label: "APPOINTMENTS", href: "/patient/appointments", icon: "Calendar", svg_icon: null, sort_order: 2, is_bottom: false },
    { label: "MEDICAL RECORDS", href: "/patient/records", icon: "FileText", svg_icon: null, sort_order: 3, is_bottom: false },
    { label: "PRESCRIPTIONS", href: "/patient/prescriptions", icon: null, svg_icon: "/prescription.svg", sort_order: 4, is_bottom: false },
    { label: "LAB RESULTS", href: "/patient/lab-results", icon: null, svg_icon: "/lab-result.svg", sort_order: 5, is_bottom: false },
    { label: "MESSAGES", href: "/patient/messages", icon: null, svg_icon: "/messages.svg", sort_order: 6, is_bottom: false },
    { label: "BILLING", href: "/patient/billing", icon: null, svg_icon: "/billing.svg", sort_order: 7, is_bottom: false }
];

async function seed() {
    console.log("=== Seeding Patient Dashboard Data ===");

    // 1. Seed global menus
    console.log("Seeding global patient menus...");
    for (const menu of globalMenus) {
        const { error } = await supabase.from("patient_menus").upsert([menu], { onConflict: "href" });
        if (error) {
            console.error(`Failed to seed menu ${menu.label}:`, error.message);
        } else {
            console.log(`Seed Menu: ${menu.label}`);
        }
    }

    // 2. Fetch all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error("Failed to fetch auth users:", usersError.message);
        return;
    }

    console.log(`Found ${users.length} users in database. Seeding patient tables for each...`);

    for (const user of users) {
        console.log(`-> Seeding for User: ${user.email} (${user.id})`);

        // Identify user display name from metadata or default
        const fullName = user.user_metadata?.fullName || user.user_metadata?.full_name || "Alexander Sterling";

        // 2.1 Profile
        const profile = {
            id: user.id,
            full_name: fullName,
            phone_number: "+1 (555) 890-2431",
            date_birth: "1985-11-12",
            avatar_url: null,
            gender: "Male",
            height_inches: 70.0,
            weight_lbs: 180.0,
            heart_rate_bpm: 72,
            blood_pressure_mmhg: "120/80",
            blood_group: "O+",
            allergies_count: 2
        };

        const { error: profileError } = await supabase.from("patient_profiles").upsert([profile]);
        if (profileError) console.error("Profile error:", profileError.message);

        // 2.2 Settings
        const settings = {
            patient_id: user.id,
            two_factor_auth: false,
            theme: "light",
            language: "English (United States)",
            notif_appointments_email: true,
            notif_appointments_sms: true,
            notif_appointments_push: true,
            notif_labs_email: true,
            notif_labs_sms: false,
            notif_labs_push: true,
            notif_billing_email: true,
            notif_billing_sms: false,
            notif_billing_push: false
        };

        const { error: settingsError } = await supabase.from("patient_settings").upsert([settings]);
        if (settingsError) console.error("Settings error:", settingsError.message);

        // Clear and reseed user-specific arrays to keep it clean and repeatable
        await supabase.from("patient_allergies").delete().eq("patient_id", user.id);
        await supabase.from("patient_immunizations").delete().eq("patient_id", user.id);
        await supabase.from("patient_prescriptions").delete().eq("patient_id", user.id);
        await supabase.from("patient_lab_results").delete().eq("patient_id", user.id);
        await supabase.from("patient_timeline_events").delete().eq("patient_id", user.id);
        await supabase.from("patient_billing").delete().eq("patient_id", user.id);
        await supabase.from("patient_payment_methods").delete().eq("patient_id", user.id);
        await supabase.from("patient_insurance").delete().eq("patient_id", user.id);
        await supabase.from("conversations").delete().eq("participant_a", user.id);

        // 2.3 Allergies
        const allergies = [
            { patient_id: user.id, allergy_name: "Penicillin", reaction: "Hives and skin rash", severity: "Moderate" },
            { patient_id: user.id, allergy_name: "Pollen", reaction: "Sneezing and watery eyes", severity: "Mild" }
        ];
        await supabase.from("patient_allergies").insert(allergies);

        // 2.4 Immunizations
        const immunizations = [
            { patient_id: user.id, name: "Influenza (Flu Shot)", date_administered: "2023-10-15", notes: "Annual vaccine" },
            { patient_id: user.id, name: "Tetanus Booster", date_administered: "2021-05-12", notes: "Next booster due 2031" },
            { patient_id: user.id, name: "COVID-19 Booster", date_administered: "2022-12-08", notes: "Pfizer Bivalent" }
        ];
        await supabase.from("patient_immunizations").insert(immunizations);

        // 2.5 Prescriptions
        const prescriptions = [
            {
                patient_id: user.id,
                medication_name: "Lisinopril",
                dosage: "10mg",
                frequency: "Once daily",
                expires: "Expires Oct 24, 2024",
                refills_remaining: "1 Refill",
                action_label: "Request Refill",
                status: "Active",
                prescriber: "Dr. Aris Thorne",
                prescribed_date: "2023-10-24",
                form: "10mg Oral Tablet"
            },
            {
                patient_id: user.id,
                medication_name: "Amoxicillin",
                dosage: "500mg",
                frequency: "Three times daily",
                expires: "Completed Nov 10, 2023",
                refills_remaining: "0 Refills",
                action_label: "Refill Unavailable",
                status: "Completed",
                prescriber: "Dr. Sarah Jenkins",
                prescribed_date: "2023-11-03",
                form: "500mg Oral Capsule"
            }
        ];
        await supabase.from("patient_prescriptions").insert(prescriptions);

        // 2.6 Lab Results
        const labResults = [
            {
                patient_id: user.id,
                name: "Metabolic Panel (14)",
                date: "Oct 12, 2023",
                provider: "MedCore Main Lab",
                status: "Reviewed",
                status_bg: "bg-[#D4E6E5]",
                status_text: "text-[#576867]",
                file_url: "#"
            },
            {
                patient_id: user.id,
                name: "Lipid Panel",
                date: "Oct 12, 2023",
                provider: "MedCore Main Lab",
                status: "Reviewed",
                status_bg: "bg-[#D4E6E5]",
                status_text: "text-[#576867]",
                file_url: "#"
            },
            {
                patient_id: user.id,
                name: "Chest X-Ray",
                date: "Sep 15, 2023",
                provider: "Imaging Center",
                status: "Reviewed",
                status_bg: "bg-[#D4E6E5]",
                status_text: "text-[#576867]",
                file_url: "#"
            }
        ];
        await supabase.from("patient_lab_results").insert(labResults);

        // 2.7 Timeline Events
        const events = [
            {
                patient_id: user.id,
                title: "Annual Physical Exam",
                event_date: "2023-10-12",
                category: "Consultation",
                description: "Routine check-up, vitals within normal parameters."
            },
            {
                patient_id: user.id,
                title: "Lipid Panel Screen",
                event_date: "2023-10-12",
                category: "Diagnostic",
                description: "Cholesterol profiling, reviewed by Dr. Thorne."
            },
            {
                patient_id: user.id,
                title: "Flu Shot Administration",
                event_date: "2023-10-12",
                category: "Treatment",
                description: "Seasonal immunizations completed."
            }
        ];
        await supabase.from("patient_timeline_events").insert(events);

        // 2.8 Billing
        const billing = [
            {
                patient_id: user.id,
                date: "Oct 24, 2023",
                service: "Cardiology Consult",
                amount: "$150.00",
                status: "Paid",
                status_color: "bg-[#D4E6E5] text-[#576867]",
                invoice_url: "#"
            },
            {
                patient_id: user.id,
                date: "Oct 12, 2023",
                service: "Comprehensive Lab Screen",
                amount: "$310.00",
                status: "Paid",
                status_color: "bg-[#D4E6E5] text-[#576867]",
                invoice_url: "#"
            },
            {
                patient_id: user.id,
                date: "Oct 28, 2023",
                service: "Follow-up Consultation",
                amount: "$75.00",
                status: "Pending",
                status_color: "bg-[#FFDAD6] text-[#93000A]",
                invoice_url: "#"
            }
        ];
        await supabase.from("patient_billing").insert(billing);

        // 2.9 Payment Methods
        const paymentMethods = [
            { patient_id: user.id, type: "card", card_brand: "Visa", last_four: "4242", expiration: "12/28", is_default: true },
            { patient_id: user.id, type: "card", card_brand: "Mastercard", last_four: "9876", expiration: "08/26", is_default: false }
        ];
        await supabase.from("patient_payment_methods").insert(paymentMethods);

        // 2.10 Insurance
        const insurance = {
            patient_id: user.id,
            carrier: "Blue Cross Blue Shield",
            member_id: "BCB98234-L",
            group_number: "GP-88342"
        };
        await supabase.from("patient_insurance").insert(insurance);

        // 2.11 conversations & messages
        console.log("Seeding chats...");
        const { data: conv1, error: c1Err } = await supabase.from("conversations").insert({
            participant_a: user.id,
            participant_b_name: "Dr. Aris Thorne",
            participant_b_initials: "AT",
            participant_b_avatar_bg: "bg-[#DCE9FF]",
            online: true,
            dimmed: false,
            is_billing: false,
            last_message_at: new Date().toISOString()
        }).select().single();

        if (c1Err) {
            console.error("Conv 1 error:", c1Err.message);
        } else if (conv1) {
            const messages1 = [
                {
                    conversation_id: conv1.id,
                    sender_name: "Dr. Aris Thorne",
                    text: "Hello Alexander, I reviewed your recent lab results. Your cholesterol levels have improved slightly since our last check."
                },
                {
                    conversation_id: conv1.id,
                    sender_id: user.id,
                    sender_name: fullName,
                    text: "Thank you, Dr. Thorne. Should I continue with the same dosage of Lisinopril?"
                },
                {
                    conversation_id: conv1.id,
                    sender_name: "Dr. Aris Thorne",
                    text: "Yes, please continue the Lisinopril 10mg once daily. We will check your levels again in 3 months."
                }
            ];
            await supabase.from("messages").insert(messages1);
        }

        const { data: conv2, error: c2Err } = await supabase.from("conversations").insert({
            participant_a: user.id,
            participant_b_name: "Billing & Financing",
            participant_b_initials: "BF",
            participant_b_avatar_bg: "bg-[#E6EEFF]",
            online: false,
            dimmed: false,
            is_billing: true,
            last_message_at: new Date().toISOString()
        }).select().single();

        if (c2Err) {
            console.error("Conv 2 error:", c2Err.message);
        } else if (conv2) {
            await supabase.from("messages").insert({
                conversation_id: conv2.id,
                sender_name: "Billing System",
                text: "Your invoice for the lab screen on Oct 12 has been processed. Let us know if you need assistance."
            });
        }

        // 2.12 Seed a default appointment for the user if none exists
        const { data: existingApp } = await supabase.from("appointments").select("*").eq("patient_id", user.id).limit(1);
        if (!existingApp || existingApp.length === 0) {
            // Find a specialist to link
            const { data: specialists } = await supabase.from("specialists").select("id").limit(1);
            const specialistId = specialists?.[0]?.id || null;

            const app = {
                patient_name: fullName,
                patient_id: user.id,
                specialist_id: specialistId,
                department: "Cardiology",
                status: "Confirmed",
                date: new Date().toISOString().split("T")[0],
                time_start: "11:15 AM",
                time_end: "12:15 PM",
                day_of_week: new Date().toLocaleDateString("en-US", { weekday: "long" }),
                is_urgent: false,
                scheduled_at: new Date().toISOString()
            };
            await supabase.from("appointments").insert(app);
        }
    }

    console.log("🎉 Seeding completed successfully!");
}

seed().catch(console.error);
