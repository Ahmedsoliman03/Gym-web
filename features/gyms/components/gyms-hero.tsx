import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';

export function GymsHero() {
  const t = useTranslations('Gyms');

  return (
    <PageHeader 
      title={t('title')}
      highlight={t('highlight')}
      description={t('description')}
    />
  );
}
