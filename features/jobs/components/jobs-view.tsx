'use client';

import { useJobs } from '../services/jobs.service';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { JobFeed } from './job-feed';
import { JobHeader } from './job-header';
import { AddJobButton } from './add-job-button';

const styles = {
  page: 'pt-24 pb-12 px-6 md:px-12',
  inner: 'max-w-4xl mx-auto',
};

export function JobsView() {
  // Fetch once at the view level so the header count and the feed stay in
  // sync — TanStack Query dedupes the second consumer (JobFeed) via the
  // shared ['jobs'] query key, so this isn't a duplicate request.
  const { data: jobs } = useJobs();
  const { profile } = useProfileUser();

  // Only gyms can author job posts, so the "Post a Job" CTA is gym-only.
  // Coaches see the feed but no compose entry; clients are blocked at the
  // middleware before they get here.
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
