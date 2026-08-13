import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user conversations
        const { data: rawConversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('participant_a', user.id)
            .order('last_message_at', { ascending: false });

        if (convError) throw convError;

        // Fetch patient profile to check minutes_balance
        const { data: profile, error: profError } = await supabase
            .from('patient_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        const minutesBalance = profile && (profile.minutes_balance !== undefined) ? profile.minutes_balance : 30;

        // Format and add fallbacks for missing columns
        const conversations = (rawConversations || []).map(c => {
            const isBilling = c.is_billing || c.participant_b_name.toLowerCase().includes('billing');
            return {
                ...c,
                is_ai: c.is_ai !== undefined ? c.is_ai : !isBilling,
                is_billing: isBilling
            };
        });

        // For each conversation, fetch the last message to show as preview in the sidebar
        const conversationsWithPreview = await Promise.all(
            conversations.map(async (conv) => {
                const { data: messages } = await supabase
                    .from('messages')
                    .select('text, created_at')
                    .eq('conversation_id', conv.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                return {
                    ...conv,
                    preview: messages?.[0]?.text || "No messages yet",
                    time: messages?.[0]?.created_at
                        ? new Date(messages[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "New"
                };
            })
        );

        return NextResponse.json({
            conversations: conversationsWithPreview,
            minutesBalance
        });

    } catch (err: any) {
        console.error("GET user conversations error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === 'buy-minutes') {
            const { minutes } = body;
            const { data: profile } = await supabase
                .from('patient_profiles')
                .select('minutes_balance')
                .eq('id', user.id)
                .maybeSingle();
            const currentBalance = profile && (profile.minutes_balance !== undefined) ? Number(profile.minutes_balance) : 30;
            const newBalance = currentBalance + (minutes || 30);

            let updateError = null;
            try {
                const { error } = await supabase
                    .from('patient_profiles')
                    .update({ minutes_balance: newBalance })
                    .eq('id', user.id);
                updateError = error;
            } catch (e: any) {
                updateError = e;
            }

            if (updateError) throw updateError;
            return NextResponse.json({ success: true, minutesBalance: newBalance });
        }

        const { doctorName, initials, avatarBg } = body;

        if (!doctorName) {
            return NextResponse.json({ error: "Doctor name is required" }, { status: 400 });
        }

        // Check if conversation already exists
        const { data: existing, error: existingErr } = await supabase
            .from('conversations')
            .select('*')
            .eq('participant_a', user.id)
            .eq('participant_b_name', doctorName)
            .maybeSingle();

        if (existing) {
            const isBilling = existing.is_billing || existing.participant_b_name.toLowerCase().includes('billing');
            return NextResponse.json({
                success: true,
                conversation: {
                    ...existing,
                    is_ai: existing.is_ai !== undefined ? existing.is_ai : !isBilling,
                    is_billing: isBilling,
                    preview: "Active conversation",
                    time: "Active"
                }
            });
        }

        // Try inserting with 'is_ai' column
        let newConv = null;
        let dbError = null;

        try {
            const res = await supabase
                .from('conversations')
                .insert({
                    participant_a: user.id,
                    participant_b_name: doctorName,
                    participant_b_initials: initials || doctorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
                    participant_b_avatar_bg: avatarBg || "bg-[#DCE9FF]",
                    is_ai: true,
                    is_billing: false,
                    online: true,
                    last_message_at: new Date().toISOString()
                })
                .select()
                .single();
            newConv = res.data;
            dbError = res.error;
        } catch (e: any) {
            dbError = e;
        }

        // Fallback if column 'is_ai' doesn't exist
        if (dbError && (dbError.code === '42703' || dbError.message?.includes('is_ai'))) {
            const res = await supabase
                .from('conversations')
                .insert({
                    participant_a: user.id,
                    participant_b_name: doctorName,
                    participant_b_initials: initials || doctorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
                    participant_b_avatar_bg: avatarBg || "bg-[#DCE9FF]",
                    is_billing: false,
                    online: true,
                    last_message_at: new Date().toISOString()
                })
                .select()
                .single();
            newConv = res.data;
            dbError = res.error;
        }

        if (dbError) throw dbError;

        // Seed an initial greeting in the new conversation
        if (newConv) {
            const initialGreeting = `Hello, I'm ${doctorName}. How can I assist you with your health query today?`;
            await supabase.from('messages').insert({
                conversation_id: newConv.id,
                sender_name: doctorName,
                text: initialGreeting
            });
        }

        const isBilling = newConv.is_billing || newConv.participant_b_name.toLowerCase().includes('billing');
        return NextResponse.json({
            success: true,
            conversation: {
                ...newConv,
                is_ai: newConv.is_ai !== undefined ? newConv.is_ai : !isBilling,
                is_billing: isBilling,
                preview: "Conversation started",
                time: "Just now"
            }
        });

    } catch (err: any) {
        console.error("POST start conversation error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
