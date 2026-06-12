import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'en'
});

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Exclude public static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // 2. Check for token in cookies (checking both 'access_token' and 'token')
    const token = request.cookies.get('access_token')?.value || request.cookies.get('token')?.value;

    // 3. Extract path without locale prefix (e.g. /en/login -> /login)
    const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

    // 4. Define paths that are part of the auth flow (accessible without login)
    const authPaths = [
        '/login',
        '/register',
        '/verify-otp',
        '/request-access',
        '/activate'
    ];

    const isAuthPath = authPaths.some(path =>
        pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(`${path}/`)
    );

    const publicPaths = ['/', '/gyms', '/coaches', '/about', '/plans'];
    const isPublicPath = publicPaths.includes(pathnameWithoutLocale);

    // Get current locale or default to 'en'
    const localeMatch = pathname.match(/^\/(en|ar)/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    // Helper to decode JWT payload safely in Next.js Edge runtime
    function decodeJwt(jwtToken: string) {
        try {
            const parts = jwtToken.split('.');
            if (parts.length !== 3) return null;
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Decode base64 using atob and escape unicode characters
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    }

    // 5. If there is NO token and user is NOT on an auth or public page, send to
    //    login with `next` so the user is bounced back here after authenticating.
    if (!token && !isAuthPath && !isPublicPath) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 6. If there IS a token and user tries to access auth pages, redirect to the home page
    if (token && isAuthPath) {
        const homeUrl = new URL(`/${locale}`, request.url);
        return NextResponse.redirect(homeUrl);
    }

    // 7. Enforce role-based access control if user is logged in
    if (token && !isAuthPath) {

        const jwtPayload = decodeJwt(token);
        const userType = jwtPayload?.userType || jwtPayload?.user_type || jwtPayload?.role;

        // Apply access restrictions:
        // /jobs is an allowlist: only gyms and coaches may enter. Any other
        // role (client, unknown/future userTypes, missing claim) is bounced.
        const isJobsPath =
            pathnameWithoutLocale === '/jobs' ||
            pathnameWithoutLocale.startsWith('/jobs/');
        if (isJobsPath && userType !== 'gym' && userType !== 'coach') {
            const homeUrl = new URL(`/${locale}`, request.url);
            return NextResponse.redirect(homeUrl);
        }

        // Coach: all access except /applications
        if (userType === 'coach') {
            const isBlocked = pathnameWithoutLocale === '/applications' || pathnameWithoutLocale.startsWith('/applications/');
            if (isBlocked) {
                const homeUrl = new URL(`/${locale}`, request.url);
                return NextResponse.redirect(homeUrl);
            }
        }
        // Client: can only access /gyms, /coaches, /about (blocked from /applications;
        // /jobs is already handled by the allowlist above)
        else if (userType === 'client') {
            const isBlocked =
                pathnameWithoutLocale === '/applications' ||
                pathnameWithoutLocale.startsWith('/applications/');
            if (isBlocked) {
                const homeUrl = new URL(`/${locale}`, request.url);
                return NextResponse.redirect(homeUrl);
            }
        }
    }

    // 8. Otherwise, let next-intl middleware handle localization
    return intlMiddleware(request);
}

export const config = {
    // Matcher including the locales and all paths
    matcher: ['/', '/(ar|en)/:path*', '/((?!_next/static|_next/image|favicon.ico|api).*)']
};

