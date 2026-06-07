'use client';

import { useState, useRef, useEffect } from 'react';
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
import { SharePostModal } from '@/components/shared/share-post-modal';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import {
  useVotePostMutation,
  useDeletePostMutation,
  useReportPostMutation,
  useSavePostMutation,
  useSharePostMutation,
} from '../services/community.service';
import type { CommunityPost } from '../types';
import { CommunityComments } from './community-comments';
import { DeletePostConfirm } from './delete-post-confirm';
import { EditPostModal } from './edit-post-modal';
import { ReportPostModal } from './report-post-modal';

interface CommunityPostCardProps {
  post: CommunityPost;
  /** Open the comments section on first render (used on the detail page). */
  defaultCommentsOpen?: boolean;
  /** Called after the post is successfully deleted (e.g., to leave the detail page). */
  onDeleted?: () => void;
}

const styles = {
  card:
    'bg-surface rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-white/10',
  header: 'flex items-center justify-between px-6 pt-5 pb-3',
  authorWrap: 'flex items-center gap-3',
  avatar:
    'w-11 h-11 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0',
  avatarImg: 'w-full h-full object-cover',
  authorName: 'font-bold text-foreground text-sm',
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
  content: 'px-6 py-2 text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap break-words',
  contentClamped:
    'px-6 py-2 text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-3',
  seeMoreBtn:
    'mx-6 text-primary text-xs font-black uppercase tracking-wider hover:underline',
  mediaWrap: 'mt-2',
  singleImage: 'w-full max-h-[600px] object-cover bg-black',
  mediaGrid: 'grid grid-cols-2 gap-1',
  mediaGridItem: 'aspect-square overflow-hidden bg-black',
  mediaGridImg: 'w-full h-full object-cover',
  metaBar:
    'flex items-center gap-3 px-6 py-2 text-[11px] text-foreground/40 font-bold uppercase tracking-wider',
  metaSaves:
    'inline-flex items-center gap-1 text-primary/80',
  actions: 'grid grid-cols-3 border-t border-white/5',
  actionBtn:
    'flex items-center justify-center gap-2 py-3 text-foreground/60 font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-colors',
  actionBtnLiked:
    'flex items-center justify-center gap-2 py-3 text-primary font-bold text-xs uppercase tracking-wider bg-primary/5 hover:bg-primary/10 transition-colors',
  countPill:
    'min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-white/10 text-foreground/80 text-[10px] font-bold tabular-nums leading-none',
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

function formatRelativeTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds) || seconds < 0) return '';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return date.toLocaleDateString();
}

export function CommunityPostCard({
  post,
  defaultCommentsOpen = false,
  onDeleted,
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
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    saveMutation.mutate({ postId: post.id, saved: !saved });
  };

  const handleComment = () => setCommentsOpen((v) => !v);

  const isMine = !!profile?.id && profile.id === post.author?.id;
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
          <div>
            <p className={styles.authorName}>{post.author.fullName}</p>
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

      {post.content && (
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
      )}

      {post.media && post.media.length > 0 && (
        <div className={styles.mediaWrap}>
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
        </div>
      )}

      {savesCount > 0 && (
        <div className={styles.metaBar}>
          <span className={styles.metaSaves}>
            <Bookmark size={12} />
            {t('savesCount', { count: savesCount })}
          </span>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={liked ? styles.actionBtnLiked : styles.actionBtn}
          onClick={toggleLike}
          aria-label={t('like')}
          aria-pressed={liked}
          disabled={voteMutation.isPending}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{t('like')}</span>
          {post.upVotes > 0 && <span className={styles.countPill}>{post.upVotes}</span>}
        </button>
        <button className={styles.actionBtn} onClick={handleComment}>
          <MessageCircle size={16} />
          <span>{t('comment')}</span>
          {post.commentsCount > 0 && (
            <span className={styles.countPill}>{post.commentsCount}</span>
          )}
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
        <CommunityComments postId={post.id} postAuthorId={post.author?.id} />
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
    </article>
  );
}
