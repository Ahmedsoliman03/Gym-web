'use client';

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Target, Award, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';

import { CustomSelect } from '@/components/ui/custom-select';

import { GoalMode } from './types';
import { ClearConfirmModal } from './clear-confirm-modal';
import { CelebrationBanner } from './celebration-banner';
import { WeightChart } from './weight-chart';
import { LogsForm } from './logs-form';
import { LogsHistory } from './logs-history';
import { downloadWeightProgressPdf } from './weight-progress-pdf';
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

  const { data: tracker } = useWeightTracker();
  const upsertLog = useUpsertWeightLogMutation();
  const deleteLogMutation = useDeleteWeightLogMutation();
  const clearLogsMutation = useClearWeightLogsMutation();
  const updateGoalMutation = useUpdateWeightGoalMutation();

  // Server-backed data (replaces the old localStorage state).
  const logs = tracker?.logs ?? [];
  const goalWeight = tracker?.goalWeight ?? 0;
  const goalMode: GoalMode = tracker?.goalMode ?? 'lose';

  const [newWeight, setNewWeight] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>('0');
  const [tempGoalMode, setTempGoalMode] = useState<GoalMode>('lose');
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

  // Update goal weight + mode.
  const handleSaveGoal = (mode: GoalMode) => {
    const goalVal = parseFloat(goalInput);
    if (!isNaN(goalVal) && goalVal > 0) {
      updateGoalMutation.mutate(
        { goalWeight: goalVal, goalMode: mode },
        { onSuccess: () => setIsEditingGoal(false) },
      );
    }
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

  const handleDownloadPdf = () => {
    void downloadWeightProgressPdf({
      logs,
      goalWeight,
      goalMode,
      initialWeight,
      currentWeight,
      weightDifference,
      isGoalAchieved,
    });
  };

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
    } catch (e) {
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

        {/* Stats Summary cards */}
        <div className="flex items-center gap-4 flex-wrap">
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

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Target size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">
                  {isRtl ? 'الهدف المتبقي' : 'To Goal'}
                </p>
                {!isEditingGoal && (
                  <button
                    onClick={() => {
                      setTempGoalMode(goalMode);
                      setGoalInput(goalWeight.toString());
                      setIsEditingGoal(true);
                    }}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    ({isRtl ? 'تعديل' : 'Edit'})
                  </button>
                )}
              </div>
              {isEditingGoal ? (
                <div className="flex flex-col gap-2 mt-2 z-20 relative">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="w-16 bg-white/[0.02] border border-white/5 rounded-xl px-2 py-1 text-xs text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-center"
                      autoFocus
                    />
                    <span className="text-xs text-foreground/40">{isRtl ? 'كجم' : 'kg'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CustomSelect
                      value={tempGoalMode}
                      onChange={(v) => setTempGoalMode(v as GoalMode)}
                      options={[
                        { value: 'lose', label: isRtl ? 'تنشيف / خسارة' : 'Cutting (Lose)' },
                        { value: 'gain', label: isRtl ? 'تضخيم / زيادة' : 'Bulking (Gain)' },
                      ]}
                      placeholder={isRtl ? 'اختر الهدف' : 'Select goal'}
                      className="flex-1 min-w-[150px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveGoal(tempGoalMode)}
                      className="w-7 h-7 bg-primary text-black rounded-lg font-black shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(false)}
                      className="w-7 h-7 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 flex items-center justify-center active:scale-95 transition-all text-xs cursor-pointer"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-black text-white">
                  {remainingToGoal > 0 ? `${remainingToGoal.toFixed(1)}` : '0.0'} {isRtl ? 'كجم' : 'kg'}
                  <span className="text-xs text-foreground/40 font-normal ml-1">
                    ({isRtl ? 'من' : 'of'} {goalWeight}kg)
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
