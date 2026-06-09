'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { GLoaderSection } from '@/components/ui/g-loader';
import { useJob } from '../services/jobs.service';
import { ApplyJobModal } from './apply-job-modal';
import { JobCard } from './job-card';
import type { Job } from '../types';

interface JobDetailViewProps {
  jobId: string;
}

const styles = {
  page: 'pt-20 sm:pt-24 pb-16 px-3 sm:px-6 md:px-12 min-h-screen',
  inner: 'max-w-4xl mx-auto',
  backLink:
    'inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-colors mb-8 group',
  backIcon: 'group-hover:-translate-x-0.5 transition-transform',
  state: 'flex items-center justify-center py-32 text-foreground/40',
  error:
    'p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
};

export function JobDetailView({ jobId }: JobDetailViewProps) {
  const t = useTranslations('Jobs');
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const { data: job, isLoading, isError } = useJob(jobId);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link href="/jobs" className={styles.backLink}>
          <ArrowLeft size={16} className={styles.backIcon} />
          {t('backToJobs')}
        </Link>

        {isLoading ? (
          <GLoaderSection minHeight={320} />
        ) : isError || !job ? (
          <div className={styles.error}>{t('feedFailed')}</div>
        ) : (
          <JobCard
            job={job}
            index={0}
            onApply={setApplyingJob}
          />
        )}
      </div>

      <ApplyJobModal job={applyingJob} onClose={() => setApplyingJob(null)} />
    </div>
  );
}
