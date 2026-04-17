"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ChatNotificationItem } from "./chat-notification-item";
import { ApplyNotificationItem } from "./apply-notification-item";

export const NotificationsMenu = ({ 
    buttonClassName, 
    badgeClassName 
}: { 
    buttonClassName: string; 
    badgeClassName: string; 
}) => {
    const t = useTranslations('Notifications');
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const locale = useLocale();
    const isRtl = locale === 'ar';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const notifications = [
        {
            id: 1,
            type: 'chat',
            title: t('chatTitle'),
            desc: t('chatDesc'),
            time: t('time5m'),
            isUnread: true
        },
        {
            id: 2,
            type: 'coach_apply',
            title: t('coachApplyTitle'),
            desc: t('coachApplyDesc'),
            time: t('time1h'),
            isUnread: true
        }
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button className={buttonClassName} onClick={() => setIsOpen(!isOpen)}>
                <span className={badgeClassName} />
                <Bell size={20} />
            </button>

            {isOpen && (
                <div className={`absolute ${isRtl ? 'left-0' : 'right-0'} top-full mt-2 w-80 sm:w-96 bg-surface border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden animate-in fade-in slide-in-from-top-2`}>
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-foreground">
                            {t('title')}
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-foreground/40 hover:text-foreground">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-foreground/40 text-sm">
                                {t('noNotifications')}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((notif) => (
                                    notif.type === 'chat' ? (
                                        <ChatNotificationItem 
                                            key={notif.id}
                                            title={notif.title}
                                            desc={notif.desc}
                                            time={notif.time}
                                            isUnread={notif.isUnread}
                                            onClick={() => setIsOpen(false)}
                                        />
                                    ) : (
                                        <ApplyNotificationItem 
                                            key={notif.id}
                                            title={notif.title}
                                            desc={notif.desc}
                                            time={notif.time}
                                            isUnread={notif.isUnread}
                                            onClick={() => setIsOpen(false)}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-white/5 bg-background text-center">
                            <button className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                                {t('viewPrevious')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
