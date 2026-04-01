'use client';

import { useTranslations } from 'next-intl';

export function CoachesHero() {
  const t = useTranslations('Coaches');

  return (
    <div className="text-center">
      <h1 className="font-headline text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 text-glow uppercase animate-premium-in">
        {t('title')} <span className="text-primary">{t('subtitle')}</span>
      </h1>
      <p
        className="font-body text-foreground/60 text-base md:text-lg mb-8 uppercase tracking-[0.2em] animate-premium-in max-w-4xl mx-auto"
        style={{ animationDelay: '0.1s' }}
      >
        {t('description')}
      </p>
    </div>
  );
}
