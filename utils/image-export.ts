/**
 * Generic, client-side PNG export.
 *
 * Unlike `pdf-export.ts` this does not paginate — it rasterizes the element at
 * its own layout size, so callers should render the target off-screen at the
 * exact pixel dimensions they want exported (e.g. a fixed 1080x1350 social card).
 */

import { waitForAssets } from './pdf-export';

export interface GenerateImageOptions {
  /** Download file name. `.png` is appended if missing. */
  fileName?: string;
  /** Device-pixel multiplier for a sharp capture (2 = retina, 3 = crisper/heavier). */
  scale?: number;
  /** Canvas background for any transparent regions. */
  backgroundColor?: string;
}

function triggerImageDownload(dataUrl: string, fileName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Rasterize `element` and trigger a PNG download. */
export async function exportToImage(
  element: HTMLElement,
  options: GenerateImageOptions = {},
): Promise<void> {
  if (typeof window === 'undefined') throw new Error('exportToImage must run in the browser');
  if (!element) throw new Error('exportToImage: target element is missing');

  const { toPng } = await import('html-to-image');
  const { fileName = 'image.png', scale = 2, backgroundColor = '#ffffff' } = options;

  await waitForAssets(element);

  const dataUrl = await toPng(element, {
    pixelRatio: scale,
    backgroundColor,
    cacheBust: true,
  });

  triggerImageDownload(dataUrl, fileName);
}

/** Rasterize `element` into a PNG Blob (no download) — for the Web Share API. */
export async function captureImageBlob(
  element: HTMLElement,
  options: Omit<GenerateImageOptions, 'fileName'> = {},
): Promise<Blob> {
  if (typeof window === 'undefined') throw new Error('captureImageBlob must run in the browser');
  if (!element) throw new Error('captureImageBlob: target element is missing');

  const { toBlob } = await import('html-to-image');
  const { scale = 2, backgroundColor = '#ffffff' } = options;

  await waitForAssets(element);

  const blob = await toBlob(element, {
    pixelRatio: scale,
    backgroundColor,
    cacheBust: true,
  });
  if (!blob) throw new Error('captureImageBlob: rasterization failed');
  return blob;
}
