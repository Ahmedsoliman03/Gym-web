'use client';

const bar = 'bg-white/[0.05] rounded-lg relative overflow-hidden';

export function CommunityPostSkeleton() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-white/[0.05] relative overflow-hidden shrink-0">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className={`w-1/3 h-3.5 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
          <div className={`w-1/5 h-2.5 ${bar}`}>
            <div className="shimmer absolute inset-0" />
          </div>
        </div>
      </div>

      {/* Text body */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        <div className={`w-full h-3 ${bar}`}>
          <div className="shimmer absolute inset-0" />
        </div>
        <div className={`w-4/5 h-3 ${bar}`}>
          <div className="shimmer absolute inset-0" />
        </div>
      </div>

      {/* Media */}
      <div className="relative aspect-video bg-white/[0.02] overflow-hidden">
        <div className="shimmer absolute inset-0" />
      </div>

      {/* Action row */}
      <div className="flex items-center gap-6 p-4">
        <div className={`w-16 h-4 ${bar}`}>
          <div className="shimmer absolute inset-0" />
        </div>
        <div className={`w-16 h-4 ${bar}`}>
          <div className="shimmer absolute inset-0" />
        </div>
        <div className={`w-16 h-4 ${bar}`}>
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
