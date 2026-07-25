export const HEARTBEAT_MS = 30_000;

interface HeartbeatOptions {
    // Emit an application-level presence heartbeat to the server.
    sendHeartbeat: () => void;
    // Whether the socket is currently connected.
    isConnected: () => boolean;
}

/**
 * Emits the application-level presence heartbeat while the socket is open.
 * The backend does not acknowledge heartbeat events, so connection health is
 * determined by the WebSocket close/error lifecycle rather than inactivity.
 */
export function createHeartbeat(opts: HeartbeatOptions) {
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    };

    const start = () => {
        stop();

        heartbeatTimer = setInterval(() => {
            if (opts.isConnected()) opts.sendHeartbeat();
        }, HEARTBEAT_MS);
    };

    return { start, stop };
}
