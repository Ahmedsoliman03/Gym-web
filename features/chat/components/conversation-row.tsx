'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { useChatSocket } from '../socket/chat-socket-provider';
import type { ChatConversation } from '../types';
import { pickOtherUser } from '../utils/format';
import { formatWhen } from '@/utils/format';
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
    const { unreadByConversation, presenceByUser } = useChatSocket();
    const other = pickOtherUser(conversation, profile?.id);
    // Prefer the live socket presence; fall back to the status baked into the
    // REST payload (may be stale or missing until the socket delivers one).
    const status = other ? (presenceByUser[other.id] ?? other.status) : undefined;

    // Reconcile the server's count with our local tally: the socket increment
    // lives in the local tally and survives conversation-list refetches, so
    // take whichever is higher.
    const unreadCount = Math.max(
        conversation.unreadCount,
        unreadByConversation[conversation.id] ?? 0,
    );

    return (
        <button
            type="button"
            className={styles.conversationCard}
            onClick={() => onOpen?.(conversation.id)}
        >
            <ChatRowAvatar
                photo={other?.photo}
                name={other?.fullName ?? ''}
                status={status}
            />
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
                {unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{unreadCount}</span>
                )}
            </div>
        </button>
    );
};
