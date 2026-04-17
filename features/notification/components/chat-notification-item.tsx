"use client";

import { MessageSquare } from "lucide-react";

interface ChatNotificationItemProps {
    title: string;
    desc: string;
    time: string;
    isUnread?: boolean;
    onClick?: () => void;
}

export const ChatNotificationItem = ({
    title,
    desc,
    time,
    isUnread,
    onClick
}: ChatNotificationItemProps) => {
    return (
        <div 
            onClick={onClick}
            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 ${isUnread ? 'bg-primary/5' : ''}`}
        >
            <div className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center bg-blue-500/20 text-blue-500">
                <MessageSquare size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold truncate text-foreground">{title}</h4>
                    <span className="text-[10px] whitespace-nowrap text-foreground/40 font-medium">{time}</span>
                </div>
                <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed">
                    {desc}
                </p>
            </div>
            {isUnread && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            )}
        </div>
    );
};
