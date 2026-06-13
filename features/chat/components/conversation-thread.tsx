'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import {
    chatKeys,
    useConversationMessages,
    useConversations,
    useMarkConversationReadMutation,
} from '../services/chat.service';
import { useChatSocket } from '../socket/chat-socket-provider';
import { pickOtherUser } from '../utils/format';
import { ChatRowAvatar } from './chat-row-avatar';
import {
    ChatEmptyState,
    ChatErrorState,
    ChatLoadingState,
} from './chat-empty-state';
import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import { TypingIndicator } from './typing-indicator';

const styles = {
    header:
        'p-4 border-b border-white/10 flex items-center gap-3 bg-surface/50 backdrop-blur-md',
    backBtn:
        'p-2 hover:bg-white/5 rounded-full transition-colors text-foreground/70 hover:text-foreground shrink-0',
    identity: 'flex items-center gap-3 min-w-0 flex-1',
    nameWrap: 'min-w-0',
    name: 'text-sm font-bold truncate',
    userType: 'text-[11px] text-foreground/50 uppercase tracking-wider',
    body: 'flex-1 overflow-y-auto p-4 space-y-2',
};

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
    const { clearUnread, typingByConversation, presenceByUser } = useChatSocket();
    const bottomRef = useRef<HTMLDivElement>(null);

    // Subscribe to the conversations cache (reactive) — NOT a one-off
    // `getQueryData` read — so the thread re-renders when the other
    // participant's `lastReadAt` advances and the read receipt can flip live.
    const conversationsQuery = useConversations();
    const conversation = conversationsQuery.data?.find((c) => c.id === conversationId);
    const meId = profile?.id;
    const other = conversation ? pickOtherUser(conversation, meId) : undefined;
    const otherStatus = other ? (presenceByUser[other.id] ?? other.status) : undefined;

    // Read receipts: a message I sent is "read" once the other participant's
    // last-read timestamp catches up to it. Derived from the conversation's
    // participants (the backend has no per-message read event).
    const otherParticipant = conversation?.participants.find(
        (p) => p.user?.id !== meId,
    );
    const otherLastReadMs = otherParticipant?.lastReadAt
        ? new Date(otherParticipant.lastReadAt).getTime()
        : 0;

    // Typing: show the indicator when someone other than me is typing here.
    const typers = typingByConversation[conversationId];
    const someoneTyping = !!typers && Array.from(typers).some((id) => id !== meId);

    // Mark as read when the thread mounts (or when switching between threads).
    // The mutation's onMutate already zeroes the unread badge optimistically.
    useEffect(() => {
        markRead.mutate(conversationId);
        clearUnread(conversationId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // Read receipts have no backend WS event, so while the thread is open we
    // refetch the conversation list on a short interval to pick up the other
    // participant's advancing `lastReadAt`. Combined with the reactive
    // `useConversations` above, the sent → read check flips within one tick of
    // them opening the message. Paused while the tab is hidden.
    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') {
                queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
            }
        }, 4000);
        return () => clearInterval(id);
    }, [queryClient]);

    // Jump to the bottom on initial load, on new messages, and when the typing
    // indicator appears.
    const messageCount = messagesQuery.data?.length ?? 0;
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
    }, [messageCount, someoneTyping]);

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
                <div className={styles.identity}>
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
                </div>
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
                            return (
                                <MessageBubble
                                    // Prefer clientMessageId so the optimistic
                                    // bubble keeps its mount when the server echo
                                    // swaps in the real id — no flicker on send.
                                    key={m.clientMessageId || m.id}
                                    message={m}
                                    mine={mine}
                                    read={read}
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
