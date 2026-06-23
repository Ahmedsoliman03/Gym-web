'use client';

import {
  Award,
  Briefcase,
  Eye,
  Gauge,
  Image as ImageIcon,
  Pencil,
  Send,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GLoaderSection } from '@/components/ui/g-loader';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import {
  useCurrentSubscriptionQuery,
  useSubscriptionUsageQuery,
} from '../services/plans.service';
import type { FeatureCode, FeatureUsage } from '../types';

const styles = {
  wrap: 'pb-4',
  header: 'mb-6',
  planRow: 'flex items-center gap-2 mb-1',
  planName: 'text-lg font-black uppercase tracking-tight',
  planBadge:
    'px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest',
  subtitle: 'text-foreground/50 text-sm',
  grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  card: 'p-5 rounded-2xl bg-surface/60 border border-white/5',
  cardHead: 'flex items-center gap-3 mb-4',
  icon: 'w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0',
  name: 'font-black text-sm',
  meterBlock: 'mb-3 last:mb-0',
  meterTop: 'flex items-center justify-between text-xs mb-1.5',
  meterLabel: 'text-foreground/50 font-bold uppercase tracking-wider',
  meterValue: 'font-black',
  unlimited: 'text-primary',
  track: 'h-2 w-full rounded-full bg-white/5 overflow-hidden',
  bar: (full: boolean) =>
    `h-full rounded-full transition-all ${full ? 'bg-red-500' : 'bg-primary'}`,
  state: 'py-16 text-center text-foreground/50 text-sm font-bold',
  retry:
    'mt-4 mx-auto block w-fit px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all',
};

const featureIcons: Record<string, LucideIcon> = {
  job_post: Briefcase,
  see_applicants: Eye,
  edit_profile: Pencil,
  profile_images: ImageIcon,
  transformation_photos: ImageIcon,
  certifications: Award,
  apply_job: Send,
  gymspot_ai: Sparkles,
};

const isUnlimited = (limit: number) => limit === -1;

function UsageMeter({
  label,
  used,
  limit,
  unlimitedLabel,
}: {
  label: string;
  used: number;
  limit: number;
  unlimitedLabel: string;
}) {
  const unlimited = isUnlimited(limit);
  const pct = unlimited || limit === 0 ? 0 : Math.min(100, (used / limit) * 100);
  const full = !unlimited && used >= limit;

  return (
    <div className={styles.meterBlock}>
      <div className={styles.meterTop}>
        <span className={styles.meterLabel}>{label}</span>
        <span
          className={`${styles.meterValue} ${unlimited ? styles.unlimited : ''}`}
        >
          {unlimited ? `${used} · ${unlimitedLabel}` : `${used} / ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className={styles.track}>
          <div className={styles.bar(full)} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function UsageCard({ item }: { item: FeatureUsage }) {
  const t = useTranslations('Plans');
  const Icon = featureIcons[item.feature_code as FeatureCode] ?? Gauge;
  // Prefer a localized name keyed by code; fall back to the backend's name.
  const nameKey = `featureNames.${item.feature_code}`;
  const name = t.has(nameKey) ? t(nameKey) : item.feature_name;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.icon}>
          <Icon size={20} />
        </span>
        <h3 className={styles.name}>{name}</h3>
      </div>

      <UsageMeter
        label={t('usageMonthly')}
        used={item.monthly_used}
        limit={item.monthly_limit}
        unlimitedLabel={t('unlimited')}
      />
      {/* Daily meter only matters when there's an actual daily cap. */}
      {!isUnlimited(item.daily_limit) && (
        <UsageMeter
          label={t('usageDaily')}
          used={item.daily_used}
          limit={item.daily_limit}
          unlimitedLabel={t('unlimited')}
        />
      )}
    </div>
  );
}

export function UsageView() {
  const t = useTranslations('Plans');
  const { profile } = useProfileUser();
  const enabled = Boolean(profile);

  const {
    data: usage = [],
    isLoading,
    isError,
    refetch,
  } = useSubscriptionUsageQuery(enabled);
  const { data: currentSub } = useCurrentSubscriptionQuery(enabled);

  if (isLoading) {
    return <GLoaderSection minHeight={240} label={t('loading')} />;
  }

  if (isError) {
    return (
      <div className={styles.state}>
        <p>{t('usageError')}</p>
        <button type="button" className={styles.retry} onClick={() => refetch()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  if (usage.length === 0) {
    return <p className={styles.state}>{t('usageEmpty')}</p>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.planRow}>
          <h2 className={styles.planName}>{t('usageTitle')}</h2>
          {currentSub?.plan?.name && (
            <span className={styles.planBadge}>{currentSub.plan.name}</span>
          )}
        </div>
        <p className={styles.subtitle}>{t('usageSubtitle')}</p>
      </div>

      <div className={styles.grid}>
        {usage.map((item) => (
          <UsageCard key={item.feature_code} item={item} />
        ))}
      </div>
    </div>
  );
}
