"use client";

import {
    Heart,
    MessageCircle,
    Reply,
    Briefcase,
    Bell,
    Share2,
    Trash2,
    User as UserIcon,
    type LucideIcon,
} from "lucide-react";
import type { AppNotification, NotificationType } from "../types";
import { formatRelativeTimeLong } from "@/utils/format";
import { Link } from "@/i18n/routing";
import { useProfileLink } from "@/features/profile/hooks/useProfileLink";

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
    post_vote: Heart,
    post_share: Share2,
    post_comment: MessageCircle,
    comment_vote: Heart,
    comment_reply: Reply,
    reply_vote: Heart,
    job_application: Briefcase,
};

// All notification types share the primary (green) accent for a consistent look.
const TYPE_ACCENT: Record<NotificationType, string> = {
    post_vote: "bg-primary/20 text-primary",
    post_share: "bg-primary/20 text-primary",
    post_comment: "bg-primary/20 text-primary",
    comment_vote: "bg-primary/20 text-primary",
    comment_reply: "bg-primary/20 text-primary",
    reply_vote: "bg-primary/20 text-primary",
    job_application: "bg-primary/20 text-primary",
};

const styles = {
    container: (isUnread: boolean) =>
        `group/notif relative p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${isUnread ? "bg-primary/5" : ""}`,
    avatarWrap: "relative shrink-0",
    avatar: "w-10 h-10 rounded-full overflow-hidden bg-primary/20 border border-primary/30 flex items-center justify-center text-primary",
    avatarLink:
        "block w-10 h-10 rounded-full overflow-hidden bg-primary/20 border border-primary/30 flex items-center justify-center text-primary hover:ring-2 hover:ring-primary/50 transition-all",
    avatarImg: "w-full h-full object-cover",
    typeBadge: (accent: string) =>
        `absolute -bottom-1 -end-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-surface ${accent}`,
    content: "flex-1 min-w-0",
    header: "flex items-center justify-between gap-2 mb-1",
    time: "text-[10px] whitespace-nowrap text-foreground/40 font-medium",
    text: "text-xs text-foreground/80 line-clamp-2 leading-relaxed",
    unreadDot: "w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]",
    deleteBtn:
        "absolute top-2 end-2 p-1.5 rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/notif:opacity-100 transition-all",
};

const initials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const NotificationItem = ({
    notification,
    locale,
    onClick,
    onActorClick,
    onDelete,
    deleteLabel,
}: {
    notification: AppNotification;
    locale: string;
    onClick: () => void;
    onActorClick?: () => void;
    onDelete: () => void;
    deleteLabel: string;
}) => {
    const { type, actor, text, createdAt, lastActivityAt, isRead } = notification;
    const Icon = TYPE_ICON[type] ?? Bell;
    const accent = TYPE_ACCENT[type] ?? "bg-primary/20 text-primary";
    const name = actor?.fullName ?? "";

    const { href: actorHref } = useProfileLink(actor?.profileId, actor?.userType);

    const avatarInner = actor?.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={actor.photo} alt={name} className={styles.avatarImg} />
    ) : (
        <span className="text-sm font-black">
            {initials(name) || <UserIcon size={18} />}
        </span>
    );

    return (
        <div className={styles.container(!isRead)} onClick={onClick}>
            <div className={styles.avatarWrap}>
                {actorHref ? (
                    <Link
                        href={actorHref}
                        className={styles.avatarLink}
                        onClick={(e) => {
                            // Don't let the row's onClick (post navigation) fire too.
                            e.stopPropagation();
                            onActorClick?.();
                        }}
                    >
                        {avatarInner}
                    </Link>
                ) : (
                    <div className={styles.avatar}>{avatarInner}</div>
                )}
                <span className={styles.typeBadge(accent)}>
                    <Icon size={11}  />
                </span>
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <span className={styles.time}>
                        {formatRelativeTimeLong(lastActivityAt || createdAt, locale)}
                    </span>
                </div>
                <p className={styles.text}>{text}</p>
            </div>

            {!isRead && <div className={styles.unreadDot} />}

            <button
                type="button"
                className={styles.deleteBtn}
                aria-label={deleteLabel}
                title={deleteLabel}
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};
