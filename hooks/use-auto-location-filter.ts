'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocationDetect, LocationStatus } from './use-location-detect';

const STORAGE_KEYS = {
    city: 'detected_city',
    area: 'detected_area',
    detected: 'location_detected',
} as const;

const safeSessionStorage = {
    getItem(key: string): string | null {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                return sessionStorage.getItem(key);
            }
        } catch (e) {
            console.warn('sessionStorage is not accessible:', e);
        }
        return null;
    },
    setItem(key: string, value: string): void {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn('sessionStorage is not accessible:', e);
        }
    },
    removeItem(key: string): void {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.removeItem(key);
            }
        } catch (e) {
            console.warn('sessionStorage is not accessible:', e);
        }
    },
};

export interface UseAutoLocationFilterOptions {
    /**
     * Message shown via toast after a successful detection. Pass an i18n'd
     * string so the hook stays UI-agnostic.
     */
    successMessage?: string;
}

export interface UseAutoLocationFilterReturn {
    city: string;
    area: string;
    setCity: (val: string) => void;
    setArea: (val: string) => void;
    /** Manually trigger geolocation detection. */
    detect: () => void;
    /** Reset filter state and clear persisted values. */
    reset: () => void;
    /** Detection status; `isDetecting === true` while waiting on the browser. */
    status: LocationStatus;
    isDetecting: boolean;
}

/**
 * Shared location-filter logic for listings (gyms, coaches, ...).
 *
 * Behavior:
 *   - Owns `city` / `area` state.
 *   - Detection runs only when the caller invokes `detect()` (e.g. via a
 *     "Filter by my location" button) — never automatically on mount.
 *   - Restores previously-detected values from sessionStorage on mount so
 *     same-session navigations and language switches don't lose them.
 *   - Persists user edits to sessionStorage and surfaces a success toast on
 *     a completed detection.
 *
 * Multiple pages call this hook with the same sessionStorage keys, so a
 * detection performed on /gyms also pre-fills the same filters on /coaches.
 */
export function useAutoLocationFilter(
    options: UseAutoLocationFilterOptions = {},
): UseAutoLocationFilterReturn {
    const { successMessage } = options;
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const isRestoredRef = useRef(false);

    const { detect, status } = useLocationDetect(
        useCallback(
            (result) => {
                // Map governorate/county (e.g. Giza, Cairo) to the City input.
                let detectedCity = '';
                if (result.governorate) {
                    detectedCity = result.governorate;
                } else if (
                    result.city &&
                    (result.city.toLowerCase() === 'cairo' ||
                        result.city.toLowerCase() === 'giza')
                ) {
                    detectedCity = result.city;
                }

                // Map town/suburb (e.g. 6th of October, Maadi) to the Area input.
                let detectedArea = '';
                if (
                    result.city &&
                    result.city.toLowerCase() !== 'cairo' &&
                    result.city.toLowerCase() !== 'giza'
                ) {
                    detectedArea = result.city;
                } else if (result.area) {
                    detectedArea = result.area;
                }

                if (detectedCity) {
                    setCity(detectedCity);
                    safeSessionStorage.setItem(STORAGE_KEYS.city, detectedCity);
                }
                if (detectedArea) {
                    setArea(detectedArea);
                    safeSessionStorage.setItem(STORAGE_KEYS.area, detectedArea);
                }

                safeSessionStorage.setItem(STORAGE_KEYS.detected, 'true');
                if (successMessage) toast.success(successMessage);
            },
            [successMessage],
        ),
    );

    // Persist user edits to sessionStorage so language/route changes don't lose
    // their filter selection.
    useEffect(() => {
        if (!isRestoredRef.current) return;
        if (city) {
            safeSessionStorage.setItem(STORAGE_KEYS.city, city);
        } else {
            safeSessionStorage.removeItem(STORAGE_KEYS.city);
        }
    }, [city]);

    useEffect(() => {
        if (!isRestoredRef.current) return;
        if (area) {
            safeSessionStorage.setItem(STORAGE_KEYS.area, area);
        } else {
            safeSessionStorage.removeItem(STORAGE_KEYS.area);
        }
    }, [area]);

    // On first mount: restore prior session values. Do NOT auto-detect — the
    // caller must trigger detect() explicitly (e.g. via a button click).
    useEffect(() => {
        const storedCity = safeSessionStorage.getItem(STORAGE_KEYS.city);
        const storedArea = safeSessionStorage.getItem(STORAGE_KEYS.area);
        if (storedCity) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCity(storedCity);
        }
        if (storedArea) setArea(storedArea);
        isRestoredRef.current = true;
    }, []);

    const reset = useCallback(() => {
        setCity('');
        setArea('');
        safeSessionStorage.removeItem(STORAGE_KEYS.city);
        safeSessionStorage.removeItem(STORAGE_KEYS.area);
        safeSessionStorage.removeItem(STORAGE_KEYS.detected);
    }, []);

    return {
        city,
        area,
        setCity,
        setArea,
        detect,
        reset,
        status,
        isDetecting: status === 'loading',
    };
}
