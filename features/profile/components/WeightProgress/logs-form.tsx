'use client';

import React from 'react';
import { Plus } from 'lucide-react';

import { CustomDatePicker } from '@/components/ui/custom-date-picker';

interface LogsFormProps {
  isRtl: boolean;
  newWeight: string;
  newDate: string;
  onWeightChange: (val: string) => void;
  onDateChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  weightError?: string;
}

export function LogsForm({
  isRtl,
  newWeight,
  newDate,
  onWeightChange,
  onDateChange,
  onSubmit,
  weightError,
}: LogsFormProps) {
  return (
    <div>
      <h3 className="text-xs font-black uppercase tracking-wider text-foreground/50 flex items-center gap-2 mb-4">
        <Plus size={14} className="text-primary" />
        {isRtl ? 'تسجيل وزن جديد' : 'Log New Reading'}
      </h3>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-1.5">
              {isRtl ? 'الوزن (كجم)' : 'Weight (kg)'}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                placeholder="80.0"
                value={newWeight}
                onChange={(e) => onWeightChange(e.target.value)}
                className={`w-full bg-white/[0.02] border rounded-2xl py-3.5 px-4 focus:ring-2 transition-all outline-none text-white text-sm ${
                  weightError
                    ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                    : 'border-white/5 focus:border-primary/30 focus:ring-primary/20'
                }`}
              />
            </div>
            {weightError && (
              <p className="text-red-500 text-xs mt-1.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {weightError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-1.5">
              {isRtl ? 'التاريخ' : 'Date'}
            </label>
            <CustomDatePicker
              value={newDate}
              onChange={onDateChange}
              isRtl={isRtl}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-primary text-black rounded-2xl font-black shadow-lg shadow-primary/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
        >
          <Plus size={16} />
          {isRtl ? 'تسجيل القراءة' : 'Log Entry'}
        </button>
      </form>
    </div>
  );
}
