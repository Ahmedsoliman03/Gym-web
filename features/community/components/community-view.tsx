'use client';

import { useTranslations } from 'next-intl';
import { RotateCw, MessageSquareText } from 'lucide-react';
import { CommunityPostSkeleton } from '@/components/ui/skeletons/community-post-skeleton';
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
    'flex flex-col items-center justify-center py-16 text-center',
  emptyIconWrapper: 'inline-flex p-6 bg-white/5 rounded-full mb-5',
  emptyIcon: 'text-foreground/20',
  emptyText:
    'text-foreground/50 font-bold uppercase tracking-wider text-sm max-w-xs',
  loadMoreBtn:
    'w-full py-3 mt-2 rounded-xl border border-white/10 text-foreground/60 font-bold text-xs uppercase tracking-wider hover:border-primary/40 hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed',
  errorBox:
    'p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
  retryBtn:
    'mt-3 mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer',
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
    refetch,
    isFetching,
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
          <div className={styles.feedList}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <CommunityPostSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <div>
            <div className={styles.errorBox}>
              {errorCode === 'missing_location' ? t('missingLocation') : t('feedFailed')}
            </div>
            {errorCode !== 'missing_location' && (
              <button
                type="button"
                className={styles.retryBtn}
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RotateCw size={14} className={isFetching ? 'animate-spin' : ''} />
                {t('retry')}
              </button>
            )}
          </div>
        ) : posts?.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIconWrapper}>
              <MessageSquareText size={40} className={styles.emptyIcon} />
            </div>
            <p className={styles.emptyText}>{t('feedEmpty')}</p>
          </div>
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
