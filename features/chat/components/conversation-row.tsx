'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useChatSocket } from '../socket/chat-socket-provider';
import { useDeleteConversationsMutation } from '../services/chat.service';
import type { ChatConversation } from '../types';
import { pickOtherUser } from '../utils/format';
import { formatWhen } from '@/utils/format';
import { ChatRowAvatar } from './chat-row-avatar';
import { ChatProfileLink } from './chat-profile-link';

const styles = {
    wrap: 'relative group',
    conversationCard:
        'w-full rounded-2xl border border-white/10 bg-surface/40 p-3 pe-10 flex items-center gap-3 hover:bg-surface/70 transition-colors',
    // The conversation-open hit area (everything except the avatar, which links
    // to the participant's profile instead).
    openArea: 'flex-1 min-w-0 flex items-center gap-3 text-left',
    rowInfo: 'flex-1 min-w-0',
    rowName: 'text-sm font-bold truncate',
    conversationPreview: 'text-[12px] text-foreground/60 truncate',
    conversationMeta: 'flex flex-col items-end gap-1 shrink-0',
    conversationTime: 'text-[10px] text-foreground/40',
    unreadBadge:
        'min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center',
    deleteBtn:
        'absolute top-1/2 -translate-y-1/2 end-2 p-1.5 rounded-lg text-foreground/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all',
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
    const deleteMutation = useDeleteConversationsMutation();
    const [confirmOpen, setConfirmOpen] = useState(false);

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

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync([conversation.id]);
            toast.success(t('deleteConversationSuccessToast'));
            setConfirmOpen(false);
        } catch {
            toast.error(t('deleteConversationErrorToast'));
        }
    };

    return (
        <div className={styles.wrap}>
            <div className={styles.conversationCard}>
                {/* Avatar links to the participant's public profile; the rest of
                    the row opens the conversation. Kept as separate hit areas so
                    an <a> isn't nested inside the open <button>. */}
                <ChatProfileLink user={other}>
                    <ChatRowAvatar
                        photo={other?.photo}
                        name={other?.fullName ?? ''}
                        status={status}
                    />
                </ChatProfileLink>
                <button
                    type="button"
                    className={styles.openArea}
                    onClick={() => onOpen?.(conversation.id)}
                >
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
            </div>

            <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => setConfirmOpen(true)}
                aria-label={t('deleteConversation')}
            >
                <Trash2 size={16} />
            </button>

            <ConfirmDialog
                isOpen={confirmOpen}
                title={t('deleteConversation')}
                body={t('deleteConversationConfirm')}
                cancelLabel={t('deleteConversationCancel')}
                confirmLabel={t('deleteConversationConfirmCta')}
                submittingLabel={t('deletingConversation')}
                isSubmitting={deleteMutation.isPending}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};
