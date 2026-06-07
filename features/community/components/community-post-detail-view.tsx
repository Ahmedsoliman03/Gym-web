'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { usePost } from '../services/community.service';
import { CommunityPostCard } from './community-post-card';

interface CommunityPostDetailViewProps {
  postId: string;
}

const styles = {
  page: 'pt-24 pb-12 px-6 md:px-12 min-h-screen',
  inner: 'max-w-2xl mx-auto',
  backLink:
    'inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-colors mb-6 group cursor-pointer border-0 bg-transparent p-0 outline-none',
  backIcon: 'group-hover:-translate-x-0.5 transition-transform',
  loading: 'flex items-center justify-center py-16 text-foreground/40',
  errorBox:
    'p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center',
  notFound:
    'p-6 rounded-xl bg-white/5 border border-white/10 text-foreground/60 text-sm text-center',
};

export function CommunityPostDetailView({ postId }: CommunityPostDetailViewProps) {
  const t = useTranslations('Community');
  const router = useRouter();
  const { data: post, isLoading, isError, error } = usePost(postId);

  const isNotFound =
    (error as { response?: { status?: number } } | null | undefined)?.response?.status ===
    404;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <button className={styles.backLink} onClick={() => router.push('/community')}>
          <ArrowLeft size={16} className={styles.backIcon} />
          {t('backToFeed')}
        </button>

        {isLoading ? (
          <div className={styles.loading}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : isNotFound || (!post && isError) ? (
          <div className={styles.notFound}>{t('postNotFound')}</div>
        ) : isError ? (
          <div className={styles.errorBox}>{t('feedFailed')}</div>
        ) : post ? (
          <CommunityPostCard
            post={post}
            defaultCommentsOpen
            onDeleted={() => router.push('/community')}
          />
        ) : null}
      </div>
    </div>
  );
}
