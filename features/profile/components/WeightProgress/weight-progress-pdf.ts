import { jsPDF } from 'jspdf';
import type { GoalMode, WeightLog } from './types';

export interface WeightProgressPdfData {
  logs: WeightLog[];
  goalWeight: number;
  goalMode: GoalMode;
  initialWeight: number;
  currentWeight: number;
  /** Total kg lost (lose mode) or gained (gain mode); already sign-normalized. */
  weightDifference: number;
  isGoalAchieved: boolean;
  /** Optional owner name for the report header. */
  userName?: string;
}

const COLORS = {
  primary: [34, 197, 94] as const, // emerald-500
  dark: [17, 24, 39] as const,
  grayText: [107, 114, 128] as const,
  line: [229, 231, 235] as const,
  goal: [245, 158, 11] as const, // amber-500
};

const LOGO_URL = '/images/Gymspot-logo.png';
const APP_NAME = 'GymSpot';

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Fetch an app asset and return it as a data URL for jsPDF.addImage. Returns
 *  null (so the report still renders without the logo) if the asset can't load. */
async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Draw the weight line chart (logs + goal line) into the given PDF rectangle. */
function drawChart(
  doc: jsPDF,
  data: WeightProgressPdfData,
  box: { x: number; y: number; w: number; h: number },
) {
  const { logs, goalWeight } = data;
  const weights = [...logs.map((l) => l.weight), goalWeight].filter((n) => n > 0);
  const maxW = weights.length ? Math.max(...weights) + 2 : 100;
  const minW = weights.length ? Math.max(0, Math.min(...weights) - 2) : 0;
  const range = maxW - minW || 1;

  const toX = (i: number) =>
    logs.length > 1 ? box.x + (i / (logs.length - 1)) * box.w : box.x + box.w / 2;
  const toY = (w: number) => box.y + box.h - ((w - minW) / range) * box.h;

  // Frame
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.rect(box.x, box.y, box.w, box.h);

  // Goal line (dashed amber)
  if (goalWeight > 0) {
    const gy = toY(goalWeight);
    doc.setDrawColor(...COLORS.goal);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(box.x, gy, box.x + box.w, gy);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.goal);
    doc.text(`Goal ${goalWeight}kg`, box.x + box.w - 2, gy - 1.5, { align: 'right' });
  }

  // Progress line + points
  if (logs.length) {
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    logs.forEach((log, i) => {
      const x = toX(i);
      const y = toY(log.weight);
      if (i > 0) {
        const px = toX(i - 1);
        const py = toY(logs[i - 1].weight);
        doc.line(px, py, x, y);
      }
      doc.setFillColor(...COLORS.primary);
      doc.circle(x, y, 1, 'F');
    });
  }
}

export async function downloadWeightProgressPdf(data: WeightProgressPdfData) {
  const { logs, goalWeight, goalMode, initialWeight, currentWeight, weightDifference, isGoalAchieved } =
    data;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  // Document metadata — the browser PDF viewer shows `title` in the tab.
  doc.setProperties({
    title: 'GymSpot Analytics',
    subject: 'Body Analytics Report',
    author: APP_NAME,
    creator: APP_NAME,
    keywords: 'gymspot, body analytics, weight progress',
  });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 16;

  // Brand header: logo + app name.
  const logo = await loadImageDataUrl(LOGO_URL);
  const logoSize = 13;
  if (logo) {
    doc.addImage(logo, 'PNG', marginX, 12, logoSize, logoSize);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  doc.text(APP_NAME, marginX + (logo ? logoSize + 3 : 0), 21);

  let y = 36;

  // Report title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.dark);
  doc.text('Body Analytics Report', marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.grayText);
  y += 7;
  if (data.userName) {
    doc.text(data.userName, marginX, y);
    y += 5;
  }
  doc.text(`Generated ${fmtDate(new Date().toISOString())}`, marginX, y);

  // Achieved badge (aligned with the report title row)
  if (isGoalAchieved) {
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(pageW - marginX - 40, 30, 40, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('GOAL ACHIEVED', pageW - marginX - 20, 35.7, { align: 'center' });
  }

  // Summary stat cards
  y += 10;
  const goalLabel = goalMode === 'lose' ? 'Cutting (Lose)' : 'Bulking (Gain)';
  const diffLabel = goalMode === 'lose' ? 'Total Lost' : 'Total Gained';
  const diffValue = `${weightDifference > 0 ? (goalMode === 'lose' ? '-' : '+') : ''}${weightDifference.toFixed(1)} kg`;
  const remaining =
    goalMode === 'lose'
      ? Math.max(0, currentWeight - goalWeight)
      : Math.max(0, goalWeight - currentWeight);

  const cards: Array<[string, string]> = [
    ['Goal', `${goalLabel}`],
    ['Target Weight', `${goalWeight} kg`],
    ['Starting Weight', `${initialWeight || '—'}${initialWeight ? ' kg' : ''}`],
    ['Current Weight', `${currentWeight || '—'}${currentWeight ? ' kg' : ''}`],
    [diffLabel, diffValue],
    ['To Goal', `${remaining.toFixed(1)} kg`],
  ];

  const cardW = (pageW - marginX * 2 - 10) / 3;
  const cardH = 18;
  cards.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = marginX + col * (cardW + 5);
    const cy = y + row * (cardH + 5);
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, cy, cardW, cardH, 2, 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.grayText);
    doc.text(label.toUpperCase(), cx + 4, cy + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.dark);
    doc.text(value, cx + 4, cy + 13);
  });
  y += cardH * 2 + 5 + 10;

  // Chart
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.dark);
  doc.text('Progress Chart', marginX, y);
  y += 4;
  drawChart(doc, data, { x: marginX, y, w: pageW - marginX * 2, h: 55 });
  y += 55 + 12;

  // Log history table (the chart's underlying detail)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.dark);
  doc.text('Log Details', marginX, y);
  y += 6;

  const cols = [marginX, marginX + 12, marginX + 70, marginX + 120];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.grayText);
  doc.text('#', cols[0], y);
  doc.text('Date', cols[1], y);
  doc.text('Weight', cols[2], y);
  doc.text('Change', cols[3], y);
  y += 2;
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.dark);
  const pageH = doc.internal.pageSize.getHeight();
  logs.forEach((log, i) => {
    if (y > pageH - 15) {
      doc.addPage();
      y = 20;
    }
    const prev = i > 0 ? logs[i - 1].weight : null;
    const delta = prev === null ? 0 : log.weight - prev;
    const changeStr = prev === null ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg`;
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);
    doc.text(String(i + 1), cols[0], y);
    doc.text(fmtDate(log.date), cols[1], y);
    doc.text(`${log.weight} kg`, cols[2], y);
    if (delta < 0) doc.setTextColor(...COLORS.primary);
    else if (delta > 0) doc.setTextColor(239, 68, 68);
    else doc.setTextColor(...COLORS.grayText);
    doc.text(changeStr, cols[3], y);
    y += 6;
  });

  if (!logs.length) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.grayText);
    doc.text('No weight logs recorded yet.', marginX, y);
  }

  doc.save('gymspot-analytics.pdf');
}
