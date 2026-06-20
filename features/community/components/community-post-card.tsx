'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Trash2,
  Flag,
  User,
  Pencil,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { formatRelativeTime } from '@/utils/format';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { useProfileLink } from '@/features/profile/hooks/useProfileLink';
import {
  useVotePostMutation,
  useDeletePostMutation,
  useReportPostMutation,
  useSavePostMutation,
  useSharePostMutation,
  usePostVoters,
} from '../services/community.service';
import type { CommunityPost } from '../types';
import dynamic from 'next/dynamic';

const CommunityComments = dynamic(() => import('./community-comments').then(mod => mod.CommunityComments), {
  ssr: false,
});
const DeletePostConfirm = dynamic(() => import('./delete-post-confirm').then(mod => mod.DeletePostConfirm), {
  ssr: false,
});
const EditPostModal = dynamic(() => import('./edit-post-modal').then(mod => mod.EditPostModal), {
  ssr: false,
});
const ReportPostModal = dynamic(() => import('./report-post-modal').then(mod => mod.ReportPostModal), {
  ssr: false,
});
const UpvotersSheet = dynamic(() => import('./upvoters-sheet').then(mod => mod.UpvotersSheet), {
  ssr: false,
});
const SharePostModal = dynamic(() => import('@/components/shared/share-post-modal').then(mod => mod.SharePostModal), {
  ssr: false,
});

interface CommunityPostCardProps {
  post: CommunityPost;
  /** Open the comments section on first render (used on the detail page). */
  defaultCommentsOpen?: boolean;
  /** Called after the post is successfully deleted (e.g., to leave the detail page). */
  onDeleted?: () => void;
  /**
   * When set, the post body + media become a link to this href (e.g. the
   * `/community/{id}` detail page). The header menu and action buttons stay
   * interactive — only the content/media region navigates. Used by the
   * profile "Posts of {owner}" strip so each preview opens its full page.
   */
  href?: string;
  /** Comment id to scroll to and flash (from a post-comment notification). */
  highlightCommentId?: string;
  /** Reply id to scroll to and flash (from a comment-reply notification). */
  highlightReplyId?: string;
}

const styles = {
  card:
    'bg-surface rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-white/10',
  header: 'flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3',
  authorWrap: 'flex items-center gap-3 min-w-0',
  avatar:
    'w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0',
  avatarLink:
    'w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 hover:ring-2 hover:ring-primary/40 transition-all',
  avatarImg: 'w-full h-full object-cover',
  authorName: 'font-bold text-foreground text-sm',
  authorNameLink: 'font-bold text-foreground text-sm hover:text-primary hover:underline transition-colors',
  authorMeta: 'text-[11px] text-foreground/40 uppercase font-bold tracking-wider',
  menuBtn:
    'text-foreground/40 hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5',
  menuWrap: 'relative',
  dropdown:
    'absolute right-0 top-full mt-2 w-44 bg-[#161B22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2',
  dropdownItem:
    'flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-white hover:bg-white/5 transition-colors text-left',
  dropdownDanger:
    'flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-white/5 transition-colors text-left',
  content: 'px-4 sm:px-6 py-2 text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap break-words',
  contentClamped:
    'px-4 sm:px-6 py-2 text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-3',
  seeMoreBtn:
    'mx-4 sm:mx-6 text-primary text-xs font-black uppercase tracking-wider hover:underline',
  mediaWrap: 'mt-2',
  singleImage: 'w-full max-h-[600px] object-cover bg-black',
  mediaGrid: 'grid grid-cols-2 gap-1',
  mediaGridItem: 'aspect-square overflow-hidden bg-black',
  mediaGridImg: 'w-full h-full object-cover',
  metaBar:
    'flex items-center gap-3 px-4 sm:px-6 py-2 text-[11px] text-foreground/40 font-bold uppercase tracking-wider',
  metaSaves:
    'inline-flex items-center gap-1 text-primary/80',
  metaLikesBtn:
    'inline-flex items-center gap-1 text-primary/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded',
  metaCommentsBtn:
    'inline-flex items-center gap-1 text-primary/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded',
  actions: 'grid grid-cols-3 border-t border-white/5',
  actionBtn:
    'flex items-center justify-center gap-1.5 sm:gap-2 py-3 text-foreground/60 font-bold text-[11px] sm:text-xs uppercase tracking-wider hover:bg-white/5 transition-colors',
  actionBtnLiked:
    'flex items-center justify-center gap-1.5 sm:gap-2 py-3 text-primary font-bold text-[11px] sm:text-xs uppercase tracking-wider bg-primary/5 hover:bg-primary/10 transition-colors',
  actionGroup:
    'flex items-center justify-center gap-1.5 sm:gap-2 py-3 font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-colors',
  actionLeft:
    'flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity',
  countPill:
    'min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-white/10 text-foreground/80 text-[10px] font-bold tabular-nums leading-none',
  countPillBtn:
    'min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-white/10 text-foreground/80 text-[10px] font-bold tabular-nums leading-none hover:bg-white/20 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
};

function PostMedia({
  file,
  mediaType,
  className,
}: {
  file: string;
  mediaType: 'image' | 'video';
  className: string;
}) {
  if (mediaType === 'video') {
    return (
      <video
        src={file}
        className={className}
        controls
        playsInline
        preload="metadata"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={file} alt="" className={className} />;
}

// Wraps the media region in a link to the detail page when `href` is given
// (profile preview), otherwise renders a plain container (feed/detail page).
function MediaRegion({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <Link href={href} className={`block ${className}`}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}

export function CommunityPostCard({
  post,
  defaultCommentsOpen = false,
  onDeleted,
  href,
  highlightCommentId,
  highlightReplyId,
}: CommunityPostCardProps) {
  const t = useTranslations('Community');
  const locale = useLocale();
  const { profile } = useProfileUser();
  const voteMutation = useVotePostMutation();
  const deleteMutation = useDeletePostMutation();
  const reportMutation = useReportPostMutation();
  const saveMutation = useSavePostMutation();
  const shareMutation = useSharePostMutation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  // A comment/reply deep-link always needs the comments section open so the
  // target row exists in the DOM to scroll to.
  const [commentsOpen, setCommentsOpen] = useState(
    defaultCommentsOpen || !!highlightCommentId || !!highlightReplyId,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch the post's voters lazily — only when the user opens the likes
  // modal — so we don't issue a request per post in the feed.
  const { data: votersData, isLoading: votersLoading } = usePostVoters(
    likesOpen ? post.id : null,
  );

  // Same see-more pattern used on the job card: clamp long bodies and let
  // the user toggle. Threshold is a cheap character-count check.
  const CONTENT_TRUNCATE_AT = 240;
  const contentNeedsToggle = (post.content?.length ?? 0) > CONTENT_TRUNCATE_AT;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const liked = post.myVote === 'up';
  const saved = !!post.isSaved;
  const savesCount = post.savesCount ?? 0;
  const sharesCount = post.sharesCount ?? 0;

  const toggleLike = () => {
    if (voteMutation.isPending) return;
    // Like = upvote. Un-like sends `vote: null` per the API contract.
    voteMutation.mutate({ postId: post.id, vote: liked ? null : 'up' });
  };

  const toggleSave = () => {
    if (saveMutation.isPending) return;
    const nextSaved = !saved;
    saveMutation.mutate(
      { postId: post.id, saved: nextSaved },
      {
        onSuccess: () => {
          toast.success(
            t(nextSaved ? 'savePostSuccess' : 'unsavePostSuccess'),
          );
        },
        onError: () => {
          toast.error(t('savePostFailed'));
        },
      },
    );
  };

  const handleComment = () => setCommentsOpen((v) => !v);

  const isMine = !!profile?.id && profile.id === post.author?.id;
  // Resolve the author's destination via the shared hook: /profile for self,
  // /coaches/{id} or /gyms/{id} otherwise, or no link for clients.
  const { href: authorHref } = useProfileLink(
    post.author?.profileId,
    post.author?.userType,
  );
  const postUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${locale}/community/${post.id}`
      : `/${locale}/community/${post.id}`;
  const shareTitle = post.content?.slice(0, 80) || post.author.fullName;

  // Always open the in-app modal. The modal exposes the device's native share
  // sheet as one of the actions when available, plus copy + platform buttons.
  // The /share API only fires when the user actually picks an option, not
  // when the modal opens.
  const handleShare = () => setShareOpen(true);

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.authorWrap}>
          {authorHref ? (
            <Link
              href={authorHref}
              className={styles.avatarLink}
              aria-label={post.author.fullName}
            >
              {post.author.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.photo}
                  alt={post.author.fullName}
                  className={styles.avatarImg}
                />
              ) : (
                <User size={18} />
              )}
            </Link>
          ) : (
            <div className={styles.avatar}>
              {post.author.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.photo}
                  alt={post.author.fullName}
                  className={styles.avatarImg}
                />
              ) : (
                <User size={18} />
              )}
            </div>
          )}
          <div className="min-w-0">
            {authorHref ? (
              <Link href={authorHref} className={styles.authorNameLink}>
                {post.author.fullName}
              </Link>
            ) : (
              <p className={styles.authorName}>{post.author.fullName}</p>
            )}
            <p className={styles.authorMeta}>
              {t(`role.${post.author.userType}`)}
              {post.createdAt ? ` · ${formatRelativeTime(post.createdAt)}` : ''}
            </p>
          </div>
        </div>

        <div className={styles.menuWrap} ref={menuRef}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t('postMenu')}
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div className={styles.dropdown}>
              {isMine ? (
                <>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setMenuOpen(false);
                      setEditOpen(true);
                    }}
                  >
                    <Pencil size={14} />
                    {t('editPost')}
                  </button>
                  <button
                    className={styles.dropdownDanger}
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 size={14} />
                    {t('deletePost')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setMenuOpen(false);
                      toggleSave();
                    }}
                    disabled={saveMutation.isPending}
                  >
                    {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    {saved ? t('unsavePost') : t('savePost')}
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      setMenuOpen(false);
                      setReportOpen(true);
                    }}
                  >
                    <Flag size={14} />
                    {t('reportPost')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {post.content &&
        // With an href the body is a link to the detail page: render it
        // clamped and skip the see-more toggle (clicking opens the full page).
        (href ? (
          <Link href={href} className={`block ${styles.contentClamped}`}>
            {post.content}
          </Link>
        ) : (
          <>
            <div
              className={
                contentExpanded || !contentNeedsToggle
                  ? styles.content
                  : styles.contentClamped
              }
            >
              {post.content}
            </div>
            {contentNeedsToggle && (
              <button
                type="button"
                onClick={() => setContentExpanded((v) => !v)}
                className={styles.seeMoreBtn}
              >
                {contentExpanded ? t('seeLess') : t('seeMore')}
              </button>
            )}
          </>
        ))}

      {post.media && post.media.length > 0 && (
        <MediaRegion href={href} className={styles.mediaWrap}>
          {post.media.length === 1 ? (
            <PostMedia
              file={post.media[0].file}
              mediaType={post.media[0].mediaType}
              className={styles.singleImage}
            />
          ) : (
            <div className={styles.mediaGrid}>
              {post.media.slice(0, 4).map((m) => (
                <div key={m.id} className={styles.mediaGridItem}>
                  <PostMedia
                    file={m.file}
                    mediaType={m.mediaType}
                    className={styles.mediaGridImg}
                  />
                </div>
              ))}
            </div>
          )}
        </MediaRegion>
      )}

      {(post.upVotes > 0 || post.commentsCount > 0 || savesCount > 0) && (
        <div className={styles.metaBar}>
          {post.upVotes > 0 && (
            <button
              type="button"
              onClick={() => setLikesOpen(true)}
              className={styles.metaLikesBtn}
              aria-label={t('viewUpvoters')}
            >
              <Heart size={12} fill="currentColor" />
              {t('likesCount', { count: post.upVotes })}
            </button>
          )}
          {post.commentsCount > 0 && (
            <button
              type="button"
              onClick={handleComment}
              className={styles.metaCommentsBtn}
              aria-label={t('comment')}
            >
              <MessageCircle size={12} />
              {t('commentCount', { count: post.commentsCount })}
            </button>
          )}
          {savesCount > 0 && (
            <span className={styles.metaSaves}>
              <Bookmark size={12} />
              {t('savesCount', { count: savesCount })}
            </span>
          )}
        </div>
      )}

      <div className={styles.actions}>
        {/* The whole cell toggles the viewer's vote — clicks on the count
            pill toggle too (no nested interactive). The upvoters sheet is
            opened from the "Liked by N" meta entry above. */}
        <button
          type="button"
          className={liked ? styles.actionBtnLiked : styles.actionBtn}
          onClick={toggleLike}
          aria-label={t('like')}
          aria-pressed={liked}
          disabled={voteMutation.isPending}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{t('like')}</span>
        </button>
        <button className={styles.actionBtn} onClick={handleComment}>
          <MessageCircle size={16} />
          <span>{t('comment')}</span>
        </button>
        <button className={styles.actionBtn} onClick={handleShare}>
          <Share2 size={16} />
          <span>{t('share')}</span>
          {sharesCount > 0 && (
            <span className={styles.countPill}>{sharesCount}</span>
          )}
        </button>
      </div>

      {commentsOpen && (
        <CommunityComments
          postId={post.id}
          postAuthorId={post.author?.id}
          highlightCommentId={highlightCommentId}
          highlightReplyId={highlightReplyId}
        />
      )}

      <SharePostModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        url={postUrl}
        title={shareTitle}
        onShared={() => shareMutation.mutate(post.id)}
      />

      <DeletePostConfirm
        isOpen={deleteOpen}
        isSubmitting={deleteMutation.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(post.id);
            toast.success(t('deletePostSuccess'));
            setDeleteOpen(false);
            onDeleted?.();
          } catch {
            // Mutation error stays in deleteMutation.error; keep the modal
            // open so the user can retry. The button reverts to the
            // non-submitting state automatically.
          }
        }}
      />

      <EditPostModal
        isOpen={editOpen}
        post={post}
        onClose={() => setEditOpen(false)}
      />

      <ReportPostModal
        isOpen={reportOpen}
        isSubmitting={reportMutation.isPending}
        onCancel={() => setReportOpen(false)}
        onSubmit={async (reason) => {
          try {
            await reportMutation.mutateAsync({ postId: post.id, reason });
            toast.success(t('reportThanks'));
            setReportOpen(false);
          } catch {
            // Error stays on the mutation; modal stays open so user can retry.
          }
        }}
      />

      <UpvotersSheet
        isOpen={likesOpen}
        onClose={() => setLikesOpen(false)}
        voters={votersData?.upVoters ?? []}
        isLoading={votersLoading}
        onVoterClick={() => setLikesOpen(false)}
      />
    </article>
  );
}
