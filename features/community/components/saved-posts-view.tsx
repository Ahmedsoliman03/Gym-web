'use client';

import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useSavedPosts } from '../services/community.service';
import { CommunityPostCard } from './community-post-card';

const styles = {
  page: 'pt-24 pb-12 px-6 md:px-12',
  inner: 'max-w-2xl mx-auto',
  feedList: 'flex flex-col gap-6',
  loading: 'flex items-center justify-center py-12 text-foreground/40',
  empty:
    'text-center py-16 text-foreground/40 font-bold uppercase tracking-wider text-sm',
  errorBox:
    'p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
};

export function SavedPostsView() {
  const t = useTranslations('Community');
  const { data, isLoading, isError } = useSavedPosts();

  const posts = data ?? [];

  return (
    <div className={styles.page}>
      <PageHeader
        title={t('savedTitle')}
        highlight={t('savedHighlight')}
        description={t('savedDescription')}
        showDivider
      />

      <div className={styles.inner}>
        {isLoading ? (
          <div className={styles.loading}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : isError ? (
          <div className={styles.errorBox}>{t('feedFailed')}</div>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>{t('savedEmpty')}</p>
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
