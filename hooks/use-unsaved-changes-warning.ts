'use client';

import { useEffect } from 'react';

export function useUnsavedChangesWarning(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Required by some browsers to actually show the prompt.
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}

export function serializeFormState(value: unknown): string {
  return JSON.stringify(value, (_key, val) =>
    typeof File !== 'undefined' && val instanceof File
      ? `__file__:${val.name}:${val.size}`
      : val,
  );
}
