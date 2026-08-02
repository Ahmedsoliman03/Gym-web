const AUTH_FLOW_PATHS = [
    '/login',
    '/register',
    '/verify-otp',
    '/request-access',
    '/activate',
    '/complete-google-signup',
];

const stripLocale = (path: string) => path.replace(/^\/(en|ar)(?=\/|$)/, '') || '/';

const isAuthFlowPath = (path: string) =>
    AUTH_FLOW_PATHS.some((authPath) => path === authPath || path.startsWith(`${authPath}/`));

export const normalizeAuthNextPath = (rawNext: string | null) => {
    if (!rawNext || !rawNext.startsWith('/') || rawNext.startsWith('//')) return '/';

    try {
        const url = new URL(rawNext, 'http://gymspot.local');
        const nextPath = stripLocale(url.pathname);
        if (isAuthFlowPath(nextPath)) return '/';

        return `${nextPath}${url.search}${url.hash}`;
    } catch {
        return '/';
    }
};
