'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';

interface JobHeaderProps {
  title?: string;
  highlight?: string;
  tag?: string; // no longer used in new unified header, or we can ignore it
  description?: string;
  statsLabel?: string;
  len?: number;

}

export function JobHeader({ title, highlight, description, statsLabel, len }: JobHeaderProps & { len?: number }) {
  const t = useTranslations('Jobs');

  return (
    <PageHeader
      title={title || t('title')}
      highlight={highlight || t('highlight')}
      description={description || t('description')}
      statsCount={len?.toString() || "0"}
      statsLabel={statsLabel || t('openOpportunities')}
      showDivider={true}
    />
  );
}
