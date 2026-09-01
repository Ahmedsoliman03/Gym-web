'use client';

import { Calendar, Trash2 } from 'lucide-react';
import { WeightLog } from './types';

interface LogsHistoryProps {
  isRtl: boolean;
  logs: WeightLog[];
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
  formatDate: (dateStr: string) => string;
}

export function LogsHistory({
  isRtl,
  logs,
  onDeleteLog,
  onClearAll,
  formatDate,
}: LogsHistoryProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground/50 flex items-center gap-2">
          <Calendar size={14} className="text-primary" />
          {isRtl ? 'سجل القراءات الأخيرة' : 'Recent Logs History'}
        </h3>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider transition-all bg-red-500/10 hover:bg-red-500/20 px-2 py-1 rounded-lg active:scale-95 cursor-pointer"
          >
            {isRtl ? 'مسح الكل' : 'Clear All'}
          </button>
        )}
      </div>
      {logs.length === 0 ? (
        <p className="text-xs text-foreground/30 italic py-4">
          {isRtl ? 'لا يوجد تاريخ مسجل' : 'No history recorded'}
        </p>
      ) : (
        <div className="max-h-[144px] overflow-y-auto pr-2 space-y-2">
          {[...logs].reverse().map((log) => (
            <div
              key={log.id}
              className="bg-white/[0.01] border border-white/5 rounded-xl px-4 py-2.5 flex items-center justify-between group/item hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <div>
                  <span className="text-xs text-white font-bold block">
                    {log.weight.toFixed(1)} {isRtl ? 'كجم' : 'kg'}
                  </span>
                  <span className="text-[10px] text-foreground/40">
                    {formatDate(log.date)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteLog(log.id)}
                className="text-foreground/30 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg opacity-40 group-hover/item:opacity-100 transition-all cursor-pointer"
                title={isRtl ? 'حذف القراءة' : 'Delete log'}
                aria-label={isRtl ? 'حذف القراءة' : 'Delete log'}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
