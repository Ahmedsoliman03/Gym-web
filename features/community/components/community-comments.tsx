'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Send,
  Trash2,
  User,
  Heart,
  MessageCircle,
  Flag,
  MoreVertical,
  Loader2,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { formatRelativeTime } from '@/utils/format';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { useProfileLink } from '@/features/profile/hooks/useProfileLink';
import {
  useComments,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useEditCommentMutation,
  useReplyToCommentMutation,
  useReportCommentMutation,
  useVoteCommentMutation,
} from '../services/community.service';
import type { CommunityComment } from '../types';
import { ReportPostModal } from './report-post-modal';
import { UpvotersSheet } from './upvoters-sheet';

interface CommunityCommentsProps {
  postId: string;
  postAuthorId?: string;
  /** Comment id to scroll to and flash (from a post-comment notification). */
  highlightCommentId?: string;
  highlightReplyId?: string;
}

const styles = {
  wrapper: 'border-t border-white/5 px-6 py-5 space-y-4',
  inputRow: 'flex items-center gap-2',
  avatar:
    'w-8 h-8 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0',
  avatarImg: 'w-full h-full object-cover',
  input:
    'flex-1 px-4 py-2.5 bg-[#0D121F] border border-white/5 rounded-full focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm placeholder:text-foreground/30',
  sendBtn:
    'p-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
  list: 'space-y-3',
  comment: 'flex gap-2.5',
  commentBubble:
    'flex-1 bg-white/5 rounded-2xl px-4 py-2.5 group/comment',
  authorRow: 'flex items-center justify-between gap-2 mb-0.5',
  authorLeft: 'flex items-center gap-2 min-w-0',
  authorName: 'text-xs font-bold text-foreground',
  time: 'text-[10px] text-foreground/40 font-medium whitespace-nowrap',
  body: 'text-sm text-foreground/80 whitespace-pre-wrap break-words',
  editedMark: 'text-[10px] text-foreground/35 font-medium',
  editForm: 'space-y-2',
  editInput:
    'w-full min-h-[42px] resize-none rounded-xl bg-[#0D121F] border border-white/10 px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-foreground/30',
  editActions: 'flex justify-end gap-1.5',
  editIconBtn:
    'h-7 w-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  editSaveBtn:
    'bg-primary text-primary-foreground hover:opacity-90',
  editCancelBtn:
    'bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-foreground',
  actionRow: 'flex items-center gap-3 mt-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/40',
  voteBtn: 'flex items-center gap-1 hover:text-primary transition-colors',
  voteBtnActive: 'flex items-center gap-1 text-primary transition-colors',
  replyBtn: 'flex items-center gap-1 hover:text-foreground transition-colors',
  scoreNum: 'tabular-nums text-foreground/50 hover:text-foreground hover:underline transition-colors',
  emptyText: 'text-xs text-foreground/40 text-center py-3',
  loadingText: 'text-xs text-foreground/40 text-center py-3',
  loadMoreBtn:
    'block mx-auto mt-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-foreground/70 text-[11px] font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-colors cursor-pointer',
  menuWrap: 'relative',
  menuBtn:
    'p-1 rounded-md text-foreground/30 hover:text-foreground hover:bg-white/5 transition-colors',
  menu:
    'absolute right-0 top-full mt-1 min-w-[140px] bg-[#161B22] border border-white/10 rounded-lg shadow-2xl z-30 overflow-hidden py-1',
  menuItem:
    'flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-foreground/70 hover:text-white hover:bg-white/5 transition-colors text-left',
  menuItemDanger:
    'flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-500 hover:text-red-400 hover:bg-white/5 transition-colors text-left',
  replyForm: 'flex items-end gap-2 mt-2 pl-1',
  replyInput:
    'flex-1 px-3 py-1.5 bg-[#0D121F] border border-white/5 rounded-full focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-xs placeholder:text-foreground/30',
  replyList: 'mt-2 pl-6 border-l border-white/5 space-y-3',
  avatarLink:
    'w-8 h-8 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 hover:ring-2 hover:ring-primary/40 transition-all',
  authorNameLink:
    'text-xs font-bold text-foreground hover:text-primary hover:underline transition-colors',
};

function CommentRow({
  comment,
  postId,
  currentUserId,
  isPostOwner,
  isReply,
  highlightCommentId,
  highlightReplyId,
}: {
  comment: CommunityComment;
  postId: string;
  currentUserId?: string;
  isPostOwner?: boolean;
  isReply?: boolean;
  highlightCommentId?: string;
  highlightReplyId?: string;
}) {
  const t = useTranslations('Community');
  const voteMutation = useVoteCommentMutation();
  const replyMutation = useReplyToCommentMutation();
  const deleteMutation = useDeleteCommentMutation();
  const editMutation = useEditCommentMutation();
  const reportMutation = useReportCommentMutation();

  const isTarget = isReply
    ? !!highlightReplyId && comment.id === highlightReplyId
    : !highlightReplyId && !!highlightCommentId && comment.id === highlightCommentId;
  const containsTargetReply =
    !isReply &&
    !!highlightReplyId &&
    (comment.replies?.some((r) => r.id === highlightReplyId) ?? false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(containsTargetReply);
  const [replyDraft, setReplyDraft] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(comment.body);
  const [reportOpen, setReportOpen] = useState(false);
  const [votersOpen, setVotersOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const didHighlight = useRef(false);

  useEffect(() => {
    if (!isTarget || didHighlight.current) return;
    const el = rowRef.current;
    if (!el) return;
    didHighlight.current = true;
    const scrollTimer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('comment-highlight');
    }, 150);
    const clearTimer = setTimeout(() => {
      el.classList.remove('comment-highlight');
    }, 3200);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [isTarget]);

  // Close the kebab menu when the user clicks anywhere outside of it.
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const isMine =
    !!currentUserId && !!comment.author?.id && comment.author.id === currentUserId;

  const canDelete = isMine || !!isPostOwner;
  const photo = comment.author?.photo;

  const { href: authorHref } = useProfileLink(
    comment.author?.profileId,
    comment.author?.userType,
  );
  const upVoted = comment.myVote === 'up';
  const score = comment.score ?? (comment.upVotes ?? 0) - (comment.downVotes ?? 0);
  const replyCount = comment.replies?.length ?? 0;
  const hasReplies = replyCount > 0;
  const canSaveEdit =
    editDraft.trim().length > 0 && editDraft.trim() !== comment.body.trim();
  const isEdited =
    !!comment.createdAt &&
    !!comment.updatedAt &&
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000;

  const handleVote = () => {
    if (voteMutation.isPending) return;
    voteMutation.mutate({
      commentId: comment.id,
      vote: upVoted ? null : 'up',
    });
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = replyDraft.trim();
    if (!trimmed || replyMutation.isPending) return;
    try {
      await replyMutation.mutateAsync({ commentId: comment.id, body: trimmed });
      setReplyDraft('');
      // Keep the replies list open so the user sees their new reply appear.
    } catch {
      // Mutation error stays on the mutation; the user can retry.
    }
  };

  const handleDelete = () => {
    setMenuOpen(false);
    deleteMutation.mutate(comment.id, {
      onSuccess: () => toast.success(t('commentDeleteSuccess')),
    });
  };

  const startEdit = () => {
    setMenuOpen(false);
    setReplyOpen(false);
    setEditDraft(comment.body);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (editMutation.isPending) return;
    setEditDraft(comment.body);
    setIsEditing(false);
  };

  const handleEditSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = editDraft.trim();
    if (!body || !canSaveEdit || editMutation.isPending) return;
    editMutation.mutate(
      { commentId: comment.id, body },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success(t('commentEditSuccess'));
        },
        onError: () => toast.error(t('commentEditFailed')),
      },
    );
  };

  return (
    <div>
      <div
        ref={rowRef}
        id={isReply ? `reply-${comment.id}` : `comment-${comment.id}`}
        className={styles.comment}
      >
        {authorHref ? (
          <Link href={authorHref} className={styles.avatarLink}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={comment.author.fullName} className={styles.avatarImg} />
            ) : (
              <User size={14} />
            )}
          </Link>
        ) : (
          <div className={styles.avatar}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={comment.author.fullName} className={styles.avatarImg} />
            ) : (
              <User size={14} />
            )}
          </div>
        )}
        <div className="flex-1">
          <div className={styles.commentBubble}>
            <div className={styles.authorRow}>
              <div className={styles.authorLeft}>
                {authorHref ? (
                  <Link href={authorHref} className={styles.authorNameLink}>
                    {comment.author.fullName}
                  </Link>
                ) : (
                  <span className={styles.authorName}>{comment.author.fullName}</span>
                )}
                {comment.createdAt && (
                  <span className={styles.time}>
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                )}
              </div>
              <div className={styles.menuWrap} ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className={styles.menuBtn}
                  aria-label={t('commentMenu')}
                >
                  <MoreVertical size={14} />
                </button>
                {menuOpen && (
                  <div className={styles.menu}>
                    {/* Report stays available on comments the viewer didn't
                        write — post owner may want to delete instead but can
                        still report if they prefer. */}
                    {!isMine && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setReportOpen(true);
                        }}
                        className={styles.menuItem}
                      >
                        <Flag size={12} />
                        {t('reportComment')}
                      </button>
                    )}
                    {isMine && (
                      <button
                        type="button"
                        onClick={startEdit}
                        className={styles.menuItem}
                        disabled={editMutation.isPending}
                      >
                        <Pencil size={12} />
                        {t('editComment')}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className={styles.menuItemDanger}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 size={12} />
                        {t('deleteComment')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {isEditing ? (
              <form className={styles.editForm} onSubmit={handleEditSubmit}>
                <textarea
                  autoFocus
                  className={styles.editInput}
                  value={editDraft}
                  disabled={editMutation.isPending}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEditSubmit();
                    }
                  }}
                />
                <div className={styles.editActions}>
                  <button
                    type="submit"
                    className={`${styles.editIconBtn} ${styles.editSaveBtn}`}
                    disabled={!canSaveEdit || editMutation.isPending}
                    aria-label={t('saveCommentEdit')}
                    title={t('saveCommentEdit')}
                  >
                    {editMutation.isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} />
                    )}
                  </button>
                  <button
                    type="button"
                    className={`${styles.editIconBtn} ${styles.editCancelBtn}`}
                    onClick={cancelEdit}
                    disabled={editMutation.isPending}
                    aria-label={t('cancelCommentEdit')}
                    title={t('cancelCommentEdit')}
                  >
                    <X size={13} />
                  </button>
                </div>
              </form>
            ) : (
              <p className={styles.body}>
                {comment.body}
                {isEdited && <span className={styles.editedMark}> {t('editedComment')}</span>}
              </p>
            )}
          </div>

          {!isEditing && <div className={styles.actionRow}>
            <button
              type="button"
              onClick={handleVote}
              disabled={voteMutation.isPending}
              className={upVoted ? styles.voteBtnActive : styles.voteBtn}
              aria-pressed={upVoted}
              aria-label={t('like')}
            >
              <Heart size={12} fill={upVoted ? 'currentColor' : 'none'} />
            </button>
            {/* Score is rendered as a separate clickable so tapping the
                number opens the upvoters sheet without also toggling the
                viewer's own vote. */}
            {score > 0 && (
              <button
                type="button"
                onClick={() => setVotersOpen(true)}
                className={styles.scoreNum}
                aria-label={t('viewUpvoters')}
              >
                {score}
              </button>
            )}
            {!isReply && (
              <button
                type="button"
                onClick={() => setReplyOpen((v) => !v)}
                className={styles.replyBtn}
                aria-expanded={replyOpen}
              >
                <MessageCircle size={12} />
                {replyCount > 0
                  ? t('replyWithCount', { count: replyCount })
                  : t('reply')}
              </button>
            )}
          </div>}

          {/*
            Replies + reply composer are co-toggled: hidden by default, both
            shown when the user clicks the "Reply (n)" button. This keeps the
            thread visually compact and only loads the reply UI on demand.
          */}
          {replyOpen && !isReply && (
            <>
              {hasReplies && (
                <div className={styles.replyList}>
                  {comment.replies!.map((reply) => (
                    <CommentRow
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      currentUserId={currentUserId}
                      isPostOwner={isPostOwner}
                      isReply
                      highlightCommentId={highlightCommentId}
                      highlightReplyId={highlightReplyId}
                    />
                  ))}
                </div>
              )}

              <form className={styles.replyForm} onSubmit={handleReplySubmit}>
                <input
                  type="text"
                  autoFocus
                  className={styles.replyInput}
                  placeholder={t('replyPlaceholder')}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                />
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={!replyDraft.trim() || replyMutation.isPending}
                  aria-label={t('sendComment')}
                >
                  <Send size={12} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <ReportPostModal
        isOpen={reportOpen}
        isSubmitting={reportMutation.isPending}
        onCancel={() => setReportOpen(false)}
        onSubmit={async (reason) => {
          try {
            await reportMutation.mutateAsync({ commentId: comment.id, reason });
            toast.success(t('reportThanks'));
            setReportOpen(false);
          } catch {
            // Error stays on the mutation; modal stays open so user can retry.
          }
        }}
      />

      <UpvotersSheet
        isOpen={votersOpen}
        onClose={() => setVotersOpen(false)}
        voters={comment.upVoters ?? []}
        onVoterClick={() => setVotersOpen(false)}
      />
    </div>
  );
}

const COMMENTS_PAGE_SIZE = 6;

export function CommunityComments({
  postId,
  postAuthorId,
  highlightCommentId,
  highlightReplyId,
}: CommunityCommentsProps) {
  const t = useTranslations('Community');
  const { profile } = useProfileUser();
  const { data: comments, isLoading } = useComments(postId);
  const createMutation = useCreateCommentMutation();
  const [draft, setDraft] = useState('');
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE);

  const isPostOwner =
    !!profile?.id && !!postAuthorId && profile.id === postAuthorId;

  const effectiveVisibleCount = useMemo(() => {
    if (!comments || (!highlightCommentId && !highlightReplyId)) return visibleCount;
    const idx = comments.findIndex((c) =>
      highlightReplyId
        ? c.replies?.some((r) => r.id === highlightReplyId) ?? false
        : c.id === highlightCommentId,
    );
    return idx >= 0 ? Math.max(visibleCount, idx + 1) : visibleCount;
  }, [comments, highlightCommentId, highlightReplyId, visibleCount]);

  const visibleComments = comments?.slice(0, effectiveVisibleCount) ?? [];
  const hasMore = (comments?.length ?? 0) > effectiveVisibleCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || createMutation.isPending) return;
    try {
      await createMutation.mutateAsync({ postId, body: trimmed });
      setDraft('');
    } catch (err) {
      console.error('Failed to create comment', err);
      const serverMessage =
        typeof err === 'object' && err !== null
          ? (err as { response?: { data?: { message?: string; detail?: string } } })
              .response?.data
          : undefined;
      toast.error(
        serverMessage?.message || serverMessage?.detail || t('commentFailed'),
      );
    }
  };

  const myPhoto =
    profile?.profile && 'photo' in profile.profile ? profile.profile.photo : null;

  return (
    <div className={styles.wrapper}>
      <form className={styles.inputRow} onSubmit={handleSubmit}>
        <div className={styles.avatar}>
          {myPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={myPhoto} alt="" className={styles.avatarImg} />
          ) : (
            <User size={14} />
          )}
        </div>
        <input
          type="text"
          className={styles.input}
          placeholder={t('commentPlaceholder')}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!draft.trim() || createMutation.isPending}
          aria-label={t('sendComment')}
          aria-busy={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </form>

      {isLoading ? (
        <p className={styles.loadingText}>{t('loadingComments')}</p>
      ) : !comments || comments.length === 0 ? (
        <p className={styles.emptyText}>{t('noComments')}</p>
      ) : (
        <div className={styles.list}>
          {visibleComments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              postId={postId}
              currentUserId={profile?.id}
              isPostOwner={isPostOwner}
              highlightCommentId={highlightCommentId}
              highlightReplyId={highlightReplyId}
            />
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + COMMENTS_PAGE_SIZE)}
              className={styles.loadMoreBtn}
            >
              {t('loadMoreComments')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
