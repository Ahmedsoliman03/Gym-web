// Connection layer for the chat WebSocket. The backend is a raw Django Channels
// socket at `ws://.../ws/chat/` (see postman/README.md) — NOT Socket.IO — so we
// use the browser-native WebSocket. The HttpOnly access_token cookie plus a
// short-lived ticket query param authenticate the handshake.
export { getWsTicket } from '@/features/auth/services/auth.service';

export const RECONNECT_BASE_MS = 3_000;
export const RECONNECT_MAX_MS = 60_000;
export const RECONNECT_MAX_ATTEMPTS = 10;

// Close codes the server uses to say "do not retry" (auth/permission failures).
export const NO_RETRY_CLOSE_CODES = new Set<number>([4001, 4003, 4401, 4403]);

export const log = (event: string, extra?: Record<string, unknown>) => {
    if (typeof console !== 'undefined') {
        console.info(`[chat-ws] ${event}`, extra ?? {});
    }
};

export const buildWsUrl = (): string | null => {
    const explicit = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL;
    const fallback =
        typeof window !== 'undefined'
            ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000`
            : null;
    const raw = explicit || fallback;
    if (!raw) return null;
    const trimmed = raw
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://')
        .replace(/\/api\/?$/, '')
        .replace(/\/+$/, '');
    return trimmed.endsWith('/ws/chat') ? `${trimmed}/` : `${trimmed}/ws/chat/`;
};
