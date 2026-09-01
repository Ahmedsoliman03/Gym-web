'use client';

import { useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { WhatsAppIcon } from '@/components/shared/whatsapp-icon';
import { useImageExport } from '@/hooks/use-image-export';
import {
  buildWhatsAppShareUrl,
  getDefaultWhatsAppShareMessage,
} from '@/features/share-preview/whatsapp-share';

import { useWeightTracker } from '../../services/weight-tracker.service';
import { WeeklyProgressCard } from './weekly-progress-card';
import type { CardFormat, WeeklyProgressData } from './types';

const FORMAT: CardFormat = 'square';

export function WeeklyProgressCardSection() {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const { data: tracker } = useWeightTracker();
  const cardRef = useRef<HTMLDivElement>(null);

  const { isExporting, isSharing, downloadImage, shareImage } = useImageExport();

  const goalWeight = tracker?.goalWeight ?? 0;
  const goalMode = tracker?.goalMode ?? 'lose';

  // Whole journey: first-ever log to the most recent one, so the shareable
  // card always reflects real progress instead of collapsing to "0kg" when
  // check-ins happen weeks apart (see the sibling Body Analytics dashboard,
  // which uses the same full-history approach for its chart and totals).
  const journeyData: WeeklyProgressData | null = useMemo(() => {
    const logs = tracker?.logs ?? [];
    if (logs.length === 0) return null;

    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstLog = sorted[0];
    const currentLog = sorted[sorted.length - 1];
    const startWeight = firstLog.weight;
    const currentWeight = currentLog.weight;

    const remainingToGoal =
      goalWeight > 0
        ? goalMode === 'lose'
          ? Math.max(0, currentWeight - goalWeight)
          : Math.max(0, goalWeight - currentWeight)
        : 0;
    const goalAchieved =
      goalWeight > 0 && (goalMode === 'lose' ? currentWeight <= goalWeight : currentWeight >= goalWeight);

    return {
      journeyStart: firstLog.date,
      journeyEnd: currentLog.date,
      startWeight,
      currentWeight,
      totalChange: currentWeight - startWeight,
      goalWeight,
      goalMode,
      remainingToGoal,
      goalAchieved,
      chartPoints: sorted.map((l) => ({ date: l.date, weight: l.weight })),
    };
  }, [tracker?.logs, goalWeight, goalMode]);

  if (!journeyData) return null;

  const fileBase = `gymspot-weekly-progress${isRtl ? '-ar' : ''}`;

  const handleDownloadImage = () => {
    void downloadImage(cardRef, { fileName: `${fileBase}.png`, scale: 2 }).then((ok) => {
      if (!ok) toast.error(isRtl ? 'تعذّر إنشاء الصورة' : 'Could not generate the image.');
    });
  };

  const handleShareWhatsApp = async () => {
    const message = getDefaultWhatsAppShareMessage('progress', locale);
    const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const outcome = await shareImage(cardRef, {
      fileName: `${fileBase}.png`,
      shareTitle: message,
      shareText: appUrl ? `${message}\n${appUrl}` : message,
    });
    if (outcome === 'downloaded') {
      window.open(buildWhatsAppShareUrl({ url: appUrl, message }), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-surface p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="mb-6">
        <span className="text-primary/80 font-bold text-xs uppercase tracking-widest mb-1.5 block">
          {isRtl ? 'بطاقة قابلة للمشاركة' : 'Shareable Card'}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white">
          {isRtl ? 'بطاقة رحلتك' : 'Your Journey Card'}
        </h2>
        <p className="text-sm text-foreground/50 mt-1 max-w-md">
          {isRtl
            ? 'شارك رحلتك الكاملة مع أصدقائك — صورة جاهزة للنشر على وسائل التواصل.'
            : 'Share your full progress journey with friends — a ready-to-post social image.'}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <WeeklyProgressCard
          ref={cardRef}
          data={journeyData}
          isRtl={isRtl}
          format={FORMAT}
        />

        <div className="flex flex-row gap-3 w-full max-w-sm">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isRtl ? 'تحميل كصورة' : 'Download'}
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            disabled={isSharing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#25D366]/15 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {isSharing ? <Loader2 size={16} className="animate-spin" /> : <WhatsAppIcon size={16} />}
            {isRtl ? 'واتساب' : 'WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}
