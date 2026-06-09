'use client';

import { useTranslations } from 'next-intl';
import { GLoaderSection } from '@/components/ui/g-loader';
import { PageHeader } from '@/components/ui/page-header';
import { useFeed } from '../services/community.service';
import { AddCommunityPostButton } from './add-community-post-button';
import { CommunityPostCard } from './community-post-card';

const styles = {
  page: 'pt-20 sm:pt-24 pb-12 px-3 sm:px-6 md:px-12',
  inner: 'max-w-2xl mx-auto',
  feedList: 'flex flex-col gap-4 sm:gap-6',
  loading: 'flex items-center justify-center py-12 text-foreground/40',
  empty:
    'text-center py-16 text-foreground/40 font-bold uppercase tracking-wider text-sm',
  loadMoreBtn:
    'w-full py-3 mt-2 rounded-xl border border-white/10 text-foreground/60 font-bold text-xs uppercase tracking-wider hover:border-primary/40 hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed',
  errorBox:
    'p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
};

export function CommunityView() {
  const t = useTranslations('Community');
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeed();

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  const errorCode = (() => {
    const err = error as
      | { response?: { data?: { error?: { code?: string; message?: string } } } }
      | null
      | undefined;
    return err?.response?.data?.error?.code;
  })();
  return (
    <div className={styles.page}>
      <PageHeader
        title={t('title')}
        highlight={t('highlight')}
        description={t('description')}
        showDivider
      />

      <div className={styles.inner}>
        <AddCommunityPostButton />

        {isLoading ? (
          <GLoaderSection minHeight={200} />
        ) : isError ? (
          <div className={styles.errorBox}>
            {errorCode === 'missing_location' ? t('missingLocation') : t('feedFailed')}
          </div>
        ) : posts?.length === 0 ? (
          <p className={styles.empty}>{t('feedEmpty')}</p>
        ) : (
          <div className={styles.feedList}>
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}

            {hasNextPage && (
              <button
                className={styles.loadMoreBtn}
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? t('loadingMore') : t('loadMore')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
