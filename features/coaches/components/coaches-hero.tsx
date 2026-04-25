'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';

export function CoachesHero() {
  const t = useTranslations('Coaches');

  return (
    <PageHeader 
      title={t('title')}
      highlight={t('subtitle')}
      description={t('description')}
    />
  );
}
