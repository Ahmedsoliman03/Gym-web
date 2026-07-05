import type { Invoice } from '../types';

/** Brand constants used in the printed invoice header/footer. */
const BRAND = {
  name: 'GymSpot',
  logoSrc: '/images/Gymspot-logo.png',
  site: 'gymspot.com',
};

const CURRENCY = 'EGP';

// Palette (0–1 RGB for pdf-lib) — mirrors the app's green primary on a light document.
const COLOR = {
  primary: [34 / 255, 197 / 255, 94 / 255] as [number, number, number],
  ink: [17 / 255, 24 / 255, 39 / 255] as [number, number, number],
  muted: [107 / 255, 114 / 255, 128 / 255] as [number, number, number],
  line: [229 / 255, 231 / 255, 235 / 255] as [number, number, number],
  white: [1, 1, 1] as [number, number, number],
};

// A4 in PDF points (1pt = 1/72in).
const PAGE = { width: 595.28, height: 841.89 };

/** Fetch a same-origin PNG and return its raw bytes (pdf-lib embeds from bytes). */
async function loadPngBytes(src: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}

const money = (raw: string | number) => {
  const n = Number(raw);
  return `${Number.isFinite(n) ? n.toFixed(2) : raw} ${CURRENCY}`;
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Keep text inside the StandardFont (WinAnsi) encodable range so pdf-lib never
 * throws on an unexpected character coming from the invoice payload.
 */
const safe = (t: string | number | null | undefined) =>
  String(t ?? '')
    .replace(/[—–]/g, '-')
    .replace(/[^\x20-\xFF]/g, '');

/** Build and trigger a download of a single-page PDF invoice. */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  // Heavy PDF engine is loaded only when the user actually clicks download —
  // keeps pdf-lib (~110 KB gz) out of the invoice modal's initial chunk.
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const doc = await PDFDocument.create();
  // Metadata — the browser PDF viewer shows `title` in the tab.
  doc.setTitle(`GymSpot Invoice #${invoice.id}`);
  doc.setSubject('GymSpot Invoice');
  doc.setAuthor(BRAND.name);
  doc.setCreator(BRAND.name);
  doc.setKeywords(['gymspot', 'invoice', 'subscription']);

  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE.width, PAGE.height]);

  const col = (c: [number, number, number]) => rgb(c[0], c[1], c[2]);
  // pdf-lib's origin is bottom-left; the layout below is authored top-down, so
  // convert a "distance from the top of the page" into a pdf-lib y coordinate.
  const T = (top: number) => PAGE.height - top;

  const drawLeft = (
    text: string,
    x: number,
    top: number,
    size: number,
    font: typeof helv,
    color: [number, number, number],
  ) => page.drawText(safe(text), { x, y: T(top), size, font, color: col(color) });

  const drawRight = (
    text: string,
    xRight: number,
    top: number,
    size: number,
    font: typeof helv,
    color: [number, number, number],
  ) => {
    const s = safe(text);
    const w = font.widthOfTextAtSize(s, size);
    page.drawText(s, { x: xRight - w, y: T(top), size, font, color: col(color) });
  };

  const marginX = 48;
  let y = 56;

  // ── Header: logo + brand on the left, INVOICE title on the right ──────────
  const logoBytes = await loadPngBytes(BRAND.logoSrc);
  let logoDrawn = false;
  if (logoBytes) {
    try {
      const logo = await doc.embedPng(logoBytes);
      const logoH = 40;
      const logoW = (logo.width / logo.height) * logoH;
      page.drawImage(logo, { x: marginX, y: T(y - 28) - logoH, width: logoW, height: logoH });
      logoDrawn = true;
    } catch {
      /* fall back to the wordmark below */
    }
  }
  if (!logoDrawn) {
    drawLeft(BRAND.name, marginX, y, 20, helvBold, COLOR.primary);
  }

  drawRight('GYMSPOT INVOICE', PAGE.width - marginX, y - 6, 22, helvBold, COLOR.ink);
  drawRight(`#${invoice.id}`, PAGE.width - marginX, y + 10, 9, helv, COLOR.muted);

  y += 44;
  page.drawLine({
    start: { x: marginX, y: T(y) },
    end: { x: PAGE.width - marginX, y: T(y) },
    thickness: 1,
    color: col(COLOR.line),
  });
  y += 28;

  // ── Meta block: dates + status ────────────────────────────────────────────
  const sub = invoice.subscription_details;
  const labelVal = (label: string, value: string, x: number, top: number) => {
    drawLeft(label.toUpperCase(), x, top, 8, helvBold, COLOR.muted);
    drawLeft(value, x, top + 15, 11, helv, COLOR.ink);
  };

  const colR = PAGE.width / 2 + 20;
  labelVal('Issued', formatDate(invoice.created_at), marginX, y);
  labelVal('Status', invoice.status, colR, y);
  y += 42;
  labelVal('Billing period', `${formatDate(sub?.start_date)}  -  ${formatDate(sub?.end_date)}`, marginX, y);
  labelVal('Payment method', invoice.payment_method ?? '-', colR, y);
  y += 46;

  // ── Plan / line-items table ───────────────────────────────────────────────
  page.drawRectangle({
    x: marginX,
    y: T(y + 26),
    width: PAGE.width - marginX * 2,
    height: 26,
    color: col(COLOR.primary),
  });
  drawLeft('DESCRIPTION', marginX + 12, y + 17, 9, helvBold, COLOR.white);
  drawRight('AMOUNT', PAGE.width - marginX - 12, y + 17, 9, helvBold, COLOR.white);
  y += 26;

  const rows: Array<[string, string]> = [
    [`${sub?.plan?.name ?? 'Subscription'} plan`, money(invoice.plan_price)],
  ];
  if (Number(invoice.prorated_discount) > 0) {
    rows.push(['Prorated discount', `- ${money(invoice.prorated_discount)}`]);
  }
  if (Number(invoice.referral_discount) > 0) {
    rows.push(['Referral discount', `- ${money(invoice.referral_discount)}`]);
  }

  rows.forEach(([desc, amount]) => {
    const rowH = 28;
    drawLeft(desc, marginX + 12, y + 18, 11, helv, COLOR.ink);
    drawRight(amount, PAGE.width - marginX - 12, y + 18, 11, helv, COLOR.ink);
    y += rowH;
    page.drawLine({
      start: { x: marginX, y: T(y) },
      end: { x: PAGE.width - marginX, y: T(y) },
      thickness: 1,
      color: col(COLOR.line),
    });
  });

  // ── Total ─────────────────────────────────────────────────────────────────
  y += 22;
  drawLeft('Total paid', PAGE.width - marginX - 160, y, 13, helvBold, COLOR.ink);
  drawRight(money(invoice.amount_paid), PAGE.width - marginX - 12, y, 13, helvBold, COLOR.primary);

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = PAGE.height - 48;
  page.drawLine({
    start: { x: marginX, y: T(footerY - 16) },
    end: { x: PAGE.width - marginX, y: T(footerY - 16) },
    thickness: 1,
    color: col(COLOR.line),
  });
  drawLeft(`Thank you for choosing ${BRAND.name}.`, marginX, footerY, 9, helv, COLOR.muted);
  drawRight(BRAND.site, PAGE.width - marginX, footerY, 9, helv, COLOR.muted);

  // ── Save + trigger download ───────────────────────────────────────────────
  const bytes = await doc.save();
  // Copy into a plain ArrayBuffer so the Blob part type is unambiguous.
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // Filename: gymspot-invoice-<download date>.pdf (e.g. gymspot-invoice-2026-06-27.pdf)
  const downloadDate = new Date().toISOString().slice(0, 10);
  a.download = `gymspot-invoice-${downloadDate}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
