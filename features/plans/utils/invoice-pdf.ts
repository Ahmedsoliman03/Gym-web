import { jsPDF } from 'jspdf';
import type { Invoice } from '../types';

/** Brand constants used in the printed invoice header/footer. */
const BRAND = {
  name: 'GymSpot',
  logoSrc: '/images/Gymspot-logo.png',
  site: 'gymspot.com',
};

const CURRENCY = 'EGP';

// Palette (RGB) — mirrors the app's green primary on a light document.
const COLOR = {
  primary: [34, 197, 94] as [number, number, number],
  ink: [17, 24, 39] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  line: [229, 231, 235] as [number, number, number],
};

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/** Fetch a same-origin image and return it as a data URL with its pixel size. */
async function loadImage(src: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const size = await new Promise<{ width: number; height: number }>(
      (resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = dataUrl;
      },
    );
    return { dataUrl, ...size };
  } catch {
    return null;
  }
}

const money = (raw: string | number) => {
  const n = Number(raw);
  return `${Number.isFinite(n) ? n.toFixed(2) : raw} ${CURRENCY}`;
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/** Build and trigger a download of a single-page PDF invoice. */
export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  // Document metadata — the browser PDF viewer shows `title` in the tab.
  doc.setProperties({
    title: `GymSpot Invoice #${invoice.id}`,
    subject: 'GymSpot Invoice',
    author: BRAND.name,
    creator: BRAND.name,
    keywords: 'gymspot, invoice, subscription',
  });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 56;

  // ── Header: logo + brand on the left, INVOICE title on the right ──────────
  const logo = await loadImage(BRAND.logoSrc);
  if (logo && logo.width > 0) {
    const logoH = 40;
    const logoW = (logo.width / logo.height) * logoH;
    doc.addImage(logo.dataUrl, 'PNG', marginX, y - 28, logoW, logoH);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...COLOR.primary);
    doc.text(BRAND.name, marginX, y);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLOR.ink);
  doc.text('GYMSPOT INVOICE', pageW - marginX, y - 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.muted);
  doc.text(`#${invoice.id}`, pageW - marginX, y + 10, { align: 'right' });

  y += 44;
  doc.setDrawColor(...COLOR.line);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageW - marginX, y);
  y += 28;

  // ── Meta block: dates + status ────────────────────────────────────────────
  const sub = invoice.subscription_details;
  const labelVal = (label: string, value: string, x: number, top: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR.muted);
    doc.text(label.toUpperCase(), x, top);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...COLOR.ink);
    doc.text(value, x, top + 15);
  };

  const colR = pageW / 2 + 20;
  labelVal('Issued', formatDate(invoice.created_at), marginX, y);
  labelVal('Status', invoice.status, colR, y);
  y += 42;
  labelVal('Billing period', `${formatDate(sub?.start_date)}  –  ${formatDate(sub?.end_date)}`, marginX, y);
  labelVal('Payment method', invoice.payment_method ?? '—', colR, y);
  y += 46;

  // ── Plan / line-items table ───────────────────────────────────────────────
  doc.setFillColor(...COLOR.primary);
  doc.rect(marginX, y, pageW - marginX * 2, 26, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION', marginX + 12, y + 17);
  doc.text('AMOUNT', pageW - marginX - 12, y + 17, { align: 'right' });
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  rows.forEach(([desc, amount]) => {
    const rowH = 28;
    doc.setTextColor(...COLOR.ink);
    doc.text(desc, marginX + 12, y + 18);
    doc.text(amount, pageW - marginX - 12, y + 18, { align: 'right' });
    y += rowH;
    doc.setDrawColor(...COLOR.line);
    doc.line(marginX, y, pageW - marginX, y);
  });

  // ── Total ─────────────────────────────────────────────────────────────────
  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR.ink);
  doc.text('Total paid', pageW - marginX - 160, y, { align: 'left' });
  doc.setTextColor(...COLOR.primary);
  doc.text(money(invoice.amount_paid), pageW - marginX - 12, y, {
    align: 'right',
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 48;
  doc.setDrawColor(...COLOR.line);
  doc.line(marginX, footerY - 16, pageW - marginX, footerY - 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLOR.muted);
  doc.text(
    `Thank you for choosing ${BRAND.name}.`,
    marginX,
    footerY,
  );
  doc.text(BRAND.site, pageW - marginX, footerY, { align: 'right' });

  // Filename: gymspot-invoice-<download date>.pdf (e.g. gymspot-invoice-2026-06-27.pdf)
  const downloadDate = new Date().toISOString().slice(0, 10);
  doc.save(`gymspot-invoice-${downloadDate}.pdf`);
}
