'use client';

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Target, Award, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';

import { GoalMode } from './types';
import { GoalSetupCard } from './goal-setup-card';
import { ClearConfirmModal } from './clear-confirm-modal';
import { CelebrationBanner } from './celebration-banner';
import { WeightChart } from './weight-chart';
import { LogsForm } from './logs-form';
import { LogsHistory } from './logs-history';
import { WeightReport } from './weight-report';
import { usePdfExport } from '@/hooks/use-pdf-export';
import toast from 'react-hot-toast';
import {
  useWeightTracker,
  useUpsertWeightLogMutation,
  useDeleteWeightLogMutation,
  useClearWeightLogsMutation,
  useUpdateWeightGoalMutation,
} from '../../services/weight-tracker.service';


export function WeightProgress() {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  // `tracker` is undefined until the query resolves, which would otherwise
  // make goalWeight/logs fall back to "nothing set yet" for a beat on every
  // load — flashing the goal-setup prompt (or the empty-log state) even for
  // clients who already have real data, right before it flips to the truth.
  const { data: tracker, isPending: isTrackerLoading } = useWeightTracker();
  const upsertLog = useUpsertWeightLogMutation();
  const deleteLogMutation = useDeleteWeightLogMutation();
  const clearLogsMutation = useClearWeightLogsMutation();
  const updateGoalMutation = useUpdateWeightGoalMutation();

  // Generic, ref-based PDF export (capture the off-screen <WeightReport/>).
  const reportRef = React.useRef<HTMLDivElement>(null);
  const { isExporting, error: pdfError, exportToPdf } = usePdfExport();

  // Server-backed data (replaces the old localStorage state).
  // Memoize so the empty-array fallback keeps a stable identity while loading.
  const logs = React.useMemo(() => tracker?.logs ?? [], [tracker?.logs]);
  const goalWeight = tracker?.goalWeight ?? 0;
  const goalMode: GoalMode = tracker?.goalMode ?? 'lose';

  const [newWeight, setNewWeight] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [showGoalEditor, setShowGoalEditor] = useState<boolean>(false);
  const [weightError, setWeightError] = useState<string>('');

  // Track hovered point for SVG Chart tooltip
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; weight: number; date: string } | null>(null);

  const handleWeightChange = (val: string) => {
    setNewWeight(val);
    if (weightError) {
      setWeightError('');
    }
  };

  // Celebration state and ref
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  useEffect(() => {
    // Set "today" only after mount so the SSR/client markup can't disagree on the
    // date (would otherwise be a hydration mismatch on the date input).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Add / update a dated weight entry — the server upserts by date.
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newWeight) {
      setWeightError(isRtl ? 'الوزن مطلوب' : 'Weight is required');
      return;
    }

    const weightVal = parseFloat(newWeight);
    if (isNaN(weightVal) || weightVal < 10 || weightVal > 300) {
      setWeightError(isRtl ? 'يجب أن يكون الوزن بين 10 و 300 كجم' : 'Weight must be between 10 and 300 kg');
      return;
    }

    setWeightError('');
    if (!newDate) return;

    upsertLog.mutate(
      { date: newDate, weight: weightVal },
      {
        onSuccess: () => {
          setNewWeight('');
          setNewDate(new Date().toISOString().split('T')[0]);
        },
      },
    );
  };

  // Delete one entry.
  const handleDeleteLog = (id: string) => {
    deleteLogMutation.mutate(id);
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  // Clear all entries.
  const handleConfirmClear = () => {
    clearLogsMutation.mutate();
    setHoveredIndex(null);
    setTooltipPos(null);
    setShowClearConfirm(false);
  };

  // Update goal weight + mode (shared by first-time setup and later edits).
  const handleSaveGoal = (value: number, mode: GoalMode) => {
    updateGoalMutation.mutate(
      { goalWeight: value, goalMode: mode },
      { onSuccess: () => setShowGoalEditor(false) },
    );
  };

  // Calculations
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const initialWeight = logs.length > 0 ? logs[0].weight : 0;

  const weightDifference = goalMode === 'lose'
    ? (initialWeight > 0 ? initialWeight - currentWeight : 0)
    : (initialWeight > 0 ? currentWeight - initialWeight : 0);

  const remainingToGoal = goalMode === 'lose'
    ? (currentWeight > goalWeight ? currentWeight - goalWeight : 0)
    : (goalWeight > currentWeight ? goalWeight - currentWeight : 0);

  const isGoalAchieved = currentWeight > 0 && (
    goalMode === 'lose' ? currentWeight <= goalWeight : currentWeight >= goalWeight
  );

  const hasGoal = goalWeight > 0;

  // How far along the client is toward their goal, and — if there's enough
  // history to estimate a pace — roughly how many weeks are left at that
  // rate. Both are purely derived from data already on hand (no new fields).
  const totalNeeded = Math.abs(initialWeight - goalWeight);
  const progressPct = !hasGoal
    ? 0
    : isGoalAchieved
      ? 100
      : totalNeeded > 0
        ? Math.min(100, Math.max(0, (weightDifference / totalNeeded) * 100))
        : 0;

  const weeksSpan = logs.length > 1
    ? (new Date(logs[logs.length - 1].date).getTime() - new Date(logs[0].date).getTime()) / (7 * 86400000)
    : 0;
  // Require at least half a week of spread between the first and last log —
  // anything shorter makes the extrapolated weekly rate wildly unreliable.
  const weeklyRate = weeksSpan > 0.5 ? weightDifference / weeksSpan : 0;
  const etaWeeks = hasGoal && !isGoalAchieved && weeklyRate > 0.05 && remainingToGoal > 0
    ? Math.ceil(remainingToGoal / weeklyRate)
    : null;

  // Stable props for the off-screen report so it doesn't re-render on unrelated
  // parent state changes (chart hover, input typing). Memoized + React.memo'd.
  const reportData = React.useMemo(
    () => ({
      logs,
      goalWeight,
      goalMode,
      initialWeight,
      currentWeight,
      weightDifference,
      isGoalAchieved,
    }),
    [logs, goalWeight, goalMode, initialWeight, currentWeight, weightDifference, isGoalAchieved],
  );

  const handleDownloadPdf = () => {
    void exportToPdf(reportRef, {
      fileName: `gymspot-analytics${isRtl ? '-ar' : ''}.pdf`,
      scale: 2,
    });
  };

  useEffect(() => {
    if (pdfError) {
      toast.error(isRtl ? 'تعذّر إنشاء ملف PDF' : 'Could not generate the PDF.');
    }
  }, [pdfError, isRtl]);

  // Confetti Particle Celebration effect
  useEffect(() => {
    if (!isGoalAchieved || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#10B981'];
    const particles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height - 20,
      r: Math.random() * 4 + 4,
      d: Math.random() * height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
      speedY: Math.random() * 3 + 2,
    }));

    let active = true;

    const draw = () => {
      if (!ctx || !active) return;
      ctx.clearRect(0, 0, width, height);

      let finished = true;
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += p.speedY;
        p.x += Math.sin(p.tiltAngle) * 0.5;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        if (p.y < height) {
          finished = false;
        }
      });

      if (finished) {
        active = false;
      } else {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    const timeout = setTimeout(() => {
      active = false;
    }, 5000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [isGoalAchieved, confettiTrigger]);

  // Chart setup
  const svgWidth = 550;
  const svgHeight = 240;
  const paddingX = 45;
  const paddingY = 35;

  const allWeights = [...logs.map((l) => l.weight), goalWeight];
  const maxW = allWeights.length > 0 ? Math.max(...allWeights) + 3 : 100;
  const minW = allWeights.length > 0 ? Math.max(0, Math.min(...allWeights) - 3) : 50;
  const rangeY = maxW - minW || 10;

  const points = logs.map((log, index) => {
    const x =
      logs.length > 1
        ? paddingX + (index / (logs.length - 1)) * (svgWidth - 2 * paddingX)
        : svgWidth / 2;
    const y =
      svgHeight -
      paddingY -
      ((log.weight - minW) / rangeY) * (svgHeight - 2 * paddingY);
    return { x, y, weight: log.weight, date: log.date };
  });

  const goalY =
    svgHeight -
    paddingY -
    ((goalWeight - minW) / rangeY) * (svgHeight - 2 * paddingY);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/15 transition-all duration-700" />

      {isGoalAchieved && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />
      )}

      {isGoalAchieved && (
        <CelebrationBanner
          isRtl={isRtl}
          goalWeight={goalWeight}
          goalMode={goalMode}
          isExporting={isExporting}
          onCelebrateAgain={() => setConfettiTrigger((prev) => prev + 1)}
          onDownloadPdf={handleDownloadPdf}
        />
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <span className="text-primary/80 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <Award size={14} className="animate-pulse" />
            {isRtl ? 'لوحة قياس الوزن' : 'Weight Progress Tracker'}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {isRtl ? 'تحليلات تقدم الجسم' : 'Body Analytics Dashboard'}
            <Sparkles size={18} className="text-primary" />
          </h2>
        </div>

        {/* Stats Summary cards. "Total Lost/Gained" needs an actual logged
            entry to mean anything; "To Goal" only needs a goal to exist —
            deliberately independent so a client who set a goal but hasn't
            logged a weight yet can still see/edit it (not stranded with no
            way back to their own goal, which happened when this whole row
            was gated on logs.length alone). */}
        {(logs.length > 0 || hasGoal) && (
          <div className="">
            {logs.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {goalMode === 'lose' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">
                  {isRtl
                    ? (goalMode === 'lose' ? 'إجمالي المفقود' : 'إجمالي المكتسب')
                    : (goalMode === 'lose' ? 'Total Lost' : 'Total Gained')
                  }
                </p>
                <p className="text-sm font-black text-white">
                  {weightDifference > 0
                    ? (goalMode === 'lose' ? `-${weightDifference.toFixed(1)}` : `+${weightDifference.toFixed(1)}`)
                    : '0.0'
                  } {isRtl ? 'كجم' : 'kg'}
                </p>
              </div>
            </div>
            )}

            {hasGoal && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Target size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">
                    {isRtl ? 'الهدف المتبقي' : 'To Goal'}
                  </p>
                  <button
                    onClick={() => setShowGoalEditor(true)}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    ({isRtl ? 'تعديل' : 'Edit'})
                  </button>
                </div>
                <p className="text-sm font-black text-white">
                  {remainingToGoal > 0 ? `${remainingToGoal.toFixed(1)}` : '0.0'} {isRtl ? 'كجم' : 'kg'}
                  <span className="text-xs text-foreground/40 font-normal ms-1">
                    ({isRtl ? 'من' : 'of'} {goalWeight}kg)
                  </span>
                </p>
              </div>
            </div>
            )}
          </div>
        )}
      </div>

      {!isTrackerLoading && (!hasGoal || showGoalEditor) && (
        <GoalSetupCard
          isRtl={isRtl}
          isSaving={updateGoalMutation.isPending}
          onSave={handleSaveGoal}
          initialGoalWeight={hasGoal ? goalWeight : undefined}
          initialGoalMode={hasGoal ? goalMode : undefined}
          onCancel={hasGoal ? () => setShowGoalEditor(false) : undefined}
        />
      )}

      {hasGoal && logs.length > 0 && (
        <div className="mb-8 relative z-10">
          <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
            <span className="text-xs font-bold text-foreground/50">
              {isRtl
                ? `وصلت لـ ${progressPct.toFixed(0)}% من هدفك`
                : `${progressPct.toFixed(0)}% of the way to your goal`}
            </span>
            {etaWeeks !== null && etaWeeks <= 104 && (
              <span className="text-xs font-bold text-primary">
                {isRtl
                  ? `بالمعدل ده هتوصل خلال ~${etaWeeks} ${etaWeeks === 1 ? 'أسبوع' : 'أسابيع'}`
                  : `At this pace, ~${etaWeeks} week${etaWeeks === 1 ? '' : 's'} to go`}
              </span>
            )}
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {isTrackerLoading ? (
        <div className="mb-8 h-40 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse relative z-10" />
      ) : logs.length === 0 ? (
        <div className="mb-8 rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center relative z-10">
          <Sparkles size={22} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-bold text-white">
            {isRtl ? 'لسه معندكش أي قراءة وزن مسجلة' : "You haven't logged a weight yet"}
          </p>
          <p className="text-xs text-foreground/40 mt-1">
            {isRtl ? 'سجّل أول قراءة تحت عشان تبدأ تتابع رحلتك' : 'Log your first entry below to start tracking your journey'}
          </p>
        </div>
      ) : (
      <WeightChart
        logs={logs}
        points={points}
        goalWeight={goalWeight}
        goalY={goalY}
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        paddingX={paddingX}
        paddingY={paddingY}
        maxW={maxW}
        minW={minW}
        linePath={linePath}
        areaPath={areaPath}
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
      )}

      {/* Grid of Add form & recent history logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <LogsForm
          isRtl={isRtl}
          newWeight={newWeight}
          newDate={newDate}
          onWeightChange={handleWeightChange}
          onDateChange={setNewDate}
          onSubmit={handleAddLog}
          weightError={weightError}
        />
        <LogsHistory
          isRtl={isRtl}
          logs={logs}
          onDeleteLog={handleDeleteLog}
          onClearAll={() => setShowClearConfirm(true)}
          formatDate={formatDate}
        />
      </div>

      <ClearConfirmModal
        isOpen={showClearConfirm}
        isRtl={isRtl}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleConfirmClear}
      />

      {/* Off-screen, laid-out report captured by the PDF exporter — only mounted
          when the download is actually reachable (goal achieved → banner shown). */}
      {isGoalAchieved && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: 0,
            left: '-10000px',
            width: 794,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <WeightReport ref={reportRef} isRtl={isRtl} data={reportData} />
        </div>
      )}
    </div>
  );
}
