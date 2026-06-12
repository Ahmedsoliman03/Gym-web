import { useTranslations } from 'next-intl';
import { Building2, Dumbbell, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  COACH_PLANS,
  GYM_PLANS,
  savePercent,
  type PlanAudience,
  type PlanTier,
} from '../plans.data';
import { PlanCard } from './plan-card';

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
};

export function PlansView() {
  const t = useTranslations('Plans');

  // Pull the per-tier copy (name, tagline, feature list) from the message
  // namespace by audience + tier id; prices come from the data file.
  const renderSection = (audience: PlanAudience, tiers: PlanTier[]) => (
    <div className={styles.grid}>
      {tiers.map((tier) => (
        <PlanCard
          key={tier.id}
          name={t(`${audience}.${tier.id}.name`)}
          tagline={t(`${audience}.${tier.id}.tagline`)}
          features={t.raw(`${audience}.${tier.id}.features`) as string[]}
          priceAfter={tier.priceAfter}
          priceBefore={tier.priceBefore}
          currency={t('currency')}
          perMonth={t('perMonth')}
          billedLabel={tier.free ? t('foreverFree') : t('billedMonthly')}
          saveLabel={t('save', { percent: savePercent(tier) })}
          ctaLabel={tier.free ? t('startFree') : t('choosePlan')}
          free={tier.free}
          freeLabel={t('free')}
          popular={tier.popular}
          popularLabel={t('mostPopular')}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.container}>
      <PageHeader
        title={t('title')}
        highlight={t('highlight')}
        description={t('description')}
      />

      <div className={styles.offerPill}>{t('limitedOffer')}</div>

      {/* GymSpot AI explainer — the single in-platform assistant that powers the
          paid tiers (smart search & recommendations across GymSpot). */}
      <div className={styles.aiBanner}>
        <div className={styles.aiIcon}>
          <Sparkles size={22} />
        </div>
        <div>
          <h3 className={styles.aiTitle}>{t('aiTitle')}</h3>
          <p className={styles.aiText}>{t('aiDescription')}</p>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>
            <Building2 size={22} />
          </div>
          <h2 className={styles.sectionTitle}>{t('forGyms')}</h2>
        </div>
        <p className={styles.sectionSubtitle}>{t('forGymsSubtitle')}</p>
        {renderSection('gym', GYM_PLANS)}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionIcon}>
            <Dumbbell size={22} />
          </div>
          <h2 className={styles.sectionTitle}>{t('forCoaches')}</h2>
        </div>
        <p className={styles.sectionSubtitle}>{t('forCoachesSubtitle')}</p>
        {renderSection('coach', COACH_PLANS)}
      </section>
    </div>
  );
}
