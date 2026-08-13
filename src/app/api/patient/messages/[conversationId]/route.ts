import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// ── GET: Fetch all messages for a specific conversation ──
export async function GET(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch messages for this conversation, verifying ownership via join or subquery
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        // Fetch conversation to understand context (e.g. participant billing, AI configuration)
        const { data: conv, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .maybeSingle();

        const formattedConv = conv ? {
            ...conv,
            is_ai: conv.is_ai !== undefined ? conv.is_ai : !(conv.is_billing || conv.participant_b_name.toLowerCase().includes('billing'))
        } : null;

        return NextResponse.json({
            messages: messages || [],
            conversation: formattedConv
        });

    } catch (err: any) {
        console.error("GET conversation messages error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── POST: Send a message from the patient and generate AI reply if applicable ──
export async function POST(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const { conversationId } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text, clientMode } = await request.json();

        if (!text || !text.trim()) {
            return NextResponse.json({ error: "Message text is required" }, { status: 400 });
        }

        // 1. Fetch conversation details first
        const { data: conv, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .maybeSingle();

        if (convError || !conv) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // Determine if it is AI or Real doctor chat (either saved in DB or determined by clientMode)
        const isAi = conv.is_ai !== undefined ? conv.is_ai : !(conv.is_billing || conv.participant_b_name.toLowerCase().includes('billing'));
        const activeAiMode = clientMode === 'real' ? false : isAi;

        // 2. Fetch patient profile to check/update minutes balance
        const { data: profile } = await supabase
            .from('patient_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        const minutesBalance = profile && (profile.minutes_balance !== undefined) ? Number(profile.minutes_balance) : 30;

        // 3. Handle Paid Consultation check
        if (!activeAiMode && !conv.is_billing) {
            if (minutesBalance <= 0) {
                return NextResponse.json({
                    error: "Insufficient minutes balance. Please purchase more minutes to chat with real doctors.",
                    code: "INSUFFICIENT_MINUTES"
                }, { status: 403 });
            }

            // Deduct 1 minute for this message (mimicking billing logic)
            if (profile && profile.minutes_balance !== undefined) {
                await supabase
                    .from('patient_profiles')
                    .update({ minutes_balance: Math.max(0, minutesBalance - 1) })
                    .eq('id', user.id);
            }
        }

        // 4. Insert user message to database
        const { data: userMsg, error: insertError } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                sender_name: profile?.full_name || "Patient",
                text: text
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // Update last message timestamp in conversation
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);

        let systemReply = null;

        // 5. Generate Response (AI persona vs Real doctor offline simulation)
        if (activeAiMode) {
            // Generate specialty specific AI response
            const aiText = getAIResponseText(conv.participant_b_name, text);

            // Insert AI message
            const { data: replyMsg, error: replyError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: null, // AI doctor is null auth user
                    sender_name: conv.participant_b_name,
                    text: aiText
                })
                .select()
                .single();

            if (!replyError) {
                systemReply = replyMsg;
            }
        } else if (!conv.is_billing) {
            // Real doctor offline simulation
            const responseText = `[Dr. Simulator] Thanks for sending. As a live provider, I will review this thread shortly. (Note: 1 minute has been deducted from your balance; remaining: ${Math.max(0, minutesBalance - 1)} minutes).`;
            const { data: replyMsg, error: replyError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: null,
                    sender_name: conv.participant_b_name,
                    text: responseText
                })
                .select()
                .single();

            if (!replyError) {
                systemReply = replyMsg;
            }
        }

        // Fetch final deducted balance
        const { data: updatedProfile } = await supabase
            .from('patient_profiles')
            .select('minutes_balance')
            .eq('id', user.id)
            .maybeSingle();

        return NextResponse.json({
            success: true,
            userMessage: userMsg,
            replyMessage: systemReply,
            minutesBalance: updatedProfile && (updatedProfile.minutes_balance !== undefined) ? updatedProfile.minutes_balance : Number(minutesBalance)
        });

    } catch (err: any) {
        console.error("POST send message error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── Medical AI Specialty Personalities Helper ──
function getAIResponseText(doctorName: string, userMessage: string): string {
    const msg = userMessage.toLowerCase();

    if (doctorName.includes("Rodriguez")) { // Neurology
        if (msg.includes("headache") || msg.includes("migraine") || msg.includes("brain")) {
            return "Headaches and migraines are often triggered by tension, dehydration, or sleep disruptions. I recommend recording the frequency and severity in a log, ensuring adequate hydration, and resting in a dark room. Feel free to schedule a neurology consultation if symptoms persist.";
        }
        if (msg.includes("sleep") || msg.includes("insomnia") || msg.includes("tired")) {
            return "Sleep quality directly impacts neural health. I advise setting a consistent sleep schedule, limiting screen exposure 1 hour before bedtime, and avoiding caffeine after 2 PM.";
        }
        return "As a neurologist, I focus on your nervous system and brain health. Let me know if you are experiencing any sensory changes, headaches, sleep issues, or neurological concerns.";
    }

    if (doctorName.includes("Vance")) { // Cardiology
        if (msg.includes("heart") || msg.includes("chest") || msg.includes("palpitation")) {
            return "Heart palpitations or chest discomfort should be monitored closely. If you experience intense, spreading chest pain, shortness of breath, or dizziness, please seek emergency care immediately. For milder palpitations, reducing stress and monitoring blood pressure is a good first step.";
        }
        if (msg.includes("pressure") || msg.includes("bp") || msg.includes("blood pressure")) {
            return "Consistent blood pressure monitoring is key for cardiology health. Lisinopril is a standard therapy. Try to take your readings at the same time daily, resting for 5 minutes beforehand, and limiting sodium intake.";
        }
        return "Cardiovascular health requires regular monitoring. Let me know how your recent blood pressure readings are, or if you're experiencing any fatigue or heart rate fluctuations.";
    }

    if (doctorName.includes("Thorne")) { // Pediatrics / General
        if (msg.includes("vitamin") || msg.includes("vit d") || msg.includes("supplement")) {
            return "Regarding Vitamin D, standard maintenance is 1,000 to 2,000 IU daily, but if your levels showed a dip, we might recommend a short-term therapeutic dose. Please refer to the revised care plan PDF I attached in the chat.";
        }
        if (msg.includes("child") || msg.includes("baby") || msg.includes("fever")) {
            return "In pediatrics, we monitor developmental milestones and acute symptoms closely. For children with mild fevers, ensure they stay highly hydrated. If the fever exceeds 102°F (38.9°C) or lasts over 48 hours, they should be evaluated.";
        }
        return "Hello! I am reviewing your chart. Let me know how you are feeling today or if you have any questions regarding your prescription renewals.";
    }

    if (doctorName.includes("Jenkins")) { // Oncology
        return "Oncological care is highly personalized. If you are experiencing structural symptoms, fatigue, or side effects from treatments, please detail them so we can update your oncology support plan.";
    }

    if (doctorName.includes("Grant")) { // Orthopedics
        if (msg.includes("knee") || msg.includes("joint") || msg.includes("pain") || msg.includes("back")) {
            return "Joint and back pain is often helped by low-impact stretching and physical therapy. Avoid heavy lifting and apply ice for acute swelling. Let me know if the discomfort is sharp or restricts movement.";
        }
        return "Hi there. For orthopedic questions, dynamic muscle strength and bone density are crucial. Please let me know if you are recovering from a joint strain or require physical therapy guides.";
    }

    if (doctorName.includes("Chen")) { // Nurse/General
        return "Hello! I am here to help coordinate your care, track appointments, or log your vitals. If you need a script renewal or appointment confirmation, please let me know.";
    }

    return "Thank you for reaching out. Based on your Clinq dashboard profile, please specify if you are asking about laboratory test results, prescription renewals, or scheduling your next clinical follow-up.";
}
