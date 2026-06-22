'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Building2, Dumbbell, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { GLoaderSection } from '@/components/ui/g-loader';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import {
  useCurrentSubscriptionQuery,
  usePlatformPlansQuery,
} from '../services/plans.service';
import type { PlanAudience, PlanFeature, PlatformPlan } from '../types';
import { PlanCard } from './plan-card';
import { SubscribeModal } from './subscribe-modal';

const styles = {
  container: 'pt-20 sm:pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto',
  offerPill:
    'mx-auto mb-10 sm:mb-12 w-fit flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.1)] text-center',
  aiBanner:
    'mb-12 sm:mb-16 p-5 sm:p-6 rounded-3xl bg-primary/5 border border-primary/15 flex items-start gap-4',
  aiIcon:
    'w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center text-primary shrink-0',
  aiTitle: 'font-black uppercase tracking-wide text-sm mb-1 text-primary',
  aiText: 'text-foreground/60 text-sm leading-relaxed',
  section: 'mb-16 sm:mb-24 last:mb-0',
  sectionHead: 'flex items-center gap-3 mb-2',
  sectionIcon:
    'w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0',
  sectionTitle: 'text-2xl sm:text-3xl font-black uppercase tracking-tight',
  sectionSubtitle: 'text-foreground/50 text-sm sm:text-base mb-8 sm:mb-10',
  grid: 'grid gap-5 sm:gap-6 md:grid-cols-3 items-stretch',
  state: 'py-16 text-center text-foreground/50 text-sm font-bold',
  retry:
    'mt-4 mx-auto block w-fit px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all',
};

const savePercent = (priceAfter: number, priceBefore?: number) =>
  priceBefore && priceBefore > priceAfter
    ? Math.round(((priceBefore - priceAfter) / priceBefore) * 100)
    : 0;

export function PlansView() {
  const t = useTranslations('Plans');
  const { data: plans, isLoading, isError, refetch } = usePlatformPlansQuery();
  const { profile } = useProfileUser();

  const { data: currentSub } = useCurrentSubscriptionQuery(Boolean(profile));
  const currentPlanId = currentSub?.plan?.id;
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);


  const featureLine = (f: PlanFeature) => {
    const value =
      f.daily_limit > 0
        ? t('limitPerDay', { count: f.daily_limit })
        : f.monthly_limit === -1
          ? t('unlimited')
          : t('limitPerMonth', { count: f.monthly_limit });
    return `${f.feature.name}: ${value}`;
  };


  const byAudience = useMemo(() => {
    const groups: Record<PlanAudience, PlatformPlan[]> = { gym: [], coach: [] };
    (plans ?? []).forEach((plan) => {
      const audience: PlanAudience = plan.plan_type === 'GYM' ? 'gym' : 'coach';
      groups[audience].push(plan);
    });
    (Object.keys(groups) as PlanAudience[]).forEach((audience) => {
      groups[audience].sort(
        (a, b) => Number(a.sale_price) - Number(b.sale_price),
      );
    });
    return groups;
  }, [plans]);

  const renderSection = (audience: PlanAudience) => {
    const tiers = byAudience[audience];
    return (
      <div className={styles.grid}>
        {tiers.map((plan, index) => {
          const fullPrice = Number(plan.price);
          const sale = Number(plan.sale_price);
          const free = fullPrice === 0;
          const discounted = sale > 0 && sale < fullPrice;
          const priceAfter = discounted ? sale : fullPrice;
          const priceBefore = discounted ? fullPrice : undefined;
          const popular = tiers.length >= 3 && index === 1;
          const isCurrent = plan.id === currentPlanId;

          return (
            <PlanCard
              key={plan.id}
              name={plan.name}
              features={plan.features.map(featureLine)}
              priceAfter={priceAfter}
              priceBefore={priceBefore}
              currency={t('currency')}
              perMonth={t('perMonth')}
              billedLabel={free ? t('foreverFree') : t('billedMonthly')}
              saveLabel={t('save', {
                percent: savePercent(priceAfter, priceBefore),
              })}
              ctaLabel={free ? t('startFree') : t('choosePlan')}
              free={free}
              freeLabel={t('free')}
              popular={popular}
              popularLabel={t('mostPopular')}
              isCurrent={isCurrent}
              currentLabel={t('currentPlan')}
              // The free tier and the user's current plan aren't purchasable.
              onSelect={
                free || isCurrent ? undefined : () => setSelectedPlan(plan)
              }
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title={t('title')}
        highlight={t('highlight')}
        description={t('description')}
      />

      <div className={styles.offerPill}>{t('limitedOffer')}</div>


      <div className={styles.aiBanner}>
        <div className={styles.aiIcon}>
          <Sparkles size={22} />
        </div>
        <div>
          <h3 className={styles.aiTitle}>{t('aiTitle')}</h3>
          <p className={styles.aiText}>{t('aiDescription')}</p>
        </div>
      </div>

      {isLoading && <GLoaderSection minHeight={320} label={t('loading')} />}

      {isError && (
        <div className={styles.state}>
          <p>{t('loadError')}</p>
          <button
            type="button"
            className={styles.retry}
            onClick={() => refetch()}
          >
            {t('retry')}
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {byAudience.gym.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionIcon}>
                  <Building2 size={22} />
                </div>
                <h2 className={styles.sectionTitle}>{t('forGyms')}</h2>
              </div>
              <p className={styles.sectionSubtitle}>{t('forGymsSubtitle')}</p>
              {renderSection('gym')}
            </section>
          )}

          {byAudience.coach.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <div className={styles.sectionIcon}>
                  <Dumbbell size={22} />
                </div>
                <h2 className={styles.sectionTitle}>{t('forCoaches')}</h2>
              </div>
              <p className={styles.sectionSubtitle}>{t('forCoachesSubtitle')}</p>
              {renderSection('coach')}
            </section>
          )}

          {byAudience.gym.length === 0 && byAudience.coach.length === 0 && (
            <p className={styles.state}>{t('empty')}</p>
          )}
        </>
      )}

      <SubscribeModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        currency={t('currency')}
      />
    </div>
  );
}
