'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { useSavedJobs } from '../services/jobs.service';
import { JobsList } from './jobs-list';

const styles = {
  page: 'pt-24 pb-12 px-6 md:px-12',
  inner: 'max-w-4xl mx-auto mt-12',
};

export function SavedJobsView() {
  const t = useTranslations('Jobs');
  const { data: jobs, isLoading, isError } = useSavedJobs();

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('savedJobsTitle')}
        highlight={t('savedJobsHighlight')}
        description={t('savedJobsDescription')}
        statsCount={jobs?.length?.toString() ?? '0'}
        statsLabel={t('savedJobsStatsLabel')}
        showDivider
      />

      <div className={styles.inner}>
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
