'use client';

import { useTranslations } from 'next-intl';
import { GLoaderSection } from '@/components/ui/g-loader';
import { PageHeader } from '@/components/ui/page-header';
import { useCoach } from '@/features/coaches/services/coaches.service';
import { useGym } from '@/features/gyms/services/gyms.service';
import {
  useCoachPosts,
  useGymPosts,
} from '../services/community.service';
import { CommunityPostCard } from './community-post-card';

const styles = {
  page: 'pt-20 sm:pt-24 pb-12 px-3 sm:px-6 md:px-12',
  inner: 'max-w-2xl mx-auto',
  feedList: 'flex flex-col gap-4 sm:gap-6',
  empty:
    'text-center py-16 text-foreground/40 font-bold uppercase tracking-wider text-sm',
  errorBox:
    'p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
};

interface AuthorPostsViewProps {
  authorType: 'coach' | 'gym';
  profileId: string;
}

export function AuthorPostsView({ authorType, profileId }: AuthorPostsViewProps) {
  const t = useTranslations('Community');
  const tProfile = useTranslations('Profile');

  const coachQuery = useCoachPosts(authorType === 'coach' ? profileId : null);
  const gymQuery = useGymPosts(authorType === 'gym' ? profileId : null);
  const { data, isLoading, isError } = authorType === 'coach' ? coachQuery : gymQuery;

  const coachDetailQuery = useCoach(authorType === 'coach' ? profileId : '');
  const gymDetailQuery = useGym(authorType === 'gym' ? profileId : '');
  const ownerName =
    authorType === 'coach'
      ? coachDetailQuery.data?.fullName
      : gymDetailQuery.data?.gymName;

  const posts = data ?? [];

  const headerTitle = ownerName
    ? tProfile('postsOf', { name: ownerName })
    : tProfile('recentPosts');

  return (
    <div className={styles.page}>
      <PageHeader
        title={headerTitle}
        description={tProfile('viewAllPosts')}
        showDivider
      />

      <div className={styles.inner}>
        {isLoading ? (
          <GLoaderSection minHeight={200} />
        ) : isError ? (
          <div className={styles.errorBox}>{t('feedFailed')}</div>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>{tProfile('noPostsYet')}</p>
        ) : (
          <div className={styles.feedList}>
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
