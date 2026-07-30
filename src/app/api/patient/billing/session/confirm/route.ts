import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any })
    : null;

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');
        const action = searchParams.get('action');

        if (!sessionId || !action) {
            return NextResponse.json({ error: "Missing required parameters: session_id or action." }, { status: 400 });
        }

        // ──────────────────────── CASE 1: STRIPE SECRET DEFINED (REAL INTEGRATION) ────────────────────────
        if (stripe) {
            // Retrieve Stripe session expanding payment intents
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ['setup_intent.payment_method', 'payment_intent.payment_method'],
            });

            if (action === 'pay-balance') {
                const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;
                const paymentStatus = paymentIntent?.status || session.payment_status;

                if (paymentStatus === 'succeeded' || paymentStatus === 'paid') {
                    // Update DB pending invoices to Paid
                    const { error: updateErr } = await supabase
                        .from('patient_billing')
                        .update({
                            status: 'Paid',
                            status_color: 'bg-[#D4E6E5] text-[#576867]'
                        })
                        .eq('patient_id', user.id)
                        .eq('status', 'Pending');

                    if (updateErr) throw updateErr;

                    // Try to extract and save the card used for checkout
                    try {
                        const pm = paymentIntent?.payment_method as Stripe.PaymentMethod | null;
                        if (pm && pm.card) {
                            const brand = pm.card.brand;
                            const last4 = pm.card.last4;
                            const expMonth = pm.card.exp_month.toString().padStart(2, '0');
                            const expYear = pm.card.exp_year.toString().slice(-2);

                            // Check if card is already registered
                            const { data: existing } = await supabase
                                .from('patient_payment_methods')
                                .select('*')
                                .eq('patient_id', user.id)
                                .eq('last_four', last4)
                                .eq('card_brand', brand)
                                .maybeSingle();

                            if (!existing) {
                                // Remove other default cards
                                await supabase
                                    .from('patient_payment_methods')
                                    .update({ is_default: false })
                                    .eq('patient_id', user.id);

                                await supabase.from('patient_payment_methods').insert([
                                    {
                                        patient_id: user.id,
                                        type: 'card',
                                        card_brand: brand.charAt(0).toUpperCase() + brand.slice(1),
                                        last_four: last4,
                                        expiration: `${expMonth}/${expYear}`,
                                        is_default: true
                                    }
                                ]);
                            }
                        }
                    } catch (cardErr) {
                        console.error("Optional card preservation error:", cardErr);
                    }

                    return NextResponse.json({ success: true, message: "Balance paid successfully via Stripe." });
                } else {
                    return NextResponse.json({ error: "Stripe payment has not been successfully completed." }, { status: 400 });
                }
            }

            if (action === 'add-card') {
                const setupIntent = session.setup_intent as Stripe.SetupIntent | null;
                if (setupIntent && setupIntent.status === 'succeeded') {
                    const pm = setupIntent.payment_method as Stripe.PaymentMethod | null;
                    if (!pm || !pm.card) {
                        return NextResponse.json({ error: "No card found attached to the setup intent." }, { status: 400 });
                    }

                    const brand = pm.card.brand;
                    const last4 = pm.card.last4;
                    const expMonth = pm.card.exp_month.toString().padStart(2, '0');
                    const expYear = pm.card.exp_year.toString().slice(-2);

                    // Clear previous default tags
                    await supabase
                        .from('patient_payment_methods')
                        .update({ is_default: false })
                        .eq('patient_id', user.id);

                    // Create payment method details
                    const { data, error } = await supabase
                        .from('patient_payment_methods')
                        .insert([
                            {
                                patient_id: user.id,
                                type: 'card',
                                card_brand: brand.charAt(0).toUpperCase() + brand.slice(1),
                                last_four: last4,
                                expiration: `${expMonth}/${expYear}`,
                                is_default: true
                            }
                        ])
                        .select()
                        .single();

                    if (error) throw error;
                    return NextResponse.json({ success: true, paymentMethod: data });
                } else {
                    return NextResponse.json({ error: "Card tokenization has not succeeded." }, { status: 400 });
                }
            }
        }

        // ──────────────────────── CASE 2: STRIPE NOT DEFINED (SANDBOX ENVIRONMENT) ────────────────────────
        // If no stripe key in local development, parse details passed back by the sandbox Checkout screen
        if (action === 'pay-balance') {
            const { error } = await supabase
                .from('patient_billing')
                .update({
                    status: 'Paid',
                    status_color: 'bg-[#D4E6E5] text-[#576867]'
                })
                .eq('patient_id', user.id)
                .eq('status', 'Pending');

            if (error) throw error;
            return NextResponse.json({ success: true, message: "Sandbox balance cleared." });
        }

        if (action === 'add-card') {
            const cardBrand = searchParams.get('card_brand') || 'Visa';
            const lastFour = searchParams.get('last_four') || '4242';
            const expiration = searchParams.get('expiration') || '12/28';

            // Clear previous default configurations
            await supabase
                .from('patient_payment_methods')
                .update({ is_default: false })
                .eq('patient_id', user.id);

            const { data, error } = await supabase
                .from('patient_payment_methods')
                .insert([
                    {
                        patient_id: user.id,
                        type: 'card',
                        card_brand: cardBrand,
                        last_four: lastFour,
                        expiration: expiration,
                        is_default: true
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return NextResponse.json({ success: true, paymentMethod: data });
        }

        return NextResponse.json({ error: "Unsupported sandbox checkout action type." }, { status: 400 });

    } catch (err: any) {
        console.error("GET confirm session error:", err.message);
        return NextResponse.json({ error: err.message || "Failed to confirm checkout details." }, { status: 500 });
    }
}
