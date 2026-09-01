'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Share2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { useProfileLink } from '@/features/profile/hooks/useProfileLink';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import {
  useDeletePostMutation,
  usePostSavers,
  usePostVoters,
  useReportPostMutation,
  useSavePostMutation,
  useSharePostMutation,
  useVotePostMutation,
} from '../services/community.service';
import type { CommunityPost } from '../types';
import { CommunityMediaCarousel } from './community-media-carousel';
import { CommunityPostContent } from './community-post-content';
import { CommunityPostEngagement } from './community-post-engagement';
import { CommunityPostHeader } from './community-post-header';

const CommunityComments = dynamic(() => import('./community-comments').then((mod) => mod.CommunityComments), { ssr: false });
const DeletePostConfirm = dynamic(() => import('./delete-post-confirm').then((mod) => mod.DeletePostConfirm), { ssr: false });
const EditPostModal = dynamic(() => import('./edit-post-modal').then((mod) => mod.EditPostModal), { ssr: false });
const ReportPostModal = dynamic(() => import('./report-post-modal').then((mod) => mod.ReportPostModal), { ssr: false });
const UpvotersSheet = dynamic(() => import('./upvoters-sheet').then((mod) => mod.UpvotersSheet), { ssr: false });
const PostSaversSheet = dynamic(() => import('./post-savers-sheet').then((mod) => mod.PostSaversSheet), { ssr: false });
const SharePostModal = dynamic(() => import('@/components/shared/share-post-modal').then((mod) => mod.SharePostModal), { ssr: false });

const styles = {
  article:
    'bg-surface rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 hover:border-white/10',
  sharedBar:
    'flex items-center gap-2 px-4 sm:px-6 py-3 border-b border-white/5 text-xs font-bold text-foreground/50',
  sharedText: 'inline-flex items-center gap-1 min-w-0',
  sharedName:
    'text-foreground/80 hover:text-primary hover:underline truncate',
  sharedFallback: 'text-foreground/80 truncate',
};

interface CommunityPostCardProps {
  post: CommunityPost;
  defaultCommentsOpen?: boolean;
  onDeleted?: () => void;
  href?: string;
  highlightCommentId?: string;
  highlightReplyId?: string;
  shareLabelMode?: 'sharer' | 'owner';
}

export function CommunityPostCard({
  post,
  defaultCommentsOpen = false,
  onDeleted,
  href,
  highlightCommentId,
  highlightReplyId,
  shareLabelMode = 'sharer',
}: CommunityPostCardProps) {
  const t = useTranslations('Community');
  const tShare = useTranslations('Share');
  const locale = useLocale();
  const { profile } = useProfileUser();
  const voteMutation = useVotePostMutation();
  const deleteMutation = useDeletePostMutation();
  const reportMutation = useReportPostMutation();
  const saveMutation = useSavePostMutation();
  const shareMutation = useSharePostMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen || !!highlightCommentId || !!highlightReplyId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [likesOpen, setLikesOpen] = useState(false);
  const [saversOpen, setSaversOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: votersData, isLoading: votersLoading } = usePostVoters(likesOpen ? post.id : null);
  const { data: saversData, isLoading: saversLoading } = usePostSavers(saversOpen ? post.id : null);
  const { href: authorHref } = useProfileLink(post.author?.profileId, post.author?.userType);
  const { href: sharedByHref } = useProfileLink(post.sharedBy?.profileId, post.sharedBy?.userType);
  const liked = post.myVote === 'up';
  const saved = !!post.isSaved;
  const savesCount = post.savesCount ?? 0;
  const sharesCount = post.sharesCount ?? 0;
  const isMine = !!profile?.id && profile.id === post.author?.id;
  // Only gyms/coaches can publish to their profile, so only they can share
  // someone else's post onto it — mirrors the backend's `can_publish` gate.
  const canShareToProfile =
    !isMine && (profile?.userType === 'gym' || profile?.userType === 'coach');

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const toggleLike = () => {
    if (!voteMutation.isPending) voteMutation.mutate({ postId: post.id, vote: liked ? null : 'up' });
  };
  const toggleSave = () => {
    if (saveMutation.isPending) return;
    const nextSaved = !saved;
    saveMutation.mutate({ postId: post.id, saved: nextSaved }, {
      onSuccess: () => toast.success(t(nextSaved ? 'savePostSuccess' : 'unsavePostSuccess')),
      onError: () => toast.error(t('savePostFailed')),
    });
  };
  const toggleComments = () => setCommentsOpen((value) => !value);
  const postUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${locale}/community/${post.id}`
    : `/${locale}/community/${post.id}`;
  const postShareTitle = post.content?.slice(0, 80) || post.author.fullName;
  const shareLabelTarget =
    shareLabelMode === 'owner'
      ? { href: authorHref, name: post.author.fullName, prefix: t('sharedFrom') }
      : { href: sharedByHref, name: post.sharedBy?.fullName ?? '', prefix: t('sharedBy') };
  const showSharedAsMine =
    shareLabelMode === 'sharer' && !!profile?.id && profile.id === post.sharedBy?.id;

  return <article className={styles.article}>
    {post.isShared && post.sharedBy && (
      <div className={styles.sharedBar}>
        <Share2 size={14} />
        {showSharedAsMine ? (
          <span>{t('youSharedThis')}</span>
        ) : (
          <span className={styles.sharedText}>
            <span>{shareLabelTarget.prefix}</span>
            {shareLabelTarget.href ? (
              <Link href={shareLabelTarget.href} className={styles.sharedName}>
                {shareLabelTarget.name}
              </Link>
            ) : (
              <span className={styles.sharedFallback}>{shareLabelTarget.name}</span>
            )}
          </span>
        )}
      </div>
    )}
    <CommunityPostHeader post={post} authorHref={authorHref ?? undefined} isMine={isMine} saved={saved}
      menuOpen={menuOpen} menuRef={menuRef} savePending={saveMutation.isPending}
      onMenuToggle={() => setMenuOpen((value) => !value)}
      onEdit={() => { setMenuOpen(false); setEditOpen(true); }}
      onDelete={() => { setMenuOpen(false); setDeleteOpen(true); }}
      onSave={() => { setMenuOpen(false); toggleSave(); }}
      onReport={() => { setMenuOpen(false); setReportOpen(true); }} />
    <CommunityPostContent content={post.content} href={href} />
    {post.media.length > 0 && <CommunityMediaCarousel media={post.media} />}
    <CommunityPostEngagement liked={liked} votePending={voteMutation.isPending} isMine={isMine}
      upVotes={post.upVotes} commentsCount={post.commentsCount} savesCount={savesCount}
      sharesCount={sharesCount} onLike={toggleLike} onComment={toggleComments}
      onShare={() => setShareOpen(true)}
      onOpenLikes={() => setLikesOpen(true)}
      onOpenSavers={() => setSaversOpen(true)} />
    {commentsOpen && <CommunityComments postId={post.id} postAuthorId={post.author?.id}
      highlightCommentId={highlightCommentId} highlightReplyId={highlightReplyId} />}
    <SharePostModal isOpen={shareOpen} onClose={() => setShareOpen(false)} url={postUrl}
      contentType="post"
      title={postShareTitle}
      onShareToProfile={canShareToProfile ? async () => {
          try {
            await shareMutation.mutateAsync(post.id);
            toast.success(tShare('shareToProfileSuccess'));
            setShareOpen(false);
          } catch {
            toast.error(tShare('shareToProfileFailed'));
          }
        } : undefined}
      shareToProfilePending={shareMutation.isPending} />
    <DeletePostConfirm isOpen={deleteOpen} isSubmitting={deleteMutation.isPending}
      onCancel={() => setDeleteOpen(false)} onConfirm={async () => {
        try {
          await deleteMutation.mutateAsync(post.id);
          toast.success(t('deletePostSuccess'));
          setDeleteOpen(false);
          onDeleted?.();
        } catch {}
      }} />
    {editOpen && <EditPostModal isOpen={editOpen} post={post} onClose={() => setEditOpen(false)} />}
    <ReportPostModal isOpen={reportOpen} isSubmitting={reportMutation.isPending}
      onCancel={() => setReportOpen(false)} onSubmit={async (reason) => {
        try {
          await reportMutation.mutateAsync({ postId: post.id, reason });
          toast.success(t('reportThanks'));
          setReportOpen(false);
        } catch {}
      }} />
    <UpvotersSheet isOpen={likesOpen} onClose={() => setLikesOpen(false)}
      voters={votersData?.upVoters ?? []} isLoading={votersLoading}
      onVoterClick={() => setLikesOpen(false)} />
    <PostSaversSheet isOpen={saversOpen} onClose={() => setSaversOpen(false)}
      savers={saversData?.savers ?? []} isLoading={saversLoading}
      onSaverClick={() => setSaversOpen(false)} />
  </article>;
}
