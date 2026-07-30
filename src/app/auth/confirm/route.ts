import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') ?? '/';

    // First check if there is an error parameter from Supabase
    const errorParam = searchParams.get('error');
    if (errorParam) {
        const errorDescription = searchParams.get('error_description') || 'Could not verify link';
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription)}`);
    }

    if (token_hash && type) {
        const supabase = await createClient();

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            // Successful verification: redirect to custom page (like /reset-password) or dashboard
            if (next && next !== '/' && next !== '') {
                return NextResponse.redirect(`${origin}${next}`);
            }

            // Redirect automatically based on the user's role on success
            const { data: { user } } = await supabase.auth.getUser();
            const role = user?.user_metadata?.role || 'patient';
            const redirectUrl = role === 'admin' || role === 'clinician' ? '/admin' : '/patient';

            return NextResponse.redirect(`${origin}${redirectUrl}`);
        } else {
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=Invalid or missing token parameters`);
}
