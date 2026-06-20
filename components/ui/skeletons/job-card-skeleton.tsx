'use client';

const bar = 'bg-white/[0.05] rounded-lg relative overflow-hidden';

export function JobCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 shadow-xl">
      {/* Header: avatar + author lines */}
      <div className="flex items-center gap-4 p-4 sm:p-6">
        <div className="w-12 h-12 rounded-full bg-white/[0.05] relative overflow-hidden shrink-0">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className={`w-1/3 h-4 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
          <div className={`w-1/4 h-3 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative aspect-video md:aspect-[21/9] bg-white/[0.02] overflow-hidden">
        <div className="shimmer absolute inset-0" />
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 md:p-8 flex flex-col gap-4">
        <div className={`w-2/3 h-8 ${bar}`}>
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="flex gap-4">
          <div className={`w-24 h-4 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
          <div className={`w-20 h-4 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
          <div className={`w-16 h-4 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className={`w-full h-3 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
          <div className={`w-11/12 h-3 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
          <div className={`w-3/4 h-3 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
