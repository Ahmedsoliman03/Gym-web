import type { Dispatch, SetStateAction } from 'react';
import type { PresenceStatus } from '../../types';

type PresenceState = Record<string, PresenceStatus>;

/**
 * Builds the `presence.update` handler — records the latest known status for a
 * user so avatars and indicators can reflect online/offline/busy in realtime.
 */
export function createPresenceHandler(
    setPresenceByUser: Dispatch<SetStateAction<PresenceState>>,
) {
    return function applyPresenceUpdate(userId: string, status: PresenceStatus) {
        setPresenceByUser((prev) => ({ ...prev, [userId]: status }));
    };
}
