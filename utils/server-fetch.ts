import { cookies } from 'next/headers';

// Mirror the browser proxy's base-URL logic (app/api/[...slug]/route.ts).
const NEXT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_WITH_PATH = NEXT_API_URL.endsWith('/api') ? NEXT_API_URL : `${NEXT_API_URL}/api`;

/**
 * Server-side GET against the upstream backend, for RSC prefetching.
 *
 * The browser never talks to the backend directly — it goes through the /api
 * proxy, which turns the HttpOnly `access_token` cookie into an `Authorization:
 * Bearer` header. Server Components can't use that relative proxy, so this
 * reproduces the same cookie→Bearer translation and `no-store` policy against the
 * upstream backend.
 *
 * It intentionally does NOT attempt a token refresh (unlike the proxy). Callers
 * should wrap this in try/catch and let the client refetch through the proxy —
 * which does refresh — as a graceful fallback.
 */
export async function serverApiGet<T>(path: string): Promise<T> {
    const cookieStore = await cookies();
    const token =
        cookieStore.get('access_token')?.value || cookieStore.get('token')?.value;
    const cleanPath = path.replace(/^\/+/, '');

    const res = await fetch(`${API_WITH_PATH}/${cleanPath}`, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'ngrok-skip-browser-warning': 'true',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error(`serverApiGet(${cleanPath}): backend responded ${res.status}`);
    }

    return res.json() as Promise<T>;
}
