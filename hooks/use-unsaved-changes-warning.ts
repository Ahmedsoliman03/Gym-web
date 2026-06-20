'use client';

import { useEffect } from 'react';

/**
 * Warns the user before they leave the page (tab close / refresh / external
 * navigation) while a form has unsaved edits. Pass `true` only while the form
 * is dirty so the native prompt isn't shown on a pristine form.
 *
 * Note: this covers full-page unloads. In-app navigations triggered by our own
 * `router.push` after a successful save are client-side and won't trigger it.
 */
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

/**
 * Stable string projection of arbitrary form state for dirty comparison.
 * `File` instances aren't JSON-serializable, so they're replaced with a marker
 * derived from name + size — enough to detect that an image was changed/added.
 */
export function serializeFormState(value: unknown): string {
  return JSON.stringify(value, (_key, val) =>
    typeof File !== 'undefined' && val instanceof File
      ? `__file__:${val.name}:${val.size}`
      : val,
  );
}
