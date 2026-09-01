'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Target, TrendingDown, TrendingUp } from 'lucide-react';
import { CustomSelect } from '@/components/ui/custom-select';
import type { GoalMode } from './types';

interface GoalSetupCardProps {
  isRtl: boolean;
  isSaving: boolean;
  onSave: (goalWeight: number, goalMode: GoalMode) => void;
  /** Pre-fill for editing an existing goal (vs. the first-time empty form). */
  initialGoalWeight?: number;
  initialGoalMode?: GoalMode;
  /** Present only when editing an existing goal — lets the client back out
   * without changing it. Omitted for the mandatory first-time setup. */
  onCancel?: () => void;
}

/**
 * Prominent goal editor, used two ways: as a required-feeling first step for
 * a client who hasn't set a target weight yet (the stats/chart below are
 * close to meaningless without one), and — pre-filled, with a Cancel button —
 * whenever an existing goal is being changed. Both cases share this same
 * card instead of the old tiny "(Edit)" popover, which was easy to miss and
 * didn't show at all before the first weight log.
 */
export function GoalSetupCard({
  isRtl,
  isSaving,
  onSave,
  initialGoalWeight,
  initialGoalMode,
  onCancel,
}: GoalSetupCardProps) {
  const isEditing = !!onCancel;
  const [goalWeight, setGoalWeight] = useState(initialGoalWeight ? initialGoalWeight.toString() : '');
  const [goalMode, setGoalMode] = useState<GoalMode>(initialGoalMode ?? 'lose');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = parseFloat(goalWeight);
    if (isNaN(value) || value <= 0) {
      setError(isRtl ? 'أدخل وزن مستهدف صحيح' : 'Enter a valid target weight');
      return;
    }
    setError('');
    onSave(value, goalMode);
  };

  return (
    <div className="mb-8 rounded-2xl border-2 border-primary/30 bg-primary/[0.04] p-6 sm:p-8 relative z-10">
      <div className="flex items-center gap-2 mb-1.5">
        <Target size={16} className="text-primary" />
        <span className="text-primary font-black text-xs uppercase tracking-widest">
          {isEditing
            ? (isRtl ? 'تعديل الهدف' : 'Edit Goal')
            : (isRtl ? 'خطوة أولى مطلوبة' : 'Required first step')}
        </span>
      </div>
      <h3 className="text-lg font-black text-white mb-1">
        {isEditing
          ? (isRtl ? 'غيّر وزنك المستهدف' : 'Change your target weight')
          : (isRtl ? 'حدد هدفك عشان نقدر نتابع تقدمك' : 'Set your goal so we can track your progress')}
      </h3>
      <p className="text-xs text-foreground/50 mb-6">
        {isRtl
          ? 'الوزن المستهدف بيخلي كل الإحصائيات والرسم البياني تحت يبقوا مفيدين ليك فعلاً.'
          : 'Your target weight is what makes the stats and chart below actually useful to you.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            value={goalWeight}
            onChange={(e) => {
              setGoalWeight(e.target.value);
              if (error) setError('');
            }}
            placeholder={isRtl ? 'الوزن المستهدف (كجم)' : 'Target weight (kg)'}
            autoFocus={isEditing}
            className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
              error ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-primary/40'
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-1.5 px-1">{error}</p>}
        </div>
        <CustomSelect
          value={goalMode}
          onChange={(v) => setGoalMode(v as GoalMode)}
          options={[
            { value: 'lose', label: isRtl ? 'تنشيف / خسارة' : 'Cutting (Lose)' },
            { value: 'gain', label: isRtl ? 'تضخيم / زيادة' : 'Bulking (Gain)' },
          ]}
          placeholder={isRtl ? 'اختر الهدف' : 'Select goal'}
          className="sm:w-48"
        />
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 px-5 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="shrink-0 px-6 py-3.5 bg-primary text-black rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
        >
          {goalMode === 'lose' ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          {isSaving ? '...' : isEditing ? (isRtl ? 'حفظ' : 'Save') : (isRtl ? 'حفظ الهدف' : 'Set Goal')}
        </button>
      </form>
    </div>
  );
}
