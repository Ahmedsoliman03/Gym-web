'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { PostTypeChooser } from '@/features/jobs/components/post-type-chooser';
import { CommunityPostForm } from '@/features/jobs/components/community-post-form';
import { JobOpeningForm } from '@/features/jobs/components/job-opening-form';

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  page: "pt-24 pb-16 px-6 md:px-12 min-h-screen",
  inner: "max-w-3xl mx-auto",
  backLink: "inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-colors mb-8 group cursor-pointer border-0 bg-transparent p-0 outline-none",
  backIcon: "group-hover:-translate-x-0.5 transition-transform",
  heading: "text-4xl md:text-5xl font-headline font-black text-foreground mb-2",
  subheading: "text-foreground/50 mb-10",
};

type PostType = 'job' | 'community';

// ─── Page component ────────────────────────────────────────────────────────────

export default function NewJobPage() {
  const t = useTranslations('Jobs');
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { profile } = useProfileUser();
  const isGym = profile?.userType === 'gym';

  // Gyms must pick a post type first; everyone else posts a job directly.
  // The chosen type lives in the URL (?type=) — not React state — so switching
  // the language (which remounts the page) preserves the user's selection.
  const typeParam = searchParams.get('type');
  const postType: PostType | null =
    typeParam === 'community' ? 'community'
      : typeParam === 'job' ? 'job'
        : isGym ? null : 'job';

  const setPostType = (type: PostType | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) params.set('type', type);
    else params.delete('type');
    const qs = params.toString();
    const path = typeof window !== 'undefined' ? window.location.pathname : `/${locale}/jobs/new`;
    router.replace(qs ? `${path}?${qs}` : path, { scroll: false });
  };

  // ─── Post-type chooser (gyms only) ──────────────────────────────────────────
  if (isGym && postType === null) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <PostTypeChooser
            onChooseType={setPostType}
            onBack={() => router.push(`/${locale}/jobs`)}
          />
        </div>
      </div>
    );
  }

  const isCommunity = postType === 'community';

  const handleCommunitySubmit = (values: { desc: string; image: File | null }) => {
    console.log('New community post:', { type: 'community', ...values });
    router.push(`/${locale}/jobs`);
  };

  const handleJobSubmit = (values: {
    title: string;
    location: string;
    specialization: string;
    desc: string;
    image: File | null;
  }) => {
    console.log('New job:', { type: 'job', ...values });
    router.push(`/${locale}/jobs`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className='flex items-start gap-2'>
          {/* Back */}
          <button className={styles.backLink} onClick={() => router.push(`/${locale}/jobs`)}>
            <ArrowLeft size={16} className={styles.backIcon} />
            {t('backToJobs')}
          </button>

          {/* Let gyms switch the post type they picked */}
          {isGym && (
            <button type="button" className={styles.backLink} onClick={() => setPostType(null)}>
              <ArrowLeft size={16} className={styles.backIcon} />
              {t('changePostType')}
            </button>
          )}
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>{isCommunity ? t('addCommunityPost') : t('addPost')}</h1>
        <p className={styles.subheading}>{isCommunity ? t('addCommunityPostDesc') : t('addPostDesc')}</p>

        {isCommunity ? (
          <CommunityPostForm onSubmit={handleCommunitySubmit} />
        ) : (
          <JobOpeningForm onSubmit={handleJobSubmit} />
        )}
      </div>
    </div>
  );
}
