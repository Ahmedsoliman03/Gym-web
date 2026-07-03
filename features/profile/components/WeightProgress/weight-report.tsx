'use client';

import { forwardRef, memo } from 'react';
import type { GoalMode, WeightLog } from './types';

export interface WeightReportData {
  logs: WeightLog[];
  goalWeight: number;
  goalMode: GoalMode;
  initialWeight: number;
  currentWeight: number;
  /** Total kg lost (lose) or gained (gain); already sign-normalized. */
  weightDifference: number;
  isGoalAchieved: boolean;
  userName?: string;
}

interface WeightReportProps {
  data: WeightReportData;
  isRtl: boolean;
}

const C = {
  primary: '#22C55E',
  dark: '#111827',
  gray: '#6B7280',
  line: '#E5E7EB',
  goal: '#F59E0B',
  red: '#EF4444',
  soft: '#F9FAFB',
};

const APP_NAME = 'GymSpot';
const LOGO_URL = '/images/Gymspot-logo.png';

const fmtDate = (iso: string, isRtl: boolean) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(isRtl ? 'ar-EG' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

/** Inline SVG line chart — kept LTR (time reads oldest → newest) in both languages. */
function Chart({
  data,
  kg,
  goalLabel,
  isRtl,
}: {
  data: WeightReportData;
  kg: string;
  goalLabel: string;
  isRtl: boolean;
}) {
  const { logs, goalWeight } = data;
  const W = 714;
  const H = 240;
  const pX = 44;
  const pY = 28;

  const weights = [...logs.map((l) => l.weight), goalWeight].filter((n) => n > 0);
  const maxW = weights.length ? Math.max(...weights) + 2 : 100;
  const minW = weights.length ? Math.max(0, Math.min(...weights) - 2) : 0;
  const range = maxW - minW || 1;

  const toX = (i: number) => (logs.length > 1 ? pX + (i / (logs.length - 1)) * (W - 2 * pX) : W / 2);
  const toY = (w: number) => H - pY - ((w - minW) / range) * (H - 2 * pY);

  const pts = logs.map((l, i) => ({ x: toX(i), y: toY(l.weight), d: l.date }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = pts.length
    ? `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${H - pY} L ${pts[0].x.toFixed(1)} ${H - pY} Z`
    : '';
  const goalY = toY(goalWeight);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="wr-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.primary} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={pX} y={pY} width={W - 2 * pX} height={H - 2 * pY} fill="none" stroke={C.line} strokeWidth="1" />
      <text x={pX - 8} y={pY + 4} fill={C.gray} fontSize="10" textAnchor="end">
        {maxW.toFixed(0)}
      </text>
      <text x={pX - 8} y={H - pY} fill={C.gray} fontSize="10" textAnchor="end">
        {minW.toFixed(0)}
      </text>

      {goalWeight > 0 && (
        <>
          <line x1={pX} y1={goalY} x2={W - pX} y2={goalY} stroke={C.goal} strokeWidth="1.5" strokeDasharray="5 4" />
          <text x={W - pX - 4} y={goalY - 5} fill={C.goal} fontSize="11" fontWeight="700" textAnchor="end">
            {goalLabel}
          </text>
        </>
      )}

      {pts.length > 1 && <path d={area} fill="url(#wr-grad)" />}
      {pts.length > 1 && (
        <path d={line} fill="none" stroke={C.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke={C.primary} strokeWidth="2.5" />
      ))}

      {pts.map((p, i) => {
        const show = pts.length <= 6 || i === 0 || i === pts.length - 1 || i === Math.floor(pts.length / 2);
        if (!show) return null;
        return (
          <text key={`d-${i}`} x={p.x} y={H - pY + 14} fill={C.gray} fontSize="10" textAnchor="middle">
            {fmtDate(p.d, isRtl)}
          </text>
        );
      })}
      {/* unit kept off the chart axis for clarity */}
      <text x={W / 2} y={H - 2} fill={C.gray} fontSize="9" textAnchor="middle">
        {kg}
      </text>
    </svg>
  );
}

/**
 * Off-screen report rendered as real DOM so the browser handles Arabic shaping,
 * RTL direction and spacing. A parent keeps it in a hidden, laid-out container
 * and hands its ref to the generic `generatePDF` exporter.
 */
const WeightReportBase = forwardRef<HTMLDivElement, WeightReportProps>(function WeightReport(
  { data, isRtl },
  ref,
) {
  const L = (en: string, ar: string) => (isRtl ? ar : en);
  const { goalWeight, goalMode, initialWeight, currentWeight, weightDifference, logs } = data;
  const kg = L('kg', 'كجم');
  const align = isRtl ? 'right' : 'left';

  const remaining =
    goalMode === 'lose' ? Math.max(0, currentWeight - goalWeight) : Math.max(0, goalWeight - currentWeight);
  const diffSign = weightDifference > 0 ? (goalMode === 'lose' ? '-' : '+') : '';

  const cards: Array<[string, string]> = [
    [L('Goal', 'الهدف'), goalMode === 'lose' ? L('Cutting (Lose)', 'تنشيف (خسارة)') : L('Bulking (Gain)', 'تضخيم (زيادة)')],
    [L('Target Weight', 'الوزن المستهدف'), `${goalWeight} ${kg}`],
    [L('Starting Weight', 'وزن البداية'), initialWeight ? `${initialWeight} ${kg}` : '—'],
    [L('Current Weight', 'الوزن الحالي'), currentWeight ? `${currentWeight} ${kg}` : '—'],
    [
      goalMode === 'lose' ? L('Total Lost', 'إجمالي المفقود') : L('Total Gained', 'إجمالي المكتسب'),
      `${diffSign}${weightDifference.toFixed(1)} ${kg}`,
    ],
    [L('To Goal', 'المتبقي للهدف'), `${remaining.toFixed(1)} ${kg}`],
  ];

  return (
    <div
      ref={ref}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        boxSizing: 'border-box',
        width: 794,
        background: '#fff',
        color: C.dark,
        padding: 40,
        textAlign: align,
      }}
    >
      {/* Brand header — logo + name always pinned left, even in RTL */}
      <div
        style={{
          display: 'flex',
          direction: 'ltr',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 10,
          marginBottom: 26,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} width={34} height={34} alt="GymSpot" style={{ borderRadius: 8 }} />
        <span style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>{APP_NAME}</span>
      </div>

      {/* Title + achieved badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.dark }}>
            {L('Body Analytics Report', 'تقرير تحليلات الجسم')}
          </div>
          {data.userName && (
            <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>{data.userName}</div>
          )}
          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
            {L('Generated', 'تاريخ الإنشاء')}: {fmtDate(new Date().toISOString(), isRtl)}
          </div>
        </div>
        {data.isGoalAchieved && (
          <div
            style={{
              background: C.primary,
              color: '#fff',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: '.05em',
              padding: '7px 14px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
            }}
          >
            ✓ {L('GOAL ACHIEVED', 'تم تحقيق الهدف')}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '22px 0 28px' }}>
        {cards.map(([label, value]) => (
          <div
            key={label}
            style={{
              flex: '1 1 30%',
              minWidth: 150,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: '12px 14px',
              background: C.soft,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: C.gray,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.dark, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        {L('Progress Chart', 'مخطط التقدم')}
      </div>
      <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 14, marginBottom: 28 }}>
        <Chart
          data={data}
          kg={kg}
          isRtl={isRtl}
          goalLabel={L(`Goal ${goalWeight}kg`, `الهدف ${goalWeight} كجم`)}
        />
      </div>

      {/* Log table */}
      <div style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 8 }}>
        {L('Log Details', 'تفاصيل السجل')}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: align }}>
        <thead>
          <tr style={{ color: C.gray, textTransform: 'uppercase', fontSize: 11, letterSpacing: '.04em' }}>
            <th style={{ padding: '7px 10px', borderBottom: `2px solid ${C.line}`, textAlign: align }}>#</th>
            <th style={{ padding: '7px 10px', borderBottom: `2px solid ${C.line}`, textAlign: align }}>
              {L('Date', 'التاريخ')}
            </th>
            <th style={{ padding: '7px 10px', borderBottom: `2px solid ${C.line}`, textAlign: align }}>
              {L('Weight', 'الوزن')}
            </th>
            <th style={{ padding: '7px 10px', borderBottom: `2px solid ${C.line}`, textAlign: align }}>
              {L('Change', 'التغير')}
            </th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '14px 10px', color: C.gray, textAlign: 'center' }}>
                {L('No weight logs recorded yet.', 'لا توجد سجلات وزن بعد.')}
              </td>
            </tr>
          ) : (
            logs.map((log, i) => {
              const prev = i > 0 ? logs[i - 1].weight : null;
              const delta = prev === null ? 0 : log.weight - prev;
              const changeStr = prev === null ? '—' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} ${kg}`;
              const color = delta < 0 ? C.primary : delta > 0 ? C.red : C.gray;
              return (
                <tr key={log.id}>
                  <td style={{ padding: '7px 10px', color: C.gray, borderBottom: `1px solid ${C.line}` }}>{i + 1}</td>
                  <td style={{ padding: '7px 10px', color: C.dark, borderBottom: `1px solid ${C.line}` }}>
                    {fmtDate(log.date, isRtl)}
                  </td>
                  <td style={{ padding: '7px 10px', color: C.dark, fontWeight: 700, borderBottom: `1px solid ${C.line}` }}>
                    {log.weight} {kg}
                  </td>
                  <td style={{ padding: '7px 10px', color, fontWeight: 700, borderBottom: `1px solid ${C.line}` }}>
                    {changeStr}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});

// Memoized: with stable (memoized) props it won't re-render while the parent
// updates on chart hover / input typing.
export const WeightReport = memo(WeightReportBase);
