'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ApplyJobModal } from './apply-job-modal';
import { JobCard } from './job-card';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface JobDetailViewProps {
  job: any;
}

// ─── Styles object ─────────────────────────────────────────────────────────────

const styles = {
  page: "pt-24 pb-16 px-6 md:px-12 min-h-screen",
  inner: "max-w-4xl mx-auto",
  backLink: "inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-colors mb-8 group",
  backIcon: "group-hover:-translate-x-0.5 transition-transform",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function JobDetailView({ job }: JobDetailViewProps) {
  const t = useTranslations('Jobs');
  const [applyingJob, setApplyingJob] = useState<any | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Back button */}
        <Link href="/jobs" className={styles.backLink}>
          <ArrowLeft size={16} className={styles.backIcon} />
          {t('backToJobs')}
        </Link>

        {/* ─── RENDER REUSABLE JOB CARD ─── */}
        <JobCard
          job={job}
          index={0}
          onApply={setApplyingJob}
          onAction={(action, job) => console.log(`${action} post:`, job.id)}
          inDetails={true}
        />
      </div>

      {/* Modals */}
      <ApplyJobModal job={applyingJob} onClose={() => setApplyingJob(null)} />
      {/* <EditJobModal job={editingJob} onClose={() => setEditingJob(null)} /> */}
    </div>
  );
}
