'use client';

import { useTranslations } from 'next-intl';
import { GLoaderSection } from '@/components/ui/g-loader';
import { PageHeader } from '@/components/ui/page-header';
import { useMyPosts } from '../services/community.service';
import { CommunityPostCard } from './community-post-card';

const styles = {
  page: 'pt-20 sm:pt-24 pb-12 px-3 sm:px-6 md:px-12',
  embedded: 'pb-4',
  inner: 'max-w-2xl mx-auto',
  feedList: 'flex flex-col gap-4 sm:gap-6',
  loading: 'flex items-center justify-center py-12 text-foreground/40',
  empty:
    'text-center py-16 text-foreground/40 font-bold uppercase tracking-wider text-sm',
  errorBox:
    'p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
};

export function MyPostsView({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations('Community');
  const { data, isLoading, isError } = useMyPosts();

  const posts = data ?? [];

  return (
    <div className={embedded ? styles.embedded : styles.page}>
      {!embedded && (
        <PageHeader
          title={t('myPostsTitle')}
          highlight={t('myPostsHighlight')}
          description={t('myPostsDescription')}
          showDivider
        />
      )}

      <div className={styles.inner}>
        {isLoading ? (
          <GLoaderSection minHeight={200} />
        ) : isError ? (
          <div className={styles.errorBox}>{t('feedFailed')}</div>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>{t('myPostsEmpty')}</p>
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
