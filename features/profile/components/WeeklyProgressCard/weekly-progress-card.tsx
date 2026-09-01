'use client';

import { forwardRef } from 'react';
import type { CardFormat, WeeklyProgressData } from './types';

const C = {
  bg: '#0B1220',
  panel: '#111827',
  primary: '#22C55E',
  primarySoft: 'rgba(34,197,94,0.14)',
  white: '#FFFFFF',
  muted: '#9CA3AF',
  line: 'rgba(255,255,255,0.08)',
  red: '#EF4444',
};

const APP_NAME = 'GymSpot';
const LOGO_URL = '/images/Gymspot-logo.png';

const SIZE: Record<CardFormat, { width: number; height: number }> = {
  portrait: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
};

/** Visual width of the live preview box; the captured node stays full-res behind a CSS scale. */
const PREVIEW_WIDTH = 300;

function fmtRange(startIso: string, endIso: string, isRtl: boolean): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';
  const locale = isRtl ? 'ar-EG' : 'en-GB';
  const short: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
  return `${s.toLocaleDateString(locale, short)} – ${e.toLocaleDateString(locale, { ...short, year: 'numeric' })}`;
}

function fmtShortDate(iso: string, isRtl: boolean): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
}

/** Static (non-interactive) line chart of the whole weigh-in history, built
 * with plain SVG so the card stays a self-contained node for html-to-image
 * capture — same reasoning as the rest of this file's inline styling. */
function buildJourneyChart(
  points: { date: string; weight: number }[],
  goalWeight: number,
  width: number,
  height: number,
) {
  const paddingX = 8;
  const paddingTop = 16;
  const paddingBottom = 28;
  const allWeights = [...points.map((p) => p.weight), ...(goalWeight > 0 ? [goalWeight] : [])];
  const maxW = allWeights.length ? Math.max(...allWeights) + 3 : 100;
  const minW = allWeights.length ? Math.max(0, Math.min(...allWeights) - 3) : 0;
  const rangeY = maxW - minW || 10;

  const coords = points.map((p, i) => ({
    x: points.length > 1 ? paddingX + (i / (points.length - 1)) * (width - 2 * paddingX) : width / 2,
    y: height - paddingBottom - ((p.weight - minW) / rangeY) * (height - paddingTop - paddingBottom),
    weight: p.weight,
    date: p.date,
  }));

  const linePath = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`
    : '';
  const goalY = height - paddingBottom - ((goalWeight - minW) / rangeY) * (height - paddingTop - paddingBottom);

  return { coords, linePath, areaPath, goalY, paddingBottom };
}

export interface WeeklyProgressCardProps {
  data: WeeklyProgressData;
  isRtl: boolean;
  format: CardFormat;
}

/**
 * Branded, fixed-size shareable card rasterized by the image exporter, plus
 * its live scaled-down preview. Card markup is kept inline-styled (not
 * Tailwind) so the capture is self-contained and doesn't depend on the page's
 * CSS cascade — same approach as the sibling `WeightReport`.
 */
export const WeeklyProgressCard = forwardRef<HTMLDivElement, WeeklyProgressCardProps>(
  function WeeklyProgressCard({ data, isRtl, format }, ref) {
    const L = (en: string, ar: string) => (isRtl ? ar : en);
    const kg = L('kg', 'كجم');
    const { width, height } = SIZE[format];
    const previewScale = PREVIEW_WIDTH / width;
    const {
      journeyStart,
      journeyEnd,
      startWeight,
      currentWeight,
      totalChange,
      goalWeight,
      goalMode,
      remainingToGoal,
      goalAchieved,
      userName,
      chartPoints,
    } = data;

    const onTrack = goalMode === 'lose' ? totalChange < 0 : totalChange > 0;
    const changeSign = totalChange > 0 ? '+' : totalChange < 0 ? '−' : '';
    const changeColor = totalChange === 0 ? C.muted : onTrack ? C.primary : C.red;

    const statusMessage = goalAchieved
      ? L('Goal achieved! 🏆', 'تم تحقيق الهدف! 🏆')
      : onTrack
        ? L('Great progress — keep going! 💪', 'تقدم رائع — استمر! 💪')
        : totalChange === 0
          ? L('No change yet', 'لا يوجد تغيير بعد')
          : L('Stay consistent — you can do it!', 'استمر بالالتزام — تقدر على ذلك!');

    const changeLabel = L('Total Change', 'إجمالي التغيير');

    const chartWidth = width - 160;
    const chartHeight = 200;
    const chart = buildJourneyChart(chartPoints, goalWeight, chartWidth, chartHeight);

    return (
      // Live preview — full-resolution card scaled down visually; the ref
      // still targets it at its true 1080px layout size for capture.
      <div
        className="shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-xl"
        style={{ width: PREVIEW_WIDTH, height: height * previewScale }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top left',
          }}
        >
          <div
            ref={ref}
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              boxSizing: 'border-box',
              width,
              height,
              background: `linear-gradient(160deg, ${C.bg} 0%, #0F1B12 100%)`,
              color: C.white,
              padding: 80,
              display: 'flex',
              flexDirection: 'column',
              fontFamily:
                'Geist, "Segoe UI", system-ui, -apple-system, sans-serif',
            }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  direction: 'ltr',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={LOGO_URL} width={56} height={56} alt="GymSpot" style={{ borderRadius: 16 }} />
                  <span style={{ fontSize: 34, fontWeight: 800, color: C.primary }}>{APP_NAME}</span>
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.muted,
                    border: `1px solid ${C.line}`,
                    borderRadius: 999,
                    padding: '10px 20px',
                  }}
                >
                  {fmtRange(journeyStart, journeyEnd, isRtl)}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.muted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {L('Your Journey', 'رحلتك')}
                </div>
                {userName && (
                  <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{userName}</div>
                )}
              </div>

              {/* Hero stat */}
              <div style={{ marginTop: 32, textAlign: isRtl ? 'right' : 'left' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.muted }}>
                  {L('Current Weight', 'الوزن الحالي')}
                </div>
                <div style={{ fontSize: 108, fontWeight: 900, lineHeight: 1.05, marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  {currentWeight.toFixed(1)}
                  <span style={{ fontSize: 38, fontWeight: 800, color: C.muted }}>{kg}</span>
                </div>
              </div>

              {/* Journey chart — the whole weigh-in history, not just the
                  latest week, so the card always shows real progress. */}
              <div
                style={{
                  marginTop: 32,
                  background: C.panel,
                  border: `1px solid ${C.line}`,
                  borderRadius: 28,
                  padding: '20px 20px 12px',
                }}
              >
                <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  {goalWeight > 0 && (
                    <line
                      x1={0}
                      y1={chart.goalY}
                      x2={chartWidth}
                      y2={chart.goalY}
                      stroke={C.primary}
                      strokeWidth={2}
                      strokeDasharray="6 6"
                      opacity={0.5}
                    />
                  )}
                  {chart.coords.length > 1 && (
                    <>
                      <path d={chart.areaPath} fill={C.primarySoft} />
                      <path d={chart.linePath} fill="none" stroke={C.primary} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}
                  {chart.coords.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={i === 0 || i === chart.coords.length - 1 ? 7 : 4}
                      fill={i === chart.coords.length - 1 ? C.primary : C.bg}
                      stroke={C.primary}
                      strokeWidth={3}
                    />
                  ))}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, color: C.muted, fontWeight: 700, marginTop: 4 }}>
                  <span>{fmtShortDate(journeyStart, isRtl)}</span>
                  <span>{fmtShortDate(journeyEnd, isRtl)}</span>
                </div>
              </div>

              {/* Secondary stats */}
              <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>
                <div
                  style={{
                    flex: 1,
                    background: C.panel,
                    border: `1px solid ${C.line}`,
                    borderRadius: 28,
                    padding: '24px 32px',
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {changeLabel}
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: changeColor, marginTop: 8 }}>
                    {changeSign}
                    {Math.abs(totalChange).toFixed(1)} {kg}
                  </div>
                  <div style={{ fontSize: 16, color: C.muted, marginTop: 4 }}>
                    {startWeight.toFixed(1)} {kg} {'→'} {currentWeight.toFixed(1)} {kg}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    background: goalAchieved ? C.primarySoft : C.panel,
                    border: `1px solid ${goalAchieved ? C.primary : C.line}`,
                    borderRadius: 28,
                    padding: '24px 32px',
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {L('To Goal', 'المتبقي للهدف')}
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: goalAchieved ? C.primary : C.white, marginTop: 8 }}>
                    {goalAchieved ? '✓' : remainingToGoal.toFixed(1)} {!goalAchieved && kg}
                  </div>
                  <div style={{ fontSize: 16, color: C.muted, marginTop: 4 }}>
                    {L('Goal', 'الهدف')} {goalWeight.toFixed(1)} {kg}
                  </div>
                </div>
              </div>

              {/* Status message */}
              <div
                style={{
                  marginTop: 24,
                  fontSize: 26,
                  fontWeight: 700,
                  color: onTrack || goalAchieved ? C.primary : C.white,
                }}
              >
                {statusMessage}
              </div>

              {/* Footer */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 28,
                  borderTop: `1px solid ${C.line}`,
                  display: 'flex',
                  direction: 'ltr',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 20, color: C.muted }}>
                  {L('Track your fitness journey on', 'تابع رحلتك الرياضية على')} {APP_NAME}
                </span>
                <span style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{APP_NAME}</span>
              </div>
            </div>
          </div>
        </div>
    );
  },
);
