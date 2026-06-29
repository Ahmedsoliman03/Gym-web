'use client';

import { useJobs } from '../services/jobs.service';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { JobFeed } from './job-feed';
import { JobHeader } from './job-header';
import { AddJobButton } from './add-job-button';

const styles = {
  page: 'pt-20 sm:pt-24 pb-12 px-3 sm:px-6 md:px-12',
  inner: 'max-w-4xl mx-auto',
};

export function JobsView() {
  const { data: jobs } = useJobs();
  const { profile } = useProfileUser();

  const canPostJob = profile?.userType === 'gym';

  return (
    <div className={styles.page}>
      <JobHeader len={jobs?.length} />

      <div className={styles.inner}>
        {canPostJob && <AddJobButton />}
        <JobFeed />
      </div>
    </div>
  );
}
