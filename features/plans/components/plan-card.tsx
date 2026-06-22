import { Check, CheckCircle2, Star } from 'lucide-react';
import type { PlanCardProps } from '../types';

const styles = {
  card: (highlight?: boolean) => `
    relative flex flex-col p-6 sm:p-8 rounded-3xl bg-surface/60 backdrop-blur-xl transition-all duration-300 h-full
    ${highlight
      ? 'border-2 border-primary shadow-[0_0_40px_rgba(34,197,94,0.18)] sm:-translate-y-2'
      : 'border border-white/5 hover:border-primary/30'}
  `,
  popularBadge:
    'absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 whitespace-nowrap',
  currentBadge:
    'absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30 whitespace-nowrap',
  name: 'text-sm font-black uppercase tracking-widest text-primary mb-1',
  tagline: 'text-foreground/50 text-sm leading-relaxed mb-6 min-h-[2.5rem]',
  priceRow: 'flex items-end gap-1.5 mb-1',
  priceAfter: 'text-4xl sm:text-5xl font-black tracking-tight leading-none',
  currency: 'text-base font-black text-foreground/70 mb-1',
  perMonth: 'text-foreground/40 text-sm font-bold mb-1.5',
  beforeRow: 'flex items-center gap-2 mb-6 min-h-[1.5rem]',
  priceBefore: 'text-foreground/40 text-base font-bold line-through',
  saveBadge:
    'px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-black uppercase tracking-wider',
  billed: 'text-[11px] text-foreground/30 uppercase font-bold tracking-wider mb-6',
  divider: 'h-px w-full bg-white/5 mb-6',
  featureList: 'flex flex-col gap-3 mb-8 flex-1',
  featureItem: 'flex items-start gap-3 text-sm text-foreground/70',
  featureIcon:
    'w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-primary',
  cta: (popular?: boolean) => `
    w-full py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all
    ${popular
      ? 'bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20'
      : 'bg-white/5 text-foreground/80 border border-white/10 hover:bg-primary hover:text-primary-foreground hover:border-primary'}
  `,
};

export function PlanCard({
  name,
  tagline,
  features,
  priceAfter,
  priceBefore,
  currency,
  perMonth,
  billedLabel,
  saveLabel,
  ctaLabel,
  free,
  freeLabel,
  popular,
  popularLabel,
  isCurrent,
  currentLabel,
  onSelect,
}: PlanCardProps) {
  return (
    <div className={styles.card(popular || isCurrent)}>
      {isCurrent && currentLabel ? (
        <span className={styles.currentBadge}>
          <CheckCircle2 size={11} />
          {currentLabel}
        </span>
      ) : popular && popularLabel ? (
        <span className={styles.popularBadge}>
          <Star size={11} fill="currentColor" />
          {popularLabel}
        </span>
      ) : null}

      <h3 className={styles.name}>{name}</h3>
      {tagline && <p className={styles.tagline}>{tagline}</p>}

      {free ? (
        <>
          <div className={styles.priceRow}>
            <span className={styles.priceAfter}>{freeLabel}</span>
          </div>
          <div className={styles.beforeRow} />
        </>
      ) : (
        <>
          <div className={styles.priceRow}>
            <span className={styles.priceAfter}>{priceAfter}</span>
            <span className={styles.currency}>{currency}</span>
            <span className={styles.perMonth}>{perMonth}</span>
          </div>
          <div className={styles.beforeRow}>
            {priceBefore && (
              <>
                <span className={styles.priceBefore}>
                  {priceBefore} {currency}
                </span>
                <span className={styles.saveBadge}>{saveLabel}</span>
              </>
            )}
          </div>
        </>
      )}
      <p className={styles.billed}>{billedLabel}</p>

      <div className={styles.divider} />

      <ul className={styles.featureList}>
        {features.map((feature, i) => (
          <li key={i} className={styles.featureItem}>
            <span className={styles.featureIcon}>
              <Check size={12} strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.cta(popular)}
        onClick={onSelect}
        disabled={!onSelect}
      >
        {isCurrent && currentLabel ? currentLabel : ctaLabel}
      </button>
    </div>
  );
}
