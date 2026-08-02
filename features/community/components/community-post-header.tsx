'use client';

import type { ComponentProps, RefObject } from 'react';
import { Bookmark, BookmarkCheck, Flag, MoreVertical, Pencil, Trash2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { WhatsAppIcon } from '@/components/shared/whatsapp-icon';
import { formatRelativeTime } from '@/utils/format';
import type { CommunityPost } from '../types';

interface CommunityPostHeaderProps {
  post: CommunityPost;
  authorHref?: ComponentProps<typeof Link>['href'];
  isMine: boolean;
  saved: boolean;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  savePending: boolean;
  onMenuToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onReport: () => void;
  onWhatsAppShare: () => void;
}

export function CommunityPostHeader(props: CommunityPostHeaderProps) {
  const t = useTranslations('Community');
  const { post, authorHref, menuOpen, menuRef, onMenuToggle } = props;
  return <header className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
    <div className="flex items-center gap-3 min-w-0">
      <AuthorAvatar post={post} authorHref={authorHref} />
      <div className="min-w-0">
        {authorHref ? <Link href={authorHref} className="font-bold text-foreground text-sm hover:text-primary hover:underline transition-colors">
          {post.author.fullName}
        </Link> : <p className="font-bold text-foreground text-sm">{post.author.fullName}</p>}
        <p className="text-[11px] text-foreground/40 uppercase font-bold tracking-wider">
          {t(`role.${post.author.userType}`)}
          {post.createdAt ? ` · ${formatRelativeTime(post.createdAt)}` : ''}
        </p>
      </div>
    </div>
    <div className="relative" ref={menuRef}>
      <button className="text-foreground/40 hover:text-primary p-2 rounded-lg hover:bg-white/5"
        onClick={onMenuToggle} aria-label={t('postMenu')}><MoreVertical size={18} /></button>
      {menuOpen && <PostMenu {...props} />}
    </div>
  </header>;
}

function AuthorAvatar({ post, authorHref }: {
  post: CommunityPost;
  authorHref?: ComponentProps<typeof Link>['href'];
}) {
  const content = post.author.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={post.author.photo} alt={post.author.fullName} className="w-full h-full object-cover" />
  ) : <User size={18} />;
  const className = 'w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0';
  return authorHref ? <Link href={authorHref} className={`${className} hover:ring-2 hover:ring-primary/40`}
    aria-label={post.author.fullName}>{content}</Link> : <div className={className}>{content}</div>;
}

function PostMenu({ post, isMine, saved, savePending, onEdit, onDelete, onSave, onReport, onWhatsAppShare }: CommunityPostHeaderProps) {
  const t = useTranslations('Community');
  const tShare = useTranslations('Share');
  const canEditContent = post.content.trim().length > 0;
  const item = 'flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-white hover:bg-white/5 text-left';
  return <div className="absolute right-0 top-full mt-2 w-44 bg-[#161B22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
    <button className={`${item} text-[#25D366]`} onClick={onWhatsAppShare}>
      <WhatsAppIcon size={14} />{tShare('shareWhatsApp')}
    </button>
    {isMine ? <>
      {canEditContent && <button className={item} onClick={onEdit}><Pencil size={14} />{t('editPost')}</button>}
      <button className={`${item} text-red-500`} onClick={onDelete}><Trash2 size={14} />{t('deletePost')}</button>
    </> : <>
      <button className={item} onClick={onSave} disabled={savePending}>
        {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        {saved ? t('unsavePost') : t('savePost')}
      </button>
      <button className={item} onClick={onReport}><Flag size={14} />{t('reportPost')}</button>
    </>}
  </div>;
}
