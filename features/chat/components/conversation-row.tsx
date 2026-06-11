'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import type { ChatConversation } from '../types';
import { formatWhen, pickOtherUser } from '../utils/format';
import { ChatRowAvatar } from './chat-row-avatar';

const styles = {
    conversationCard:
        'w-full text-left rounded-2xl border border-white/10 bg-surface/40 p-3 flex items-center gap-3 hover:bg-surface/70 transition-colors',
    rowInfo: 'flex-1 min-w-0',
    rowName: 'text-sm font-bold truncate',
    conversationPreview: 'text-[12px] text-foreground/60 truncate',
    conversationMeta: 'flex flex-col items-end gap-1 shrink-0',
    conversationTime: 'text-[10px] text-foreground/40',
    unreadBadge:
        'min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center',
};

export const ConversationRow = ({
    conversation,
    onOpen,
}: {
    conversation: ChatConversation;
    onOpen?: (conversationId: string) => void;
}) => {
    const t = useTranslations('Chat');
    const locale = useLocale();
    // Conversation endpoint doesn't flag which participant is the current
    // user, so we match against `/api/me`'s id.
    const { profile } = useProfileUser();
    const other = pickOtherUser(conversation, profile?.id);

    return (
        <button
            type="button"
            className={styles.conversationCard}
            onClick={() => onOpen?.(conversation.id)}
        >
            <ChatRowAvatar photo={other?.photo} name={other?.fullName ?? ''} />
            <div className={styles.rowInfo}>
                <div className={styles.rowName}>{other?.fullName}</div>
                <div className={styles.conversationPreview}>
                    {conversation.lastMessage?.body ?? t('noMessagesYet')}
                </div>
            </div>
            <div className={styles.conversationMeta}>
                <span className={styles.conversationTime}>
                    {formatWhen(conversation.updatedAt, locale)}
                </span>
                {conversation.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                        {conversation.unreadCount}
                    </span>
                )}
            </div>
        </button>
    );
};
