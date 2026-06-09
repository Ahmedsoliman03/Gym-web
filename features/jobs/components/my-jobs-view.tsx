'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { useMyJobs } from '../services/jobs.service';
import { JobsList } from './jobs-list';

const styles = {
  page: 'pt-20 sm:pt-24 pb-12 px-3 sm:px-6 md:px-12',
  inner: 'max-w-4xl mx-auto mt-8 sm:mt-12',
};

export function MyJobsView() {
  const t = useTranslations('Jobs');
  const { data: jobs, isLoading, isError } = useMyJobs();

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('myJobsTitle')}
        highlight={t('myJobsHighlight')}
        description={t('myJobsDescription')}
        statsCount={jobs?.length?.toString() ?? '0'}
        statsLabel={t('myJobsStatsLabel')}
        showDivider
      />

      <div className={styles.inner}>
        <JobsList
          jobs={jobs}
          isLoading={isLoading}
          isError={isError}
          emptyLabel={t('myJobsEmpty')}
          errorLabel={t('feedFailed')}
        />
      </div>
    </div>
  );
}
