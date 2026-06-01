import axios from 'axios';

export const api = axios.create({
    baseURL: '/',
    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            // Preserve the current locale when redirecting to login
            const localeMatch = window.location.pathname.match(/^\/(en|ar)/);
            const locale = localeMatch ? localeMatch[1] : 'en';
            // Strip the locale prefix to compare against the auth paths
            const pathWithoutLocale = window.location.pathname.replace(/^\/(en|ar)/, '') || '/';
            const authPaths = ['/login', '/register', '/verify-otp', '/request-access', '/activate'];
            // Don't redirect if the user is already on any auth page (avoids loops
            // and lets the auth flow handle its own 401s)
            const isOnAuthPage = authPaths.some(
                (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
            );
            // Don't redirect from public pages either — logged-out users browsing
            // /, /gyms, /coaches will hit 401 on /api/me; the UI handles it.
            const isOnPublicPage = ['/', '/gyms', '/coaches'].includes(pathWithoutLocale);
            if (!isOnAuthPage && !isOnPublicPage) {
                window.location.href = `/${locale}/login`;
            }
        }
        return Promise.reject(error);
    }
);
