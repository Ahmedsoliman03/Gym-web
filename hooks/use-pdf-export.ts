'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';
import { generatePDF, type GeneratePdfOptions } from '@/utils/pdf-export';

type ExportTarget = HTMLElement | RefObject<HTMLElement | null> | null | undefined;

function resolveElement(target: ExportTarget): HTMLElement | null {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  return target.current ?? null;
}

/**
 * Reusable PDF-export hook for any React component.
 *
 * Pass a ref (or element) to `exportToPdf` along with options. Exposes
 * `isExporting` for button/loading states and `error` for failed captures.
 * Concurrent calls are ignored while one export is in flight.
 *
 * @example
 *   const reportRef = useRef<HTMLDivElement>(null);
 *   const { isExporting, error, exportToPdf } = usePdfExport();
 *   <button disabled={isExporting} onClick={() => exportToPdf(reportRef, { fileName: 'report.pdf' })} />
 */
export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const inFlight = useRef(false);

  const exportToPdf = useCallback(
    async (target: ExportTarget, options?: GeneratePdfOptions): Promise<boolean> => {
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
        await generatePDF(element, options);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('PDF export failed.'));
        return false;
      } finally {
        inFlight.current = false;
        setIsExporting(false);
      }
    },
    [],
  );

  return { isExporting, error, exportToPdf };
}
