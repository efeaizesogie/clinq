import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);

    // Check if Supabase sent an error back in the callback url
    const errorParam = searchParams.get('error');
    if (errorParam) {
        const errorDescription = searchParams.get('error_description') || 'Could not verify authentication link';
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription)}`);
    }

    const code = searchParams.get('code');
    const next = searchParams.get('next');

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
        }

        if (data?.user) {
            // Check if there's a custom next path, like reset-password
            if (next) {
                return NextResponse.redirect(`${origin}${next}`);
            }

            // Otherwise redirect to user dashboard based on role
            const role = data.user.user_metadata?.role || 'patient';
            const redirectUrl = role === 'admin' || role === 'clinician' ? '/admin' : '/patient';
            return NextResponse.redirect(`${origin}${redirectUrl}`);
        }
    }

    // Redirect to login page with error query parameter if code exchange fails
    return NextResponse.redirect(`${origin}/login?error=Could not exchange code for session`);
}
