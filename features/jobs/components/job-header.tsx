'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';

interface JobHeaderProps {
  title?: string;
  highlight?: string;
  tag?: string; // no longer used in new unified header, or we can ignore it
  description?: string;
  statsCount?: string;
  statsLabel?: string;
}

export function JobHeader({ title, highlight, description, statsCount, statsLabel }: JobHeaderProps) {
  const t = useTranslations('Jobs');

  return (
    <PageHeader 
      title={title || t('title')}
      highlight={highlight || t('highlight')}
      description={description || t('description')}
      statsCount={statsCount || "124"}
      statsLabel={statsLabel || t('openOpportunities')}
      showDivider={true}
    />
  );
}
