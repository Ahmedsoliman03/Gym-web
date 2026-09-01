'use client';

import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CommunityPostEngagementProps {
  liked: boolean;
  votePending: boolean;
  isMine: boolean;
  upVotes: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onOpenLikes: () => void;
  onOpenSavers: () => void;
}

export function CommunityPostEngagement(props: CommunityPostEngagementProps) {
  return <>
    <EngagementMeta {...props} />
    <EngagementActions {...props} />
  </>;
}

function EngagementMeta({ upVotes, commentsCount, savesCount, isMine, onOpenLikes, onOpenSavers, onComment }: CommunityPostEngagementProps) {
  const t = useTranslations('Community');
  if (upVotes === 0 && commentsCount === 0 && savesCount === 0) return null;
  const button = 'inline-flex items-center gap-1 text-primary/80 hover:text-primary rounded';
  return <div className="flex items-center gap-3 px-4 sm:px-6 py-2 text-[11px] text-foreground/40 font-bold uppercase tracking-wider">
    {upVotes > 0 && <button type="button" onClick={onOpenLikes} className={button} aria-label={t('viewUpvoters')}>
      <Heart size={12} fill="currentColor" />{t('likesCount', { count: upVotes })}
    </button>}
    {commentsCount > 0 && <button type="button" onClick={onComment} className={button} aria-label={t('comment')}>
      <MessageCircle size={12} />{t('commentCount', { count: commentsCount })}
    </button>}
    {savesCount > 0 && (
      // Who saved a post is private — only the owner can open the list;
      // everyone else still sees the count, just not as a clickable button.
      isMine ? (
        <button type="button" onClick={onOpenSavers} className={button} aria-label={t('viewSavers')}>
          <Bookmark size={12} />{t('savesCount', { count: savesCount })}
        </button>
      ) : (
        <span className="inline-flex items-center gap-1 text-primary/80">
          <Bookmark size={12} />{t('savesCount', { count: savesCount })}
        </span>
      )
    )}
  </div>;
}

function EngagementActions({ liked, votePending, sharesCount, onLike, onComment, onShare }: CommunityPostEngagementProps) {
  const t = useTranslations('Community');
  const base = 'flex items-center justify-center gap-1.5 sm:gap-2 py-3 font-bold text-[11px] sm:text-xs uppercase tracking-wider hover:bg-white/5';
  return <div className="grid grid-cols-3 border-t border-white/5">
    <button type="button" className={`${base} ${liked ? 'text-primary bg-primary/5' : 'text-foreground/60'}`}
      onClick={onLike} aria-label={t('like')} aria-pressed={liked} disabled={votePending}>
      <Heart size={16} fill={liked ? 'currentColor' : 'none'} /><span>{t('like')}</span>
    </button>
    <button type="button" className={`${base} text-foreground/60`} onClick={onComment}>
      <MessageCircle size={16} /><span>{t('comment')}</span>
    </button>
    <button type="button" className={`${base} text-foreground/60`} onClick={onShare}>
      <Share2 size={16} /><span>{t('share')}</span>
      {sharesCount > 0 && <span className="min-w-5 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px]">{sharesCount}</span>}
    </button>
  </div>;
}
