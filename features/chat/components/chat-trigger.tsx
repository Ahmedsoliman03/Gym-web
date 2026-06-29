'use client';

import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { triggerChatOpen } from '../hooks/use-chat';
import { useChatUnreadCount } from '../hooks/use-chat-unread-count';
import { usePendingIncomingCount } from '../hooks/use-pending-incoming-count';

interface ChatTriggerProps {
    buttonClassName: string;
    /** Numeric badge for pending incoming chat requests. */
    badgeClassName: string;
    /** Positioning wrapper for the unread-messages red dot. */
    dotClassName: string;
}

export const ChatTrigger = ({ buttonClassName, badgeClassName, dotClassName }: ChatTriggerProps) => {
    const t = useTranslations('Chat');
    const pending = usePendingIncomingCount();
    const unread = useChatUnreadCount();

    return (
        <button
            type="button"
            className={buttonClassName}
            onClick={() => triggerChatOpen()}
            aria-label={t('requestsTitle')}
            title={t('requestsTitle')}
        >
            {unread > 0 && <span className={dotClassName} aria-hidden="true" />}
            {pending > 0 && (
                <span className={badgeClassName} aria-hidden="true">
                    {pending > 9 ? '9+' : pending}
                </span>
            )}
            <MessageSquare size={20} />
        </button>
    );
};
