'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GLoaderSection } from '@/components/ui/g-loader';
import { PageHeader } from '@/components/ui/page-header';
import { useMyPosts, type MyPostsScope } from '../services/community.service';
import { CommunityPostCard } from './community-post-card';

const styles = {
  page: 'pt-20 sm:pt-24 pb-12 px-3 sm:px-6 md:px-12',
  embedded: 'pb-4',
  inner: 'max-w-2xl mx-auto',
  tabs: 'grid grid-cols-2 gap-1 p-1 mb-4 rounded-2xl bg-white/5 border border-white/5',
  tab: (active: boolean) =>
    `px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
      active
        ? 'bg-primary/15 text-primary border border-primary/30'
        : 'text-foreground/50 border border-transparent hover:text-foreground'
    }`,
  feedList: 'flex flex-col gap-4 sm:gap-6',
  loading: 'flex items-center justify-center py-12 text-foreground/40',
  empty:
    'text-center py-16 text-foreground/40 font-bold uppercase tracking-wider text-sm',
  errorBox:
    'p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
};

export function MyPostsView({ embedded = false }: { embedded?: boolean }) {
  const t = useTranslations('Community');
  const [scope, setScope] = useState<Extract<MyPostsScope, 'published' | 'shared'>>('published');
  const { data, isLoading, isError } = useMyPosts(scope);

  const posts = data ?? [];
  const emptyKey = scope === 'published' ? 'myPublishedPostsEmpty' : 'mySharedPostsEmpty';

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
        <div className={styles.tabs}>
          <button
            type="button"
            className={styles.tab(scope === 'published')}
            onClick={() => setScope('published')}
          >
            {t('publishedPostsTab')}
          </button>
          <button
            type="button"
            className={styles.tab(scope === 'shared')}
            onClick={() => setScope('shared')}
          >
            {t('sharedPostsTab')}
          </button>
        </div>

        {isLoading ? (
          <GLoaderSection minHeight={200} />
        ) : isError ? (
          <div className={styles.errorBox}>{t('feedFailed')}</div>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>{t(emptyKey)}</p>
        ) : (
          <div className={styles.feedList}>
            {posts.map((post) => (
              <CommunityPostCard
                key={post.feedItemId ?? post.id}
                post={post}
                shareLabelMode={scope === 'shared' ? 'owner' : 'sharer'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
