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
      weekStart,
      weekEnd,
      startWeight,
      currentWeight,
      weeklyChange,
      goalWeight,
      goalMode,
      remainingToGoal,
      goalAchieved,
      userName,
    } = data;

    const onTrack = goalMode === 'lose' ? weeklyChange < 0 : weeklyChange > 0;
    const changeSign = weeklyChange > 0 ? '+' : weeklyChange < 0 ? '−' : '';
    const changeColor = weeklyChange === 0 ? C.muted : onTrack ? C.primary : C.red;

    const statusMessage = goalAchieved
      ? L('Goal achieved! 🏆', 'تم تحقيق الهدف! 🏆')
      : onTrack
        ? L('Great progress — keep going! 💪', 'تقدم رائع — استمر! 💪')
        : weeklyChange === 0
          ? L('No change this week', 'لا يوجد تغيير هذا الأسبوع')
          : L('Stay consistent — you can do it!', 'استمر بالالتزام — تقدر على ذلك!');

    const changeLabel = L('This week', 'هذا الأسبوع');

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
                  {fmtRange(weekStart, weekEnd, isRtl)}
                </div>
              </div>

              {/* Title */}
              <div style={{ marginTop: 56 }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: C.muted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {L('Weekly Progress', 'التقدم الأسبوعي')}
                </div>
                {userName && (
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>{userName}</div>
                )}
              </div>

              {/* Hero stat */}
              <div style={{ marginTop: 48, textAlign: isRtl ? 'right' : 'left' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.muted }}>
                  {L('Current Weight', 'الوزن الحالي')}
                </div>
                <div style={{ fontSize: 148, fontWeight: 900, lineHeight: 1.05, marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  {currentWeight.toFixed(1)}
                  <span style={{ fontSize: 44, fontWeight: 800, color: C.muted }}>{kg}</span>
                </div>
              </div>

              {/* Secondary stats */}
              <div style={{ display: 'flex', gap: 24, marginTop: 56 }}>
                <div
                  style={{
                    flex: 1,
                    background: C.panel,
                    border: `1px solid ${C.line}`,
                    borderRadius: 28,
                    padding: '32px 36px',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {changeLabel}
                  </div>
                  <div style={{ fontSize: 56, fontWeight: 900, color: changeColor, marginTop: 10 }}>
                    {changeSign}
                    {Math.abs(weeklyChange).toFixed(1)} {kg}
                  </div>
                  <div style={{ fontSize: 18, color: C.muted, marginTop: 4 }}>
                    {startWeight.toFixed(1)} {kg} {'→'} {currentWeight.toFixed(1)} {kg}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    background: goalAchieved ? C.primarySoft : C.panel,
                    border: `1px solid ${goalAchieved ? C.primary : C.line}`,
                    borderRadius: 28,
                    padding: '32px 36px',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {L('To Goal', 'المتبقي للهدف')}
                  </div>
                  <div style={{ fontSize: 56, fontWeight: 900, color: goalAchieved ? C.primary : C.white, marginTop: 10 }}>
                    {goalAchieved ? '✓' : remainingToGoal.toFixed(1)} {!goalAchieved && kg}
                  </div>
                  <div style={{ fontSize: 18, color: C.muted, marginTop: 4 }}>
                    {L('Goal', 'الهدف')} {goalWeight.toFixed(1)} {kg}
                  </div>
                </div>
              </div>

              {/* Status message */}
              <div
                style={{
                  marginTop: 40,
                  fontSize: 30,
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
                  paddingTop: 40,
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
