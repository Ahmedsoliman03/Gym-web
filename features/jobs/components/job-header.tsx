'use client';

import { useTranslations } from 'next-intl';

const styles = {
  header: "mb-16 text-center animate-premium-in",
  tag: "text-primary font-headline font-bold text-sm uppercase mb-4 block",
  title: "text-4xl md:text-8xl font-black uppercase leading-none mb-6 text-foreground",
  statsWrapper: "flex flex-col items-center gap-2",
  stats: "flex items-center justify-center gap-4 py-2 px-6 bg-surface/50 rounded-full border border-white/5 backdrop-blur-sm",
  statsCount: "text-2xl font-black text-primary",
  statsLabel: "text-[10px] text-foreground/40 uppercase font-bold",
  description: "text-foreground/40 max-w-xl mx-auto mt-8 leading-relaxed font-medium text-lg italic",
  divider: "h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-12"
};

export function JobHeader() {
  const t = useTranslations('Jobs');

  return (
    <header className={styles.header}>
      <span className={styles.tag}>{t('tag')}</span>
      <h1 className={styles.title}>{t('title')}</h1>

      <div className={styles.statsWrapper}>
        <div className={styles.stats}>
          <p className={styles.statsCount}>124</p>
          <p className={styles.statsLabel}>{t('openOpportunities')}</p>
        </div>
      </div>

      <p className={styles.description}>
        {t('description')}
      </p>

      <div className={styles.divider} />
    </header>
  );
}
