'use client';

import { useCallback, useEffect, useState } from 'react';
import { ResendCooldown, UseResendCooldownOptions } from '../types';



const DEFAULT_DURATION_MS = 15 * 1000;


export function useResendCooldown({
    storageKey,
    durationMs = DEFAULT_DURATION_MS,
}: UseResendCooldownOptions): ResendCooldown {
    const [until, setUntil] = useState(0);
    const [secondsLeft, setSecondsLeft] = useState(0);

    // Restore any persisted cooldown on mount so it continues across reloads.
    useEffect(() => {
        const stored = Number(localStorage.getItem(storageKey)) || 0;
        if (stored > Date.now()) {
            setUntil(stored);
        } else if (stored) {
            localStorage.removeItem(storageKey);
        }
    }, [storageKey]);

    // Tick the countdown down to zero, then clear the persisted expiry.
    useEffect(() => {
        if (!until) {
            setSecondsLeft(0);
            return;
        }
        const tick = () => {
            const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0) {
                localStorage.removeItem(storageKey);
                setUntil(0);
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [until, storageKey]);

    const start = useCallback(() => {
        const target = Date.now() + durationMs;
        localStorage.setItem(storageKey, String(target));
        setUntil(target);
    }, [storageKey, durationMs]);

    return { secondsLeft, isCoolingDown: secondsLeft > 0, start };
}
