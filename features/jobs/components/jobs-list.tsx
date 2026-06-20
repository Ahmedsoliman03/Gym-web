'use client';

import { useState } from 'react';
import { Briefcase } from 'lucide-react';

import { JobCardSkeleton } from '@/components/ui/skeletons/job-card-skeleton';
import { JobCard } from './job-card';
import { ApplyJobModal } from './apply-job-modal';
import { EditJobModal } from './edit-job-modal';
import type { Job } from '../types';

interface JobsListProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyLabel: string;
  errorLabel: string;
}

const styles = {
  wrapper: 'w-full',
  list: 'flex flex-col gap-12',
  state:
    'flex items-center justify-center py-16 text-foreground/40 font-bold uppercase tracking-wider text-sm',
  error:
    'p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
  empty: 'flex flex-col items-center justify-center py-16 sm:py-24 text-center',
  emptyIconWrapper: 'inline-flex p-6 bg-white/5 rounded-full mb-5',
  emptyIcon: 'text-foreground/20',
  emptyText:
    'text-foreground/50 font-bold uppercase tracking-wider text-sm max-w-xs',
};

/**
 * Shared list shell used by /jobs, /my-jobs, and /saved-jobs. Owns the
 * apply/edit modals so any card in the list can open them.
 */
export function JobsList({
  jobs,
  isLoading,
  isError,
  emptyLabel,
  errorLabel,
}: JobsListProps) {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  if (isLoading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <JobCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className={styles.error}>{errorLabel}</p>;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIconWrapper}>
          <Briefcase size={40} className={styles.emptyIcon} />
        </div>
        <p className={styles.emptyText}>{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.list}>
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            index={index}
            onApply={setApplyingJob}
            onEdit={setEditingJob}
          />
        ))}
      </div>

      <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} />
      <ApplyJobModal job={applyingJob} onClose={() => setApplyingJob(null)} />
    </div>
  );
}
