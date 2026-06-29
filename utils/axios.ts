import axios from 'axios';

export const api = axios.create({
    baseURL: '/',
    withCredentials: true,

    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const match = window.location.pathname.match(/^\/(en|ar)(?:\/|$)/);
        const locale = match ? match[1] : 'en';
        config.headers.set('Accept-Language', locale);
    }
    return config;
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
            const authPaths = [
                '/login',
                '/register',
                '/verify-otp',
                '/request-access',
                '/activate',
                '/complete-google-signup',
            ];
            const isOnAuthPage = authPaths.some(
                (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
            );
            const isOnPublicPage = ['/', '/gyms', '/coaches'].includes(pathWithoutLocale);
            if (!isOnAuthPage && !isOnPublicPage) {
                window.location.href = `/${locale}/login`;
            }
        }
        return Promise.reject(error);
    }
);
