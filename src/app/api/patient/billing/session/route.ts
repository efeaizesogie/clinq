import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Stripe client initialisation
const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any })
    : null;

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { actionType } = body;
        const origin = request.headers.get('origin') || 'http://localhost:3000';

        // Fetch user details from supabase auth/records to attach to Stripe profile
        const { data: profile } = await supabase
            .from('patient_records')
            .select('full_name, email')
            .eq('email', user.email)
            .maybeSingle();

        const customerEmail = profile?.email || user.email || '';
        const customerName = profile?.full_name || 'Clinq Patient';

        // Check if Stripe is configured
        if (!stripe) {
            console.warn("STRIPE_SECRET_KEY is not defined. Falling back to local Stripe Checkout Sandbox route.");
            const sandboxUrl = actionType === 'pay-balance'
                ? `${origin}/patient/billing/stripe-checkout?actionType=pay-balance&amount=${body.amount || '0.00'}`
                : `${origin}/patient/billing/stripe-checkout?actionType=add-card`;

            return NextResponse.json({ url: sandboxUrl, isSimulated: true });
        }

        if (actionType === 'pay-balance') {
            const { amount } = body;
            if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                return NextResponse.json({ error: "Invalid payment amount specified." }, { status: 400 });
            }

            // Create a Checkout Session for one-time payments
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: customerEmail,
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Clinq Consultation Outstanding Balance',
                                description: 'Payment for patient clinical consultations and services.',
                            },
                            unit_amount: Math.round(parseFloat(amount) * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${origin}/patient/billing?stripe_status=success&session_id={CHECKOUT_SESSION_ID}&action=pay-balance`,
                cancel_url: `${origin}/patient/billing?stripe_status=cancel`,
                metadata: {
                    patient_id: user.id,
                    email: customerEmail,
                    name: customerName,
                },
            });

            return NextResponse.json({ url: session.url });
        }

        if (actionType === 'add-card') {
            // Create a Checkout Session for SetupIntents (collect and link credit card details securely)
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                customer_email: customerEmail,
                mode: 'setup',
                success_url: `${origin}/patient/billing?stripe_status=success&session_id={CHECKOUT_SESSION_ID}&action=add-card`,
                cancel_url: `${origin}/patient/billing?stripe_status=cancel`,
                metadata: {
                    patient_id: user.id,
                    email: customerEmail,
                    name: customerName,
                },
            });

            return NextResponse.json({ url: session.url });
        }

        return NextResponse.json({ error: "Invalid Stripe action type specified." }, { status: 400 });

    } catch (err: any) {
        console.error("Stripe Session API Error:", err.message);
        return NextResponse.json({ error: err.message || "Failed to establish checkout session." }, { status: 500 });
    }
}
