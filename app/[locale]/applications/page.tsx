'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import { JOBS } from '@/constants/jops';
import { SPECIALIZATIONS } from '@/constants/specializations';
import { ApplicationCard } from '@/features/jobs/components/application-card';
import type { Application } from '@/features/jobs/components/application-card';
import { PageHeader } from '@/components/ui/page-header';

// ─── Mock data ─────────────────────────────────────────────────────────────────
// In production this would come from the API.

const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    jobId: 1,
    specialization: 'Strength & Conditioning',
    name: 'Ahmed Soliman',
    email: 'ahmed.soliman@email.com',
    whatsapp: '01012345678',
    headline: 'Certified NASM Coach with 7 years of experience in strength & conditioning.',
    cvFile: 'ahmed_cv.pdf',
    appliedAt: '2 hours ago',
    avatar: 'https://i.pravatar.cc/100?img=12',
  },
  {
    id: 'app-2',
    jobId: 1,
    specialization: 'Strength & Conditioning',
    name: 'Sara Khalil',
    email: 'sara.khalil@email.com',
    whatsapp: '01159133110',
    headline: 'Yoga & Mobility specialist, 5 years pro experience .',
    cvFile: 'sara_cv.pdf',
    appliedAt: '5 hours ago',
    avatar: 'https://i.pravatar.cc/100?img=22',
  },
  {
    id: 'app-3',
    jobId: 3,
    specialization: 'CrossFit',
    name: 'Omar Farouq',
    email: 'omar.farouq@email.com',
    whatsapp: '01159133110',
    headline: 'CrossFit Level 2 Trainer, nutrition-certified.',
    cvFile: 'omar_cv.pdf',
    appliedAt: '1 day ago',
    avatar: 'https://i.pravatar.cc/100?img=33',
  },
  {
    id: 'app-4',
    jobId: 2,
    specialization: 'Yoga',
    name: 'Nour Hassan',
    email: 'nour.hassan@email.com',
    whatsapp: '01159133110',
    headline: 'Yoga & Mobility coach — worked with national-level athletes.',
    cvFile: 'nour_cv.pdf',
    appliedAt: '2 days ago',
    avatar: 'https://i.pravatar.cc/100?img=44',
  },
];

// Only show filter tabs for specializations that appear in the data
const ACTIVE_SPECIALIZATIONS = SPECIALIZATIONS.filter(spec =>
  MOCK_APPLICATIONS.some(a => a.specialization === spec.value)
);

// ─── Page styles ───────────────────────────────────────────────────────────────

const styles = {
  page: "pt-24 pb-16 px-6 md:px-12 min-h-screen",
  inner: "max-w-5xl mx-auto",
  pageHeader: "mb-12",
  tag: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4",
  title: "text-4xl md:text-5xl font-headline font-black text-foreground mb-3",
  subtitle: "text-foreground/50 max-w-xl",
  filterBar: "flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide",
  filterBtnActive: "px-4 py-2 rounded-xl text-sm font-bold uppercase whitespace-nowrap transition-all bg-primary text-primary-foreground shadow-[0_4px_15px_rgba(34,197,94,0.2)]",
  filterBtnIdle: "px-4 py-2 rounded-xl text-sm font-bold uppercase whitespace-nowrap transition-all bg-white/5 text-foreground/50 hover:bg-white/10",
  emptyState: "text-center py-24 text-foreground/30",
  emptyIcon: "mx-auto mb-4 opacity-20",
  emptyText: "text-lg font-bold",
  grid: "grid grid-cols-1 md:grid-cols-2 gap-6",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const t = useTranslations('Applications');
  const [filter, setFilter] = useState<string | 'all'>('all');

  const filtered = filter === 'all'
    ? MOCK_APPLICATIONS
    : MOCK_APPLICATIONS.filter(a => a.specialization === filter);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Page header */}
        <PageHeader 
          title={t('title')}
          description={t('description')}
        />

        {/* Filter bar — driven by SPECIALIZATIONS constant */}
        <div className={styles.filterBar}>
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? styles.filterBtnActive : styles.filterBtnIdle}
          >
            {t('allPosts')} ({MOCK_APPLICATIONS.length})
          </button>

          {ACTIVE_SPECIALIZATIONS.map(spec => {
            const count = MOCK_APPLICATIONS.filter(a => a.specialization === spec.value).length;
            return (
              <button
                key={spec.id}
                onClick={() => setFilter(spec.value)}
                className={filter === spec.value ? styles.filterBtnActive : styles.filterBtnIdle}
              >
                {spec.fallback} ({count})
              </button>
            );
          })}
        </div>

        {/* Applications grid */}
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <User size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>{t('noApplications')}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(app => (
              <ApplicationCard
                key={app.id}
                app={app}
                job={JOBS.find(j => j.id === app.jobId)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
