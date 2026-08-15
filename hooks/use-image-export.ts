'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';
import { exportToImage, captureImageBlob, type GenerateImageOptions } from '@/utils/image-export';

type ExportTarget = HTMLElement | RefObject<HTMLElement | null> | null | undefined;

function resolveElement(target: ExportTarget): HTMLElement | null {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  return target.current ?? null;
}

export type ShareImageOutcome = 'shared' | 'downloaded';

/**
 * Reusable PNG-export + native-share hook for any React component.
 *
 * `downloadImage` rasterizes a ref/element and saves it as a PNG. `shareImage`
 * rasterizes it and hands it to the Web Share API (so it can be attached
 * directly to WhatsApp/Instagram/etc. on supporting devices); when the device
 * doesn't support sharing files, it falls back to downloading the image so the
 * caller can prompt the user to attach it manually.
 */
export function useImageExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const inFlight = useRef(false);

  const downloadImage = useCallback(
    async (target: ExportTarget, options?: GenerateImageOptions): Promise<boolean> => {
      if (inFlight.current) return false;

      const element = resolveElement(target);
      if (!element) {
        setError(new Error('Nothing to export — target element was not found.'));
        return false;
      }

      inFlight.current = true;
      setIsExporting(true);
      setError(null);
      try {
        await exportToImage(element, options);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Image export failed.'));
        return false;
      } finally {
        inFlight.current = false;
        setIsExporting(false);
      }
    },
    [],
  );

  const shareImage = useCallback(
    async (
      target: ExportTarget,
      options: { fileName?: string; shareTitle?: string; shareText?: string } = {},
    ): Promise<ShareImageOutcome> => {
      const element = resolveElement(target);
      if (!element) {
        setError(new Error('Nothing to share — target element was not found.'));
        return 'downloaded';
      }

      setIsSharing(true);
      setError(null);
      try {
        const blob = await captureImageBlob(element);
        const fileName = (options.fileName ?? 'image.png').endsWith('.png')
          ? (options.fileName ?? 'image.png')
          : `${options.fileName}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: options.shareTitle, text: options.shareText });
          return 'shared';
        }

        // Fallback: download so the caller can direct the user to attach it manually.
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return 'downloaded';
      } catch (err) {
        // AbortError = the user dismissed the native share sheet, not a failure.
        if (err instanceof DOMException && err.name === 'AbortError') return 'downloaded';
        setError(err instanceof Error ? err : new Error('Sharing failed.'));
        return 'downloaded';
      } finally {
        setIsSharing(false);
      }
    },
    [],
  );

  return { isExporting, isSharing, error, downloadImage, shareImage };
}
