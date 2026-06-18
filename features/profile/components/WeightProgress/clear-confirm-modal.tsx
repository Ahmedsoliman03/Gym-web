'use client';

import { AlertTriangle } from 'lucide-react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  isRtl: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearConfirmModal({ isOpen, isRtl, onClose, onConfirm }: ClearConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative bg-[#161B2B] border border-white/5 rounded-3xl p-6 max-w-sm w-full shadow-2xl z-10 text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>
        
        <h3 className="text-lg font-black text-white mb-2">
          {isRtl ? 'هل تريد مسح السجل؟' : 'Clear All History?'}
        </h3>
        
        <p className="text-xs text-foreground/60 mb-6 leading-relaxed">
          {isRtl 
            ? 'هل أنت متأكد من مسح جميع القراءات المسجلة؟ لا يمكن التراجع عن هذا الإجراء وسيتم تصفير الرسم البياني.'
            : 'Are you sure you want to clear all your logged readings? This will reset your progress chart and cannot be undone.'
          }
        </p>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-black rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-red-500/10 cursor-pointer"
          >
            {isRtl ? 'مسح الكل' : 'Clear All'}
          </button>
        </div>
      </div>
    </div>
  );
}
