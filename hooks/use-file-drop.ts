'use client';

import { useCallback, useState, type DragEvent } from 'react';

interface UseFileDropOptions {
    /** Called with the accepted dropped files (already filtered by `accept`). */
    onFiles: (files: File[]) => void;
    /** Mirror of the `<input accept>` attribute (e.g. `image/*`, `.pdf,.doc`). */
    accept?: string;
    /** When false (default), only the first dropped file is passed through. */
    multiple?: boolean;
    /** Ignore drag/drop while true (e.g. during submit). */
    disabled?: boolean;
}

/** Returns whether `file` satisfies a comma-separated `accept` rule string.
 *  Supports `*`/`*​/*` wildcards, `type/*` prefixes, exact MIME types, and
 *  `.ext` extensions — the same forms the native file picker accepts. */
const matchesAccept = (file: File, accept?: string) => {
    if (!accept) return true;
    const rules = accept
        .split(',')
        .map((r) => r.trim().toLowerCase())
        .filter(Boolean);
    if (rules.length === 0) return true;
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    return rules.some((rule) => {
        if (rule === '*' || rule === '*/*') return true;
        if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
        if (rule.startsWith('.')) return name.endsWith(rule);
        return type === rule;
    });
};

/**
 * Drag-and-drop support for the custom upload dropzones. Wire the returned
 * `dropHandlers` onto the dropzone element and use `isDragging` to highlight it;
 * the click-to-pick `<input type="file">` keeps working alongside it.
 */
export function useFileDrop({
    onFiles,
    accept,
    multiple = false,
    disabled = false,
}: UseFileDropOptions) {
    const [isDragging, setIsDragging] = useState(false);

    const onDragOver = useCallback(
        (e: DragEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        },
        [disabled],
    );

    const onDragLeave = useCallback(
        (e: DragEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        },
        [disabled],
    );

    const onDrop = useCallback(
        (e: DragEvent) => {
            if (disabled) return;
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            const dropped = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
                matchesAccept(f, accept),
            );
            if (dropped.length === 0) return;
            onFiles(multiple ? dropped : dropped.slice(0, 1));
        },
        [disabled, accept, multiple, onFiles],
    );

    return {
        isDragging,
        dropHandlers: { onDragOver, onDragLeave, onDrop },
    };
}
