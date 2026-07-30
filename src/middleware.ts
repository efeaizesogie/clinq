import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Protected paths
    const isAdminPath = pathname.startsWith('/admin')
    const isPatientPath = pathname.startsWith('/patient')

    if (isAdminPath || isPatientPath) {
        if (!user) {
            // Redirect to login if not authenticated
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        if (!user.email_confirmed_at) {
            // Redirect to verify if user is unverified
            const url = request.nextUrl.clone()
            url.pathname = '/verify'
            url.searchParams.set('email', user.email || '')
            url.searchParams.set('unverified', 'true')
            return NextResponse.redirect(url)
        }

        const role = user.user_metadata?.role || 'patient'

        if (isAdminPath && role !== 'admin' && role !== 'clinician') {
            // Admin dashboard requires admin/clinician role
            const url = request.nextUrl.clone()
            url.pathname = '/patient'
            return NextResponse.redirect(url)
        }

        if (isPatientPath && (role === 'admin' || role === 'clinician')) {
            // Patient dashboard is for patients only
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
