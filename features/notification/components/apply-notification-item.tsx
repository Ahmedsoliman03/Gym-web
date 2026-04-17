"use client";

import { Dumbbell } from "lucide-react";

interface ApplyNotificationItemProps {
    title: string;
    desc: string;
    time: string;
    isUnread?: boolean;
    onClick?: () => void;
}

const styles = {
    container: (isUnread: boolean) => `p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${isUnread ? 'bg-primary/5' : ''}`,
    iconWrapper: "w-10 h-10 rounded-full flex shrink-0 items-center justify-center bg-primary/20 text-primary",
    content: "flex-1 min-w-0",
    header: "flex items-center justify-between gap-2 mb-1",
    title: "text-sm font-bold truncate text-foreground",
    time: "text-[10px] whitespace-nowrap text-foreground/40 font-medium",
    desc: "text-xs text-foreground/70 line-clamp-2 leading-relaxed",
    unreadBadge: "w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
};

export const ApplyNotificationItem = ({
    title,
    desc,
    time,
    isUnread = false,
    onClick
}: ApplyNotificationItemProps) => {
    return (
        <div 
            onClick={onClick}
            className={styles.container(isUnread)}
        >
            <div className={styles.iconWrapper}>
                <Dumbbell size={18} />
            </div>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h4 className={styles.title}>{title}</h4>
                    <span className={styles.time}>{time}</span>
                </div>
                <p className={styles.desc}>
                    {desc}
                </p>
            </div>
            {isUnread && (
                <div className={styles.unreadBadge} />
            )}
        </div>
    );
};

