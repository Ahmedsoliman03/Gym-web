'use client';

import { useMemo, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { WhatsAppIcon } from '@/components/shared/whatsapp-icon';
import { useImageExport } from '@/hooks/use-image-export';
import { usePdfExport } from '@/hooks/use-pdf-export';
import {
  buildWhatsAppShareUrl,
  getDefaultWhatsAppShareMessage,
} from '@/features/share-preview/whatsapp-share';

import { useWeightTracker } from '../../services/weight-tracker.service';
import { WeeklyProgressCard } from './weekly-progress-card';
import type { CardFormat, WeeklyProgressData } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;
const FORMAT: CardFormat = 'square';

export function WeeklyProgressCardSection() {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const { data: tracker } = useWeightTracker();
  const cardRef = useRef<HTMLDivElement>(null);

  const { isExporting, isSharing, downloadImage, shareImage } = useImageExport();
  const { isExporting: isExportingPdf } = usePdfExport();

  const logs = tracker?.logs ?? [];
  const goalWeight = tracker?.goalWeight ?? 0;
  const goalMode = tracker?.goalMode ?? 'lose';

  // Weekly window: the last 7 days ending on the most recent log entry.
  const weeklyData: WeeklyProgressData | null = useMemo(() => {
    if (logs.length === 0) return null;

    const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const currentLog = sorted[sorted.length - 1];
    const currentWeight = currentLog.weight;
    const weekEnd = currentLog.date;
    const weekStartCutoff = new Date(currentLog.date).getTime() - 6 * DAY_MS;

    const withinWeek = sorted.filter((l) => new Date(l.date).getTime() >= weekStartCutoff);
    const startLog = withinWeek[0] ?? sorted[0];
    const startWeight = startLog.weight;
    const weekStart = startLog.date;

    const remainingToGoal =
      goalWeight > 0
        ? goalMode === 'lose'
          ? Math.max(0, currentWeight - goalWeight)
          : Math.max(0, goalWeight - currentWeight)
        : 0;
    const goalAchieved =
      goalWeight > 0 && (goalMode === 'lose' ? currentWeight <= goalWeight : currentWeight >= goalWeight);

    return {
      weekStart,
      weekEnd,
      startWeight,
      currentWeight,
      weeklyChange: currentWeight - startWeight,
      goalWeight,
      goalMode,
      remainingToGoal,
      goalAchieved,
    };
  }, [logs, goalWeight, goalMode]);

  if (!weeklyData) return null;

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
          {isRtl ? 'بطاقة التقدم الأسبوعي' : 'Weekly Progress Card'}
        </h2>
        <p className="text-sm text-foreground/50 mt-1 max-w-md">
          {isRtl
            ? 'شارك تقدمك الأسبوعي مع أصدقائك — صورة جاهزة للنشر على وسائل التواصل.'
            : 'Share your weekly progress with friends — a ready-to-post social image.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <WeeklyProgressCard
          ref={cardRef}
          data={weeklyData}
          isRtl={isRtl}
          format={FORMAT}
        />

        <div className="flex-1 w-full flex flex-col gap-3 max-w-xs">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3.5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isRtl ? 'تحميل كصورة' : 'Download Image'}
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            disabled={isSharing}
            className="flex items-center justify-center gap-2 px-4 py-3.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-[#25D366]/15 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {isSharing ? <Loader2 size={16} className="animate-spin" /> : <WhatsAppIcon size={16} />}
            {isRtl ? 'مشاركة عبر واتساب' : 'Share to WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}
