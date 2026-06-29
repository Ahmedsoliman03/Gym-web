'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import {
    chatKeys,
    useConversationMessages,
    useConversations,
    useDeleteChatMessageMutation,
    useMarkConversationReadMutation,
    useUpdateChatMessageMutation,
} from '../services/chat.service';
import { useChatSocket } from '../socket/chat-socket-provider';
import { pickOtherUser } from '../utils/format';
import { ChatRowAvatar } from './chat-row-avatar';
import { ChatProfileLink } from './chat-profile-link';
import {
    ChatEmptyState,
    ChatErrorState,
    ChatLoadingState,
} from './chat-empty-state';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import dynamic from 'next/dynamic';

const MessageComposer = dynamic(() => import('./message-composer').then(mod => mod.MessageComposer), {
    ssr: false,
});

const styles = {
    header:
        'p-4 border-b border-white/10 flex items-center gap-3 bg-surface/50 backdrop-blur-md',
    backBtn:
        'p-2 hover:bg-white/5 rounded-full transition-colors text-foreground/70 hover:text-foreground shrink-0',
    identity: 'flex items-center gap-3 min-w-0 flex-1',
    identityLink:
        'flex items-center gap-3 min-w-0 flex-1 rounded-lg -m-1 p-1 hover:bg-white/5 transition-colors',
    nameWrap: 'min-w-0',
    name: 'text-sm font-bold truncate',
    userType: 'text-[11px] text-foreground/50 uppercase tracking-wider',
    body: 'flex-1 overflow-y-auto p-4 space-y-2',
};

const MESSAGE_DELETE_WINDOW_MS = 15 * 60 * 1000;

export const ConversationThread = ({
    conversationId,
    onBack,
}: {
    conversationId: string;
    onBack: () => void;
}) => {
    const t = useTranslations('Chat');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { profile } = useProfileUser();
    const queryClient = useQueryClient();
    const messagesQuery = useConversationMessages(conversationId);
    const markRead = useMarkConversationReadMutation();
    const deleteMessage = useDeleteChatMessageMutation();
    const updateMessage = useUpdateChatMessageMutation();
    const { clearUnread, setActiveConversation, typingByConversation, presenceByUser } =
        useChatSocket();
    const bottomRef = useRef<HTMLDivElement>(null);

    const conversationsQuery = useConversations();
    const conversation = conversationsQuery.data?.find((c) => c.id === conversationId);
    const meId = profile?.id;
    const other = conversation ? pickOtherUser(conversation, meId) : undefined;
    const otherStatus = other ? (presenceByUser[other.id] ?? other.status) : undefined;

    const otherParticipant = conversation?.participants.find(
        (p) => p.user?.id !== meId,
    );
    const otherLastReadMs = otherParticipant?.lastReadAt
        ? new Date(otherParticipant.lastReadAt).getTime()
        : 0;

    // Typing: show the indicator when someone other than me is typing here.
    const typers = typingByConversation[conversationId];
    const someoneTyping = !!typers && Array.from(typers).some((id) => id !== meId);

    useEffect(() => {
        markRead.mutate(conversationId);
        clearUnread(conversationId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    useEffect(() => {
        setActiveConversation(conversationId);
        return () => setActiveConversation(null);
    }, [conversationId, setActiveConversation]);

    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') {
                queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
            }
        }, 4000);
        return () => clearInterval(id);
    }, [queryClient]);

    const messageCount = messagesQuery.data?.length ?? 0;
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }, [messageCount, someoneTyping]);

    useEffect(() => {
        if (messageCount === 0) return;
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
            return;
        }
        markRead.mutate(conversationId);
        clearUnread(conversationId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageCount]);

    const BackIcon = isRtl ? ArrowRight : ArrowLeft;

    return (
        <>
            <div className={styles.header}>
                <button
                    type="button"
                    onClick={onBack}
                    className={styles.backBtn}
                    aria-label={t('back')}
                    title={t('back')}
                >
                    <BackIcon size={18} />
                </button>
                {/* Avatar + name link to the participant's public profile
                    (coach/gym). Clients have no public page, so ChatProfileLink
                    renders the same content un-clickable. */}
                <ChatProfileLink user={other} className={styles.identityLink}>
                    <ChatRowAvatar
                        photo={other?.photo}
                        name={other?.fullName ?? ''}
                        status={otherStatus}
                    />
                    <div className={styles.nameWrap}>
                        <div className={styles.name}>{other?.fullName}</div>
                        {other?.userType && (
                            <div className={styles.userType}>{other.userType}</div>
                        )}
                    </div>
                </ChatProfileLink>
            </div>

            <div className={styles.body}>
                {messagesQuery.isLoading ? (
                    <ChatLoadingState label={t('loading')} />
                ) : messagesQuery.isError ? (
                    <ChatErrorState label={t('loadError')} />
                ) : messageCount === 0 && !someoneTyping ? (
                    <ChatEmptyState
                        icon={<MessageSquare size={22} />}
                        label={t('noMessagesYet')}
                    />
                ) : (
                    <>
                        {messagesQuery.data?.map((m) => {
                            const mine = !!meId && m.sender?.id === meId;
                            const read =
                                mine &&
                                otherLastReadMs >=
                                    new Date(m.createdAt).getTime();
                            const canDelete =
                                mine &&
                                !m.id.startsWith('tmp:') &&
                                Date.now() - new Date(m.createdAt).getTime() <=
                                    MESSAGE_DELETE_WINDOW_MS;
                            const canEdit = canDelete && m.body.trim().length > 0;
                            const deleting =
                                deleteMessage.isPending &&
                                deleteMessage.variables?.messageId === m.id;
                            const editing =
                                updateMessage.isPending &&
                                updateMessage.variables?.messageId === m.id;
                            return (
                                <MessageBubble
                                    key={m.clientMessageId || m.id}
                                    message={m}
                                    mine={mine}
                                    read={read}
                                    canDelete={canDelete}
                                    canEdit={canEdit}
                                    deleting={deleting}
                                    editing={editing}
                                    copyLabel={t('copy')}
                                    deleteLabel={t('deleteMessage')}
                                    editLabel={t('editMessage')}
                                    saveEditLabel={t('saveEditMessage')}
                                    cancelEditLabel={t('cancelEditMessage')}
                                    editedLabel={t('editedMessage')}
                                    onDelete={() =>
                                        deleteMessage.mutate(
                                            {
                                                conversationId,
                                                messageId: m.id,
                                            },
                                            {
                                                onSuccess: () =>
                                                    toast.success(t('deleteMessageSuccessToast')),
                                                onError: () =>
                                                    toast.error(t('deleteMessageErrorToast')),
                                            },
                                        )
                                    }
                                    onEdit={(body) =>
                                        updateMessage.mutate(
                                            {
                                                conversationId,
                                                messageId: m.id,
                                                body,
                                            },
                                            {
                                                onSuccess: () =>
                                                    toast.success(t('editMessageSuccessToast')),
                                                onError: () =>
                                                    toast.error(t('editMessageErrorToast')),
                                            },
                                        )
                                    }
                                />
                            );
                        })}
                        {someoneTyping && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            <MessageComposer conversationId={conversationId} />
        </>
    );
};
