import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'en'
});

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Strip optional basePath (/platform or /system)
    const pathWithoutBase = pathname.replace(/^\/(platform|system)(?=\/|$)/, '') || '/';

    // 1. Exclude public static files and API routes
    if (
        pathWithoutBase.startsWith('/_next') ||
        pathWithoutBase.startsWith('/api') ||
        pathWithoutBase.includes('.')
    ) {
        return NextResponse.next();
    }

    // 2. Check for token in cookies (checking both 'access_token' and 'token')
    const token = request.cookies.get('access_token')?.value || request.cookies.get('token')?.value;

    // 3. Extract path without locale prefix (e.g. /en/login -> /login)
    const pathnameWithoutLocale = pathWithoutBase.replace(/^\/(en|ar)(?=\/|$)/, '') || '/';

    // 4. Define paths that are part of the auth flow (accessible without login)
    const authPaths = [
        '/login',
        '/register',
        '/verify-otp',
        '/request-access',
        '/activate',
        '/complete-google-signup',
    ];

    const isAuthPath = authPaths.some(path =>
        pathnameWithoutLocale === path || pathnameWithoutLocale.startsWith(`${path}/`)
    );

    const publicPaths = ['/', '/gyms', '/coaches', '/about' /* , '/plans' */];
    const publicShareDetailPattern = /^\/(coaches|gyms|community|jobs)\/[^/]+$/;
    const isPublicPath =
        publicPaths.includes(pathnameWithoutLocale) ||
        publicShareDetailPattern.test(pathnameWithoutLocale);

    // Get current locale or default to 'en'
    const localeMatch = pathWithoutBase.match(/^\/(en|ar)/);
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

    const stripLocale = (path: string) =>
        path
            .replace(/^\/(platform|system)(?=\/|$)/, '')
            .replace(/^\/(en|ar)(?=\/|$)/, '') || '/';

    const isAuthFlowPath = (path: string) =>
        authPaths.some((authPath) => path === authPath || path.startsWith(`${authPath}/`));

    const normalizeNextPath = (rawNext: string | null) => {
        if (!rawNext || !rawNext.startsWith('/') || rawNext.startsWith('//')) return null;

        try {
            const parsed = new URL(rawNext, request.url);
            if (parsed.origin !== request.nextUrl.origin) return null;

            const nextPathWithoutLocale = stripLocale(parsed.pathname);
            if (isAuthFlowPath(nextPathWithoutLocale)) return null;

            return `${parsed.pathname}${parsed.search}${parsed.hash}`;
        } catch {
            return null;
        }
    };

    if (!token && !isAuthPath && !isPublicPath) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = `/${locale}/login`;
        const currentNext = request.nextUrl.searchParams.get('next');
        if (!currentNext && !isAuthFlowPath(pathnameWithoutLocale)) {
            loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
        }
        return NextResponse.redirect(loginUrl);
    }

    // 6. If there IS a token and user tries to access auth pages, redirect to the home page
    if (token && isAuthPath) {
        const nextPath = normalizeNextPath(request.nextUrl.searchParams.get('next'));
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = nextPath ?? `/${locale}`;
        return NextResponse.redirect(redirectUrl);
    }

    // 7. Enforce role-based access control if user is logged in
    if (token && !isAuthPath) {

        const jwtPayload = decodeJwt(token);
        const userType = jwtPayload?.userType || jwtPayload?.user_type || jwtPayload?.role;

        const isJobsPath =
            pathnameWithoutLocale === '/jobs' ||
            pathnameWithoutLocale.startsWith('/jobs/');
        if (isJobsPath && userType !== 'gym' && userType !== 'coach') {
            const homeUrl = request.nextUrl.clone();
            homeUrl.pathname = `/${locale}`;
            return NextResponse.redirect(homeUrl);
        }

        // Coach: all access except /applications
        if (userType === 'coach') {
            const isBlocked = pathnameWithoutLocale === '/applications' || pathnameWithoutLocale.startsWith('/applications/');
            if (isBlocked) {
                const homeUrl = request.nextUrl.clone();
                homeUrl.pathname = `/${locale}`;
                return NextResponse.redirect(homeUrl);
            }
        }
        else if (userType === 'client') {
            const isBlocked =
                pathnameWithoutLocale === '/applications' ||
                pathnameWithoutLocale.startsWith('/applications/');
            if (isBlocked) {
                const homeUrl = request.nextUrl.clone();
                homeUrl.pathname = `/${locale}`;
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
