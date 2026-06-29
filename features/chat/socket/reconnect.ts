import {
    RECONNECT_BASE_MS,
    RECONNECT_MAX_MS,
    RECONNECT_MAX_ATTEMPTS,
    log,
} from './socket';

interface ReconnectorOptions {
    // Only reconnect while the user is still authenticated.
    isLoggedIn: () => boolean;
    // Kick off a fresh connection attempt.
    reconnect: () => void;
    // Attempts exhausted — stop trying and surface a "gave up" state.
    onGiveUp: () => void;
}

/**
 * Exponential-backoff reconnection scheduler. Tracks the attempt count, caps it
 * at RECONNECT_MAX_ATTEMPTS, and guards against scheduling more than one pending
 * reconnect at a time.
 */
export function createReconnector(opts: ReconnectorOptions) {
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
        if (!opts.isLoggedIn()) return;
        if (attempt >= RECONNECT_MAX_ATTEMPTS) {
            log('reconnect cap reached — giving up', { attempts: attempt });
            opts.onGiveUp();
            return;
        }
        if (timer) return;
        attempt += 1;
        const delay = Math.min(RECONNECT_BASE_MS * 2 ** (attempt - 1), RECONNECT_MAX_MS);
        log('scheduled reconnect', { attempt, delayMs: delay });
        timer = setTimeout(() => {
            timer = null;
            opts.reconnect();
        }, delay);
    };

    const reset = () => {
        attempt = 0;
    };

    const clear = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    return {
        schedule,
        reset,
        clear,
        get attempt() {
            return attempt;
        },
    };
}
