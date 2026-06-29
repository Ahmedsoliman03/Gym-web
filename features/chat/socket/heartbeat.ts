import { log } from './socket';

export const HEARTBEAT_MS = 30_000;
export const STALE_INBOUND_MS = 75_000;

interface HeartbeatOptions {
    // Emit an application-level presence heartbeat to the server.
    sendHeartbeat: () => void;
    // Whether the socket is currently connected.
    isConnected: () => boolean;
    // Timestamp (ms) of the last frame received from the server.
    getLastInboundAt: () => number;
    // Called when the connection looks dead (no inbound traffic for too long).
    onStale: () => void;
}

/**
 * Owns the two periodic timers that keep the connection healthy:
 *  - a presence heartbeat emitted every HEARTBEAT_MS, and
 *  - an alive-check that forces a reconnect when no inbound frame has arrived
 *    within STALE_INBOUND_MS.
 */
export function createHeartbeat(opts: HeartbeatOptions) {
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let aliveTimer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
        if (aliveTimer) {
            clearInterval(aliveTimer);
            aliveTimer = null;
        }
    };

    const start = () => {
        stop();

        heartbeatTimer = setInterval(() => {
            if (opts.isConnected()) opts.sendHeartbeat();
        }, HEARTBEAT_MS);

        aliveTimer = setInterval(() => {
            if (!opts.isConnected()) return;
            const silence = Date.now() - opts.getLastInboundAt();
            if (silence > STALE_INBOUND_MS) {
                log('alive-check failed — forcing reconnect', { silenceMs: silence });
                opts.onStale();
            }
        }, HEARTBEAT_MS);
    };

    return { start, stop };
}
