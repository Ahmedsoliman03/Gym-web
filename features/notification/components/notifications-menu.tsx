"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { triggerChatOpen } from "@/features/chat/hooks/use-chat";
import { NotificationItem } from "./notification-item";
import { resolveNotificationTarget } from "../utils/resolve-target";
import type { AppNotification } from "../types";
import {
    useNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    useDeleteNotificationMutation,
    useClearNotificationsMutation,
} from "../services/notification.service";

const styles = {
    container: "relative",
    menuPanel: (isRtl: boolean) => `absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2 w-80 sm:w-96 bg-surface border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden animate-in fade-in slide-in-from-top-2`,
    header: "p-4 border-b border-white/5 flex items-center justify-between gap-2",
    titleWrap: "flex items-center gap-2 min-w-0",
    title: "font-bold text-foreground",
    countPill: "text-[10px] font-black px-1.5 py-0.5 rounded-full bg-primary/20 text-primary tabular-nums",
    headerActions: "flex items-center gap-1 shrink-0",
    iconBtn: "p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
    closeBtn: "p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors",
    listWrapper: "max-h-[440px] overflow-y-auto",
    emptyState: "p-10 flex flex-col items-center gap-2 text-center text-foreground/40 text-sm",
};

export const NotificationsMenu = ({
    buttonClassName,
    badgeClassName
}: {
    buttonClassName: string;
    badgeClassName: string;
}) => {
    const t = useTranslations('Notifications');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const router = useRouter();

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { data, isLoading } = useNotificationsQuery();
    const notifications = data?.notifications ?? [];
    const unreadCount = data?.unreadCount ?? 0;

    const markRead = useMarkNotificationReadMutation();
    const markAllRead = useMarkAllNotificationsReadMutation();
    const deleteOne = useDeleteNotificationMutation();
    const clearAll = useClearNotificationsMutation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemClick = (notification: AppNotification) => {
        if (!notification.isRead) markRead.mutate(notification.id);
        setIsOpen(false);

        // The destination is derived from type + data (the server `link` uses a
        // different URL scheme than this app's routes). Chat targets open the
        // side widget on the right conversation; everything else routes.
        const target = resolveNotificationTarget(notification);
        if (!target) return;
        if ('chatConversationId' in target) {
            triggerChatOpen('conversations', target.chatConversationId);
        } else {
            router.push(target.href);
        }
    };

    return (
        <div className={styles.container} ref={menuRef}>
            <button className={buttonClassName} onClick={() => setIsOpen(!isOpen)}>
                {unreadCount > 0 && (
                    <span className={badgeClassName} aria-hidden="true">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
                <Bell size={20} />
            </button>

            {isOpen && (
                <div className={styles.menuPanel(isRtl)}>
                    <div className={styles.header}>
                        <div className={styles.titleWrap}>
                            <h3 className={styles.title}>{t('title')}</h3>
                            {unreadCount > 0 && (
                                <span className={styles.countPill}>{unreadCount}</span>
                            )}
                        </div>
                        <div className={styles.headerActions}>
                            <button
                                onClick={() => markAllRead.mutate()}
                                disabled={unreadCount === 0}
                                className={styles.iconBtn}
                                aria-label={t('markAllRead')}
                                title={t('markAllRead')}
                            >
                                <CheckCheck size={16} />
                            </button>
                            <button
                                onClick={() => clearAll.mutate()}
                                disabled={notifications.length === 0}
                                className={styles.iconBtn}
                                aria-label={t('clearAll')}
                                title={t('clearAll')}
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={styles.closeBtn}
                                aria-label={t('close')}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.listWrapper}>
                        {isLoading ? (
                            <div className={styles.emptyState}>{t('loading')}</div>
                        ) : notifications.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Bell size={28} className="text-foreground/20" />
                                {t('noNotifications')}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((notif) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notification={notif}
                                        locale={locale}
                                        onClick={() => handleItemClick(notif)}
                                        onDelete={() => deleteOne.mutate(notif.id)}
                                        deleteLabel={t('delete')}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
