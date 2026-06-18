'use client';

export function GymCardSkeleton() {
  return (
    <div className="group bg-surface rounded-2xl overflow-hidden border border-white/5 shadow-xl flex flex-col w-full h-[220px]">
      {/* Banner Skeleton */}
      <div className="relative h-28 bg-white/[0.02] overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 z-10">
          <div className="relative w-20 h-20 rounded-2xl p-[3px] bg-white/[0.05] shadow-lg">
            <div className="w-full h-full rounded-xl bg-surface relative overflow-hidden">
              <div className="shimmer absolute inset-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Skeleton */}
      <div className="pt-14 px-5 pb-5 text-center flex flex-col items-center gap-2 flex-1">
        {/* Gym Name skeleton */}
        <div className="w-3/4 h-5 bg-white/[0.05] rounded-lg relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        {/* Location skeleton */}
        <div className="w-1/2 h-3 bg-white/[0.03] rounded-md relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
