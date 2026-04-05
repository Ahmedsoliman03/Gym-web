'use client';

import { useTranslations } from 'next-intl';

const styles = {
  container: "text-center",
  title: "font-headline text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 text-glow uppercase animate-premium-in",
  highlight: "text-primary",
  description: "font-body text-foreground/60 text-base md:text-lg mb-8 uppercase tracking-[0.2em] animate-premium-in max-w-4xl mx-auto"
};

export function CoachesHero() {
  const t = useTranslations('Coaches');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {t('title')} <span className={styles.highlight}>{t('subtitle')}</span>
      </h1>
      <p
        className={styles.description}
        style={{ animationDelay: '0.1s' }}
      >
        {t('description')}
      </p>
    </div>
  );
}
