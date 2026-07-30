import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch patient invoices, payment options, and insurance details in parallel
        const [billingRes, cardsRes, insuranceRes] = await Promise.all([
            supabase
                .from('patient_billing')
                .select('*')
                .eq('patient_id', user.id)
                .order('date', { ascending: false }),
            supabase
                .from('patient_payment_methods')
                .select('*')
                .eq('patient_id', user.id)
                .order('is_default', { ascending: false }),
            supabase
                .from('patient_insurance')
                .select('*')
                .eq('patient_id', user.id)
                .maybeSingle()
        ]);

        if (billingRes.error) throw billingRes.error;
        if (cardsRes.error) throw cardsRes.error;
        if (insuranceRes.error) throw insuranceRes.error;

        return NextResponse.json({
            billing: billingRes.data || [],
            paymentMethods: cardsRes.data || [],
            insurance: insuranceRes.data || null
        });

    } catch (err: any) {
        console.error("GET billing error:", err.message);
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

        if (action === 'add-card') {
            const { cardBrand, cardNumber, expiration, isDefault } = body;

            // Validate basic inputs card length and expire format
            if (!cardBrand || !cardNumber || !expiration) {
                return NextResponse.json({ error: "Missing required card details." }, { status: 400 });
            }

            const cleanCardNum = cardNumber.replace(/\D/g, '');
            if (cleanCardNum.length < 13 || cleanCardNum.length > 19) {
                return NextResponse.json({ error: "Invalid card number length." }, { status: 400 });
            }

            // Expiry format MM/YY check
            if (!/^\d{2}\/\d{2}$/.test(expiration)) {
                return NextResponse.json({ error: "Expiration date must be in MM/YY format." }, { status: 400 });
            }

            // If default card, unset other cards
            if (isDefault) {
                await supabase
                    .from('patient_payment_methods')
                    .update({ is_default: false })
                    .eq('patient_id', user.id);
            }

            // Store card securely (masked last 4 digits)
            const lastFour = cleanCardNum.slice(-4);
            const { data, error } = await supabase
                .from('patient_payment_methods')
                .insert([
                    {
                        patient_id: user.id,
                        type: 'card',
                        card_brand: cardBrand,
                        last_four: lastFour,
                        expiration: expiration,
                        is_default: isDefault || false
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, paymentMethod: data });
        }

        if (action === 'pay-invoice') {
            const { id } = body;
            if (!id) {
                return NextResponse.json({ error: "Missing invoice ID." }, { status: 400 });
            }

            // Mark invoice as paid
            const { data, error } = await supabase
                .from('patient_billing')
                .update({
                    status: 'Paid',
                    status_color: 'bg-[#D4E6E5] text-[#576867]'
                })
                .eq('id', id)
                .eq('patient_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, invoice: data });
        }

        if (action === 'pay-outstanding') {
            // Mark all pending invoices as paid for this user
            const { data, error } = await supabase
                .from('patient_billing')
                .update({
                    status: 'Paid',
                    status_color: 'bg-[#D4E6E5] text-[#576867]'
                })
                .eq('patient_id', user.id)
                .eq('status', 'Pending')
                .select();

            if (error) throw error;
            return NextResponse.json({ success: true, count: data?.length || 0 });
        }


        if (action === 'update-insurance') {
            const { carrier, memberId, groupNumber } = body;
            if (!carrier || !memberId || !groupNumber) {
                return NextResponse.json({ error: "Missing required insurance fields." }, { status: 400 });
            }

            // Upsert insurance profile
            const { data, error } = await supabase
                .from('patient_insurance')
                .upsert([
                    {
                        patient_id: user.id,
                        carrier: carrier,
                        member_id: memberId,
                        group_number: groupNumber
                    }
                ], { onConflict: 'patient_id' })
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, insurance: data });
        }

        if (action === 'delete-card') {
            const { cardId } = body;
            if (!cardId) {
                return NextResponse.json({ error: "Missing card ID." }, { status: 400 });
            }

            const { error } = await supabase
                .from('patient_payment_methods')
                .delete()
                .eq('id', cardId)
                .eq('patient_id', user.id);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'set-default-card') {
            const { cardId } = body;
            if (!cardId) {
                return NextResponse.json({ error: "Missing card ID." }, { status: 400 });
            }

            // Unset all first
            await supabase
                .from('patient_payment_methods')
                .update({ is_default: false })
                .eq('patient_id', user.id);

            // Set default
            const { data, error } = await supabase
                .from('patient_payment_methods')
                .update({ is_default: true })
                .eq('id', cardId)
                .eq('patient_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, paymentMethod: data });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });

    } catch (err: any) {
        console.error("POST billing action error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
