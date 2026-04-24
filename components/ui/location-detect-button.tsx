'use client';

import { useTranslations } from 'next-intl';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { LocationStatus } from '@/hooks/use-location-detect';

interface LocationDetectButtonProps {
  status: LocationStatus;
  error: string | null;
  onClick: () => void;
  /** Extra Tailwind classes for the wrapper div */
  className?: string;
}

export function LocationDetectButton({
  status,
  error,
  onClick,
  className = '',
}: LocationDetectButtonProps) {
  const t = useTranslations('Location');

  const isLoading = status === 'loading';

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`
          flex items-center gap-2.5 w-full px-4 py-3 
          rounded-xl border transition-all duration-200 text-sm font-semibold
          disabled:opacity-60 disabled:cursor-not-allowed
          ${status === 'success'
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-[#0D121F] border-white/5 text-foreground/60 hover:border-primary/30 hover:text-primary hover:bg-primary/5'
          }
        `}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin shrink-0 text-primary" />
        ) : status === 'success' ? (
          <CheckCircle size={16} className="shrink-0 text-primary" />
        ) : (
          <MapPin size={16} className="shrink-0" />
        )}

        <span>
          {isLoading
            ? t('detecting')
            : status === 'success'
            ? t('locationDetected')
            : t('detectLocation')}
        </span>
      </button>

      {status === 'error' && error && (
        <div className="flex items-start gap-2 text-red-400 text-[11px] px-1">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
