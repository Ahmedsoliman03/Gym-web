'use client';

import { useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';

interface FormPersistProps {
    /** Unique key for this form, e.g. `"draft:gym-request"`. */
    storageKey: string;
    /** Field names never written to storage (passwords, codes, …). */
    exclude?: string[];
    /** Debounce before each write (ms). */
    debounceMs?: number;
}

const isFileLike = (v: unknown): boolean =>
    (typeof File !== 'undefined' && v instanceof File) ||
    (typeof Blob !== 'undefined' && v instanceof Blob);

/** Keep only the JSON-serializable, non-excluded scalar/array fields. */
const sanitize = (
    values: Record<string, unknown>,
    exclude: string[],
): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(values)) {
        if (exclude.includes(key)) continue;
        if (value === undefined || typeof value === 'function') continue;
        if (isFileLike(value)) continue;
        if (Array.isArray(value) && value.some(isFileLike)) continue;
        out[key] = value;
    }
    return out;
};

export function FormPersist({
    storageKey,
    exclude = [],
    debounceMs = 400,
}: FormPersistProps) {
    const { values, setValues } = useFormikContext<Record<string, unknown>>();
    const initialValues = useRef(values);
    const restored = useRef(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (restored.current) return;
        restored.current = true;
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved && typeof saved === 'object') {
                setValues({ ...initialValues.current, ...saved }, false);
            }
        } catch {
            // Corrupt/blocked storage — start fresh rather than crash.
        }
    }, [storageKey, setValues]);

    // Mirror subsequent edits to storage (debounced).
    useEffect(() => {
        if (!restored.current) return;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            try {
                window.localStorage.setItem(
                    storageKey,
                    JSON.stringify(sanitize(values, exclude)),
                );
            } catch {
                // Quota / serialization failures are non-fatal for the form.
            }
        }, debounceMs);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [values, exclude, storageKey, debounceMs]);

    return null;
}

/** Remove a persisted draft — call after a successful submit. */
export function clearFormDraft(storageKey: string) {
    try {
        window.localStorage.removeItem(storageKey);
    } catch {
        // ignore
    }
}
