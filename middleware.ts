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

    // Get current locale or default to 'en'
    const localeMatch = pathname.match(/^\/(en|ar)/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    // 5. If there is NO token and user is NOT on an auth page, redirect to the login page
    if (!token && !isAuthPath) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 6. If there IS a token and user tries to access auth pages, redirect to the home page
    if (token && isAuthPath) {
        const homeUrl = new URL(`/${locale}`, request.url);
        return NextResponse.redirect(homeUrl);
    }

    // 7. Otherwise, let next-intl middleware handle localization
    return intlMiddleware(request);
}

export const config = {
    // Matcher including the locales and all paths
    matcher: ['/', '/(ar|en)/:path*', '/((?!_next/static|_next/image|favicon.ico|api).*)']
};

