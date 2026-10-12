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
        const pathWithoutBase = window.location.pathname.replace(/^\/(platform|system)(?=\/|$)/, '') || '/';
        const match = pathWithoutBase.match(/^\/(en|ar)(?:\/|$)/);
        const locale = match ? match[1] : 'en';
        config.headers.set('Accept-Language', locale);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            // Strip optional basePath (/platform or /system)
            const pathWithoutBase = window.location.pathname.replace(/^\/(platform|system)(?=\/|$)/, '') || '/';
            // Preserve the current locale when redirecting to login
            const localeMatch = pathWithoutBase.match(/^\/(en|ar)/);
            const locale = localeMatch ? localeMatch[1] : 'en';
            // Strip the locale prefix to compare against the auth paths
            const pathWithoutLocale = pathWithoutBase.replace(/^\/(en|ar)(?=\/|$)/, '') || '/';
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
                const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
                const base = window.location.pathname.startsWith('/platform') ? '/platform' : (window.location.pathname.startsWith('/system') ? '/system' : '');
                const loginUrl = new URL(`${base}/${locale}/login`, window.location.origin);
                loginUrl.searchParams.set('next', currentPath);
                window.location.href = `${loginUrl.pathname}${loginUrl.search}`;
            }
        }
        return Promise.reject(error);
    }
);
