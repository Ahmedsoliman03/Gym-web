'use client';

interface CelebrationBannerProps {
  isRtl: boolean;
  goalWeight: number;
  goalMode: 'lose' | 'gain';
  onCelebrateAgain: () => void;
}

export function CelebrationBanner({
  isRtl,
  goalWeight,
  goalMode,
  onCelebrateAgain,
}: CelebrationBannerProps) {
  return (
    <div className="relative overflow-hidden mb-6 p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-400 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500 z-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-bounce">
          🏆
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-white">
            {isRtl ? 'تهانينا! لقد حققت هدفك! 🎉' : 'Congratulations! Goal Achieved! 🎉'}
          </h4>
          <p className="text-xs text-emerald-400/80 mt-0.5">
            {isRtl 
              ? (goalMode === 'lose' 
                  ? `لقد وصلت إلى وزنك المستهدف (${goalWeight} كجم) أو أقل! استمر في هذا الأداء الرائع.` 
                  : `لقد وصلت إلى وزنك المستهدف (${goalWeight} كجم) أو أكثر! استمر في هذا الأداء الرائع.`
                )
              : (goalMode === 'lose'
                  ? `You've reached your target weight of ${goalWeight} kg or lower! Keep up the amazing work.`
                  : `You've reached your target weight of ${goalWeight} kg or higher! Keep up the amazing work.`
                )
            }
          </p>
        </div>
      </div>
      
      <button 
        type="button"
        onClick={onCelebrateAgain}
        className="px-3.5 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        {isRtl ? 'احتفل مجدداً 🥳' : 'Celebrate 🥳'}
      </button>
    </div>
  );
}
