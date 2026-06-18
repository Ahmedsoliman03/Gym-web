'use client';

export function CoachCardSkeleton() {
  return (
    <div className="group bg-surface rounded-2xl overflow-hidden border border-white/5 shadow-xl flex flex-col w-full h-[280px]">
      {/* Banner Skeleton */}
      <div className="relative h-28 bg-white/[0.02] overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 z-10">
          <div className="relative w-24 h-24 rounded-full p-[3px] bg-white/[0.05] shadow-lg">
            <div className="w-full h-full rounded-full bg-surface relative overflow-hidden">
              <div className="shimmer absolute inset-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Skeleton */}
      <div className="pt-16 px-5 pb-5 text-center flex flex-col items-center gap-2.5 flex-1">
        {/* Name skeleton */}
        <div className="w-2/3 h-5 bg-white/[0.05] rounded-lg relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        {/* Experience skeleton */}
        <div className="w-1/3 h-3 bg-white/[0.03] rounded-md relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        {/* Location skeleton */}
        <div className="w-1/2 h-3 bg-white/[0.03] rounded-md mt-1 relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        {/* Tags skeleton */}
        <div className="flex gap-1.5 justify-center mt-3 w-full">
          <div className="w-14 h-5 bg-white/[0.03] rounded-md relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>
          <div className="w-16 h-5 bg-white/[0.03] rounded-md relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>
          <div className="w-12 h-5 bg-white/[0.03] rounded-md relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
