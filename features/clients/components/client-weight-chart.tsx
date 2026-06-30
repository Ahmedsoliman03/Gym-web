"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import {
  Award,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  LineChart,
  Trophy,
} from "lucide-react";
import { WeightChart } from "@/features/profile/components/WeightProgress/weight-chart";
import type { ClientWeightTracker } from "../types";

type TooltipPos = { x: number; y: number; weight: number; date: string } | null;

// Chart canvas geometry — mirrors the profile WeightProgress chart so the
// read-only client view looks identical to the client's own dashboard.
const SVG_WIDTH = 550;
const SVG_HEIGHT = 240;
const PADDING_X = 45;
const PADDING_Y = 35;

interface ClientWeightChartProps {
  tracker: ClientWeightTracker;
}

export function ClientWeightChart({ tracker }: ClientWeightChartProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  const { logs, goalMode, goalAchieved } = tracker;
  const goalWeight = tracker.goalWeight ?? 0;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPos>(null);

  const chart = useMemo(() => {
    const allWeights = [...logs.map((l) => l.weight), goalWeight].filter((w) => w > 0);
    const maxW = allWeights.length ? Math.max(...allWeights) + 3 : 100;
    const minW = allWeights.length ? Math.max(0, Math.min(...allWeights) - 3) : 50;
    const rangeY = maxW - minW || 10;

    const points = logs.map((log, index) => {
      const x =
        logs.length > 1
          ? PADDING_X + (index / (logs.length - 1)) * (SVG_WIDTH - 2 * PADDING_X)
          : SVG_WIDTH / 2;
      const y =
        SVG_HEIGHT - PADDING_Y - ((log.weight - minW) / rangeY) * (SVG_HEIGHT - 2 * PADDING_Y);
      return { x, y, weight: log.weight, date: log.date };
    });

    const goalY =
      SVG_HEIGHT - PADDING_Y - ((goalWeight - minW) / rangeY) * (SVG_HEIGHT - 2 * PADDING_Y);

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath =
      points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${SVG_HEIGHT - PADDING_Y} L ${points[0].x} ${SVG_HEIGHT - PADDING_Y} Z`
        : "";

    return { points, goalY, linePath, areaPath, maxW, minW };
  }, [logs, goalWeight]);

  const currentWeight = logs.length ? logs[logs.length - 1].weight : 0;
  const initialWeight = logs.length ? logs[0].weight : 0;

  const weightDifference =
    goalMode === "lose"
      ? initialWeight > 0
        ? initialWeight - currentWeight
        : 0
      : initialWeight > 0
        ? currentWeight - initialWeight
        : 0;

  const remainingToGoal =
    goalMode === "lose"
      ? currentWeight > goalWeight
        ? currentWeight - goalWeight
        : 0
      : goalWeight > currentWeight
        ? goalWeight - currentWeight
        : 0;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const kg = isRtl ? "كجم" : "kg";

  return (
    <div className="bg-surface mt-6 rounded-3xl border border-white/5 p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header + read-only stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <span className="text-primary/80 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Award size={14} />
            {isRtl ? "لوحة قياس الوزن" : "Weight Progress"}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {isRtl ? "تحليلات تقدم الجسم" : "Body Analytics"}
            <Sparkles size={18} className="text-primary" />
          </h2>

          {goalAchieved && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-primary">
              <Trophy size={13} />
              {isRtl ? "تم تحقيق الهدف" : "Goal Achieved"}
            </span>
          )}
        </div>

        {logs.length > 0 && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {goalMode === "lose" ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">
                  {isRtl
                    ? goalMode === "lose"
                      ? "إجمالي المفقود"
                      : "إجمالي المكتسب"
                    : goalMode === "lose"
                      ? "Total Lost"
                      : "Total Gained"}
                </p>
                <p className="text-sm font-black text-white">
                  {weightDifference > 0
                    ? goalMode === "lose"
                      ? `-${weightDifference.toFixed(1)}`
                      : `+${weightDifference.toFixed(1)}`
                    : "0.0"}{" "}
                  {kg}
                </p>
              </div>
            </div>

            {goalWeight > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">
                    {isRtl ? "الهدف المتبقي" : "To Goal"}
                  </p>
                  <p className="text-sm font-black text-white">
                    {remainingToGoal > 0 ? remainingToGoal.toFixed(1) : "0.0"} {kg}
                    <span className="text-xs text-foreground/40 font-normal ml-1">
                      ({isRtl ? "من" : "of"} {goalWeight}
                      {kg})
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {logs.length > 0 ? (
        <WeightChart
          logs={logs}
          points={chart.points}
          goalWeight={goalWeight}
          goalY={chart.goalY}
          svgWidth={SVG_WIDTH}
          svgHeight={SVG_HEIGHT}
          paddingX={PADDING_X}
          paddingY={PADDING_Y}
          maxW={chart.maxW}
          minW={chart.minW}
          linePath={chart.linePath}
          areaPath={chart.areaPath}
          isRtl={isRtl}
          currentWeight={currentWeight}
          formatDate={formatDate}
          hoveredIndex={hoveredIndex}
          tooltipPos={tooltipPos}
          onHoverPoint={(idx, pos) => {
            setHoveredIndex(idx);
            setTooltipPos(pos);
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/5 bg-black/20 py-14 text-center">
          <LineChart size={36} className="text-foreground/20" />
          <p className="text-sm font-bold text-foreground/40">
            {isRtl ? "لا توجد بيانات وزن بعد" : "No weight data yet"}
          </p>
        </div>
      )}
    </div>
  );
}
