'use client';

import { useTranslations } from 'next-intl';

import { useJobs } from '../services/jobs.service';
import { JobsList } from './jobs-list';

const styles = {
  wrapper: 'mt-12',
};

export function JobFeed() {
  const t = useTranslations('Jobs');
  const { data: jobs, isLoading, isError } = useJobs();

  return (
    <div className={styles.wrapper}>
      <JobsList
        jobs={jobs}
        isLoading={isLoading}
        isError={isError}
        emptyLabel={t('feedEmpty')}
        errorLabel={t('feedFailed')}
      />
    </div>
  );
}
