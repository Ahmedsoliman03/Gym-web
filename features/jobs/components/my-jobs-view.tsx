'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/ui/page-header';
import { useMyJobs } from '../services/jobs.service';
import { JobsList } from './jobs-list';
import type { JobStatus } from '../types';

type StatusFilter = 'all' | JobStatus;

const FILTERS: { value: StatusFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'open', labelKey: 'filterOpen' },
  { value: 'closed', labelKey: 'filterClosed' },
];

const styles = {
  page: 'pt-20 sm:pt-24 pb-12 px-3 sm:px-6 md:px-12',
  embedded: 'pb-4',
  inner: 'max-w-4xl mx-auto mt-8 sm:mt-12',
  innerEmbedded: 'max-w-4xl mx-auto',
  filters: 'flex items-center gap-2 mb-8',
  filterBtn:
    'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border',
  filterActive: 'bg-primary text-background border-primary',
  filterIdle:
    'bg-surface text-foreground/60 border-foreground/10 hover:text-foreground hover:border-foreground/30',
};

/** `embedded` renders the list without the full-page chrome (top padding +
 *  PageHeader) so it can sit inside the profile page's tabbed layout. */
export function MyJobsView({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations('Jobs');
  const { data: jobs, isLoading, isError } = useMyJobs();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filteredJobs = useMemo(() => {
    if (!jobs) return jobs;
    if (filter === 'all') return jobs;
    return jobs.filter((job) => job.status === filter);
  }, [jobs, filter]);

  const emptyLabel =
    filter === 'open'
      ? t('myJobsEmptyOpen')
      : filter === 'closed'
        ? t('myJobsEmptyClosed')
        : t('myJobsEmpty');

  return (
    <div className={embedded ? styles.embedded : styles.page}>
      {!embedded && (
        <PageHeader
          title={t('myJobsTitle')}
          highlight={t('myJobsHighlight')}
          description={t('myJobsDescription')}
          statsCount={jobs?.length?.toString() ?? '0'}
          statsLabel={t('myJobsStatsLabel')}
          showDivider
        />
      )}

      <div className={embedded ? styles.innerEmbedded : styles.inner}>
        {!isLoading && !isError && jobs && jobs.length > 0 && (
          <div className={styles.filters}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`${styles.filterBtn} ${
                  filter === f.value ? styles.filterActive : styles.filterIdle
                }`}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        )}

        <JobsList
          jobs={filteredJobs}
          isLoading={isLoading}
          isError={isError}
          emptyLabel={emptyLabel}
          errorLabel={t('feedFailed')}
        />
      </div>
    </div>
  );
}
