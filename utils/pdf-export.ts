import { toPng } from 'html-to-image';
import { PDFDocument } from 'pdf-lib';

/**
 * Generic, fully client-side PDF export.
 *
 * Captures any rendered DOM element (passed by ref/node), rasterizes it with
 * html-to-image at high resolution, and lays the snapshot out across as many A4
 * pages as needed using pdf-lib — slicing on whitespace so content is never cut
 * mid-line. No server, no assumptions about the element's content or layout, and
 * RTL/LTR agnostic (direction comes from the element's own CSS).
 *
 * html-to-image clones the node internally before rasterizing, so the live UI
 * is never mutated; callers may still render the source element off-screen (a
 * hidden, laid-out container) so it doesn't take up space.
 */

export interface GeneratePdfOptions {
  /** Download file name. `.pdf` is appended if missing. */
  fileName?: string;
  /** Device-pixel multiplier for a sharp capture (2 = retina, 3 = crisper/heavier). */
  scale?: number;
  /** Canvas/page background; also used to detect safe page-break rows. */
  backgroundColor?: string;
  /** Uniform page margin in PDF points (1pt = 1/72in). Default 0 (edge-to-edge). */
  margin?: number;
  /** Slice pages on near-background rows to avoid cutting content. Default true. */
  smartPageBreaks?: boolean;
}

// A4 in PDF points.
const A4 = { width: 595.28, height: 841.89 };

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = Number.parseInt(h || 'ffffff', 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1] ?? '';
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load captured image'));
    img.src = src;
  });
}

function triggerDownload(bytes: Uint8Array, fileName: string) {
  // Copy into a plain ArrayBuffer so the Blob part type is unambiguous.
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Wait for fonts + every <img> inside the element so nothing captures half-loaded. */
async function waitForAssets(element: HTMLElement): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* non-fatal */
    }
  }

  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    }),
  );

  // Let layout/paint settle before snapshotting.
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export async function generatePDF(
  element: HTMLElement,
  options: GeneratePdfOptions = {},
): Promise<void> {
  if (typeof window === 'undefined') throw new Error('generatePDF must run in the browser');
  if (!element) throw new Error('generatePDF: target element is missing');

  const {
    fileName = 'document.pdf',
    scale = 2,
    backgroundColor = '#ffffff',
    margin = 0,
    smartPageBreaks = true,
  } = options;

  await waitForAssets(element);

  // 1) Rasterize the element (html-to-image clones it, so the UI is untouched).
  const dataUrl = await toPng(element, {
    pixelRatio: scale,
    backgroundColor,
    cacheBust: true,
  });
  const snapshot = await loadImage(dataUrl);

  // 2) Draw onto a master canvas so we can slice it per page.
  const master = document.createElement('canvas');
  master.width = snapshot.width;
  master.height = snapshot.height;
  const mctx = master.getContext('2d');
  if (!mctx) throw new Error('generatePDF: canvas 2D context unavailable');
  mctx.fillStyle = backgroundColor;
  mctx.fillRect(0, 0, master.width, master.height);
  mctx.drawImage(snapshot, 0, 0);

  // 3) Page geometry. Fit the snapshot width to the page content width.
  const contentW = A4.width - margin * 2;
  const contentH = A4.height - margin * 2;
  const pxToPt = contentW / master.width;
  const maxSliceHpx = Math.max(1, Math.floor(contentH / pxToPt));

  // Detect a row that is essentially the background colour (a safe place to cut).
  // Read the whole bitmap ONCE (a single GPU readback) and scan rows in JS — far
  // cheaper than calling getImageData per probed row.
  const bg = hexToRgb(backgroundColor);
  const pixels = smartPageBreaks ? mctx.getImageData(0, 0, master.width, master.height).data : null;
  const rowStride = master.width * 4;
  const colStep = 4 * Math.max(1, Math.floor(master.width / 220));
  const isBackgroundRow = (rowY: number): boolean => {
    if (!pixels) return false;
    const base = rowY * rowStride;
    for (let i = 0; i < rowStride; i += colStep) {
      const o = base + i;
      if (pixels[o + 3] <= 8) continue; // transparent → ignore
      if (
        Math.abs(pixels[o] - bg.r) > 10 ||
        Math.abs(pixels[o + 1] - bg.g) > 10 ||
        Math.abs(pixels[o + 2] - bg.b) > 10
      ) {
        return false;
      }
    }
    return true;
  };

  // 4) Slice into pages.
  const pdf = await PDFDocument.create();
  let y = 0;

  while (y < master.height) {
    let sliceH = Math.min(maxSliceHpx, master.height - y);

    // Walk the bottom edge up to the nearest background row so we don't cut a
    // line of text / part of the chart across the page boundary.
    if (smartPageBreaks && y + sliceH < master.height) {
      const searchWindow = Math.floor(maxSliceHpx * 0.18);
      for (let probe = y + sliceH; probe > y + sliceH - searchWindow && probe > y + 1; probe -= 1) {
        if (isBackgroundRow(probe)) {
          sliceH = probe - y;
          break;
        }
      }
    }

    const slice = document.createElement('canvas');
    slice.width = master.width;
    slice.height = sliceH;
    const sctx = slice.getContext('2d');
    if (!sctx) throw new Error('generatePDF: slice canvas 2D context unavailable');
    sctx.fillStyle = backgroundColor;
    sctx.fillRect(0, 0, slice.width, slice.height);
    sctx.drawImage(master, 0, y, master.width, sliceH, 0, 0, master.width, sliceH);

    const png = await pdf.embedPng(dataUrlToBytes(slice.toDataURL('image/png')));
    const page = pdf.addPage([A4.width, A4.height]);
    const drawH = sliceH * pxToPt;
    page.drawImage(png, {
      x: margin,
      y: A4.height - margin - drawH, // top-aligned within the page
      width: contentW,
      height: drawH,
    });

    y += sliceH;
  }

  const bytes = await pdf.save();
  triggerDownload(bytes, fileName);
}
