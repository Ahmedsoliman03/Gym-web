'use client';

import { useTranslations } from 'next-intl';
import { WeightLog } from './types';

interface WeightChartProps {
  logs: WeightLog[];
  points: Array<{ x: number; y: number; weight: number; date: string }>;
  goalWeight: number;
  goalY: number;
  svgWidth: number;
  svgHeight: number;
  paddingX: number;
  paddingY: number;
  maxW: number;
  minW: number;
  linePath: string;
  areaPath: string;
  isRtl: boolean;
  currentWeight: number;
  formatDate: (dateStr: string) => string;
  hoveredIndex: number | null;
  tooltipPos: { x: number; y: number; weight: number; date: string } | null;
  onHoverPoint: (index: number | null, pos: { x: number; y: number; weight: number; date: string } | null) => void;
}

export function WeightChart({
  logs,
  points,
  goalWeight,
  goalY,
  svgWidth,
  svgHeight,
  paddingX,
  paddingY,
  maxW,
  minW,
  linePath,
  areaPath,
  isRtl,
  currentWeight,
  formatDate,
  hoveredIndex,
  tooltipPos,
  onHoverPoint,
}: WeightChartProps) {
  const t = useTranslations('WeightProgress');

  return (
    <div className="relative w-full overflow-hidden bg-black/20 rounded-2xl border border-white/5 p-4 mb-8">
      {/* Graph Title / Current reading */}
      <div className={`absolute top-2 ${isRtl ? 'right-4 text-right' : 'left-4 text-left'} z-10`}>
        <span className="text-[10px] uppercase font-black text-foreground/30 tracking-wider">
          {t('currentWeight')}
        </span>
        <p className="text-2xl font-black text-white -mt-1">
          {currentWeight.toFixed(1)}{' '}
          <span className="text-sm font-bold text-primary">{t('unit')}</span>
        </p>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        height="100%"
        className="overflow-visible select-none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
          </linearGradient>
          <pattern id="gridPattern" width="100" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="100" y2="0" stroke="white" strokeOpacity="0.02" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect x={paddingX} y={paddingY} width={svgWidth - 2 * paddingX} height={svgHeight - 2 * paddingY} fill="url(#gridPattern)" />
        
        {/* Target / Goal Weight Dotted Line */}
        <line
          x1={paddingX}
          y1={goalY}
          x2={svgWidth - paddingX}
          y2={goalY}
          stroke="#22C55E"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeOpacity="0.6"
        />
        <text
          x={isRtl ? paddingX + 10 : svgWidth - paddingX - 10}
          y={goalY - 6}
          fill="#22C55E"
          fontSize="10"
          fontWeight="black"
          textAnchor={isRtl ? "start" : "end"}
          opacity="0.8"
        >
          {t('targetWeight', { weight: goalWeight })}
        </text>

        {/* Chart line and Area fill */}
        {logs.length > 1 && (
          <>
            <path d={areaPath} fill="url(#chartGradient)" />
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_4px_10px_rgba(34,197,94,0.3)]"
            />
          </>
        )}

        {/* X Axis Date Labels */}
        {points.map((p, i) => {
          const showLabel = points.length <= 6 || i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2);
          if (!showLabel) return null;
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={svgHeight - paddingY + 16}
              fill="currentColor"
              fontSize="9"
              fontWeight="bold"
              className="text-foreground/40"
              textAnchor="middle"
            >
              {formatDate(p.date)}
            </text>
          );
        })}

        {/* Y Axis min/max text helpers */}
        <text x={paddingX - 10} y={paddingY + 4} fill="currentColor" fontSize="9" fontWeight="bold" className="text-foreground/30" textAnchor="end">
          {maxW.toFixed(0)}
        </text>
        <text x={paddingX - 10} y={svgHeight - paddingY} fill="currentColor" fontSize="9" fontWeight="bold" className="text-foreground/30" textAnchor="end">
          {minW.toFixed(0)}
        </text>

        {/* Data points & Interactive Hover targets */}
        {points.map((p, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <g key={`point-${i}`}>
              {isHovered && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="10"
                  fill="var(--primary)"
                  opacity="0.3"
                  className="animate-ping"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? "6" : "4"}
                fill={isHovered ? "#22C55E" : "#161B2B"}
                stroke="var(--primary)"
                strokeWidth={isHovered ? "3.5" : "2"}
                className="transition-all duration-200"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="16"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => onHoverPoint(i, { x: p.x, y: p.y, weight: p.weight, date: p.date })}
                onMouseLeave={() => onHoverPoint(null, null)}
                onClick={() => onHoverPoint(isHovered ? null : i, isHovered ? null : { x: p.x, y: p.y, weight: p.weight, date: p.date })}
              />
            </g>
          );
        })}
      </svg>

      {/* HTML Tooltip — positioned over the hovered dot. For points near the top
          we flip it *below* the dot so the box isn't clipped by the container's
          overflow-hidden (which is what cut off the highest point's tooltip). */}
      {tooltipPos && (() => {
        const leftPct = (tooltipPos.x / svgWidth) * 100;
        const topPct = (tooltipPos.y / svgHeight) * 100;
        const below = topPct < 28;
        return (
          <div
            className="absolute z-20 pointer-events-none bg-surface border border-white/10 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-0.5 text-center transition-all duration-200"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              transform: `translateX(-50%) translateY(${below ? '16px' : 'calc(-100% - 14px)'})`,
            }}
          >
            {below && (
              <div className="w-1.5 h-1.5 bg-surface border-l border-t border-white/10 rotate-45 mb-[-1px]" />
            )}
            <span className="text-[10px] text-foreground/50 font-bold whitespace-nowrap">
              {formatDate(tooltipPos.date)}
            </span>
            <span className="text-xs font-black text-white whitespace-nowrap">
              {tooltipPos.weight.toFixed(1)} {t('unit')}
            </span>
            {!below && (
              <div className="w-1.5 h-1.5 bg-surface border-r border-b border-white/10 rotate-45 mt-[-1px]" />
            )}
          </div>
        );
      })()}
    </div>
  );
}
