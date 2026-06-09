'use client';

import { useState } from 'react';

import { GLoaderSection } from '@/components/ui/g-loader';
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
    return <GLoaderSection minHeight={240} />;
  }

  if (isError) {
    return <p className={styles.error}>{errorLabel}</p>;
  }

  if (!jobs || jobs.length === 0) {
    return <p className={styles.state}>{emptyLabel}</p>;
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
