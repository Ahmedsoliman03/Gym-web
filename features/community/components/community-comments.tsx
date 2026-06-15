'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Trash2,
  User,
  Heart,
  MessageCircle,
  Flag,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { useProfileLink } from '@/features/profile/hooks/useProfileLink';
import {
  useComments,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useReplyToCommentMutation,
  useReportCommentMutation,
  useVoteCommentMutation,
} from '../services/community.service';
import type { CommunityComment } from '../types';
import { ReportPostModal } from './report-post-modal';
import { UpvotersSheet } from './upvoters-sheet';

interface CommunityCommentsProps {
  postId: string;
  /** Author id of the post these comments belong to. When the viewer matches,
   *  every comment / reply gets a Delete action. */
  postAuthorId?: string;
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
  authorName: 'text-xs font-bold text-foreground',
  body: 'text-sm text-foreground/80 whitespace-pre-wrap break-words',
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
}: {
  comment: CommunityComment;
  postId: string;
  currentUserId?: string;
  /** True when the signed-in user authored the post — they can delete any
   *  comment or reply under it. */
  isPostOwner?: boolean;
  isReply?: boolean;
}) {
  const t = useTranslations('Community');
  const voteMutation = useVoteCommentMutation();
  const replyMutation = useReplyToCommentMutation();
  const deleteMutation = useDeleteCommentMutation();
  const reportMutation = useReportCommentMutation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [votersOpen, setVotersOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Shared self-aware link resolver — clients return null so the name stays
  // un-clickable, coaches/gyms go to their detail page, self → /profile.
  const { href: authorHref } = useProfileLink(
    comment.author?.profileId,
    comment.author?.userType,
  );
  const upVoted = comment.myVote === 'up';
  const score = comment.score ?? (comment.upVotes ?? 0) - (comment.downVotes ?? 0);
  const replyCount = comment.replies?.length ?? 0;
  const hasReplies = replyCount > 0;

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
      setReplyOpen(false);
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

  return (
    <div>
      <div className={styles.comment}>
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
              {authorHref ? (
                <Link href={authorHref} className={styles.authorNameLink}>
                  {comment.author.fullName}
                </Link>
              ) : (
                <span className={styles.authorName}>{comment.author.fullName}</span>
              )}
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
            <p className={styles.body}>{comment.body}</p>
          </div>

          <div className={styles.actionRow}>
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
          </div>

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

export function CommunityComments({ postId, postAuthorId }: CommunityCommentsProps) {
  const t = useTranslations('Community');
  const { profile } = useProfileUser();
  const { data: comments, isLoading } = useComments(postId);
  const createMutation = useCreateCommentMutation();
  const [draft, setDraft] = useState('');
  // Show the first six comments by default; "Show more" reveals six more
  // at a time so very chatty posts don't blow up the scroll length.
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE);

  const isPostOwner =
    !!profile?.id && !!postAuthorId && profile.id === postAuthorId;

  const visibleComments = comments?.slice(0, visibleCount) ?? [];
  const hasMore = (comments?.length ?? 0) > visibleCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || createMutation.isPending) return;
    // The mutation's `onMutate` inserts the comment optimistically into the
    // list so the user sees it right away. We keep the draft (and button
    // disabled via `isPending`) until the server confirms — on success we
    // clear the input, on failure we leave it filled so the user can retry.
    try {
      await createMutation.mutateAsync({ postId, body: trimmed });
      setDraft('');
    } catch (err) {
      // A rejection here is one of two things: the optimistic `onMutate` threw
      // (in which case `api.post` was never sent — no request in the network
      // tab), or the backend rejected the request. Log the real error and, when
      // the server returned a message, surface it instead of the generic copy.
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
