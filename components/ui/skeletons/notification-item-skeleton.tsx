'use client';

const bar = 'bg-white/[0.05] rounded-md relative overflow-hidden';

export function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-full bg-white/[0.05] relative overflow-hidden shrink-0">
        <div className="shimmer absolute inset-0" />
      </div>
      <div className="flex flex-col gap-2 flex-1 pt-0.5">
        <div className={`w-3/4 h-3 ${bar}`}>
          <div className="shimmer absolute inset-0" />
        </div>
        <div className={`w-1/3 h-2.5 ${bar}`}>
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
