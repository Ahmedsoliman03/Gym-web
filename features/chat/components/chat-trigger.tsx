'use client';

import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { triggerChatOpen } from '../hooks/use-chat';
import { usePendingIncomingCount } from '../hooks/use-pending-incoming-count';

interface ChatTriggerProps {
    buttonClassName: string;
    badgeClassName: string;
}

/** Navbar chat icon — opens the side chat widget and surfaces a count badge
 *  for pending incoming requests so the recipient can spot them without
 *  hunting through the panel. */
export const ChatTrigger = ({ buttonClassName, badgeClassName }: ChatTriggerProps) => {
    const t = useTranslations('Chat');
    const pending = usePendingIncomingCount();

    return (
        <button
            type="button"
            className={buttonClassName}
            onClick={() => triggerChatOpen()}
            aria-label={t('requestsTitle')}
            title={t('requestsTitle')}
        >
            {pending > 0 && (
                <span className={badgeClassName} aria-hidden="true">
                    {pending > 9 ? '9+' : pending}
                </span>
            )}
            <MessageSquare size={20} />
        </button>
    );
};
