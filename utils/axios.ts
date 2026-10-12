import axios, { InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
    baseURL: '/',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const pathWithoutBase = window.location.pathname.replace(/^\/(platform|system)(?=\/|$)/, '') || '/';
        const match = pathWithoutBase.match(/^\/(en|ar)(?:\/|$)/);
        const locale = match ? match[1] : 'en';
        config.headers.set('Accept-Language', locale);
    }
    return config;
});

const redirectToLogin = () => {
    if (typeof window === 'undefined') return;

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
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        const url = originalRequest?.url || '';
        const isAuthEndpoint =
            url.includes('/api/auth/token/refresh') ||
            url.includes('/api/auth/login') ||
            url.includes('/api/auth/register') ||
            url.includes('/api/auth/google');

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call backend refresh endpoint (which reads the refresh_token cookie and sets fresh cookies)
                await axios.post('/api/auth/token/refresh', {}, { withCredentials: true });
                processQueue();
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                redirectToLogin();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 401 && isAuthEndpoint && url.includes('/api/auth/token/refresh')) {
            redirectToLogin();
        }

        return Promise.reject(error);
    }
);
