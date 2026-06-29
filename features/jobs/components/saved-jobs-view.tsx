'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { useSavedJobs } from '../services/jobs.service';
import { JobsList } from './jobs-list';

const styles = {
  page: 'pt-20 sm:pt-24 pb-12 px-3 sm:px-6 md:px-12',
  embedded: 'pb-4',
  inner: 'max-w-4xl mx-auto mt-8 sm:mt-12',
  innerEmbedded: 'max-w-4xl mx-auto',
};

export function SavedJobsView({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations('Jobs');
  const { data: jobs, isLoading, isError } = useSavedJobs();

  return (
    <div className={embedded ? styles.embedded : styles.page}>
      {!embedded && (
        <PageHeader
          title={t('savedJobsTitle')}
          highlight={t('savedJobsHighlight')}
          description={t('savedJobsDescription')}
          statsCount={jobs?.length?.toString() ?? '0'}
          statsLabel={t('savedJobsStatsLabel')}
          showDivider
        />
      )}

      <div className={embedded ? styles.innerEmbedded : styles.inner}>
        <JobsList
          jobs={jobs}
          isLoading={isLoading}
          isError={isError}
          emptyLabel={t('savedJobsEmpty')}
          errorLabel={t('feedFailed')}
        />
      </div>
    </div>
  );
}
