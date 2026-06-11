'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import {
    chatKeys,
    useConversationMessages,
    useMarkConversationReadMutation,
} from '../services/chat.service';
import type { ChatConversation } from '../types';
import { pickOtherUser } from '../utils/format';
import { ChatRowAvatar } from './chat-row-avatar';
import {
    ChatEmptyState,
    ChatErrorState,
    ChatLoadingState,
} from './chat-empty-state';
import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';

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
    const bottomRef = useRef<HTMLDivElement>(null);

    // Pull the conversation from the cached list rather than refetching it —
    // the user landed here by clicking a row, so the cache is guaranteed warm.
    const conversations =
        queryClient.getQueryData<ChatConversation[]>(chatKeys.conversations) ?? [];
    const conversation = conversations.find((c) => c.id === conversationId);
    const other = conversation ? pickOtherUser(conversation, profile?.id) : undefined;

    // Mark as read when the thread mounts (or when switching between threads).
    // The mutation's onMutate already zeroes the unread badge optimistically.
    useEffect(() => {
        markRead.mutate(conversationId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // Jump to the bottom on initial load and whenever new messages arrive.
    const messageCount = messagesQuery.data?.length ?? 0;
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' });
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
                <div className={styles.identity}>
                    <ChatRowAvatar
                        photo={other?.photo}
                        name={other?.fullName ?? ''}
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
                ) : messageCount === 0 ? (
                    <ChatEmptyState
                        icon={<MessageSquare size={22} />}
                        label={t('noMessagesYet')}
                    />
                ) : (
                    <>
                        {messagesQuery.data!.map((m) => (
                            <MessageBubble
                                // Prefer clientMessageId so the optimistic
                                // bubble keeps its mount when the server echo
                                // swaps in the real id — no flicker on send.
                                key={m.clientMessageId || m.id}
                                message={m}
                                mine={!!profile?.id && m.sender?.id === profile.id}
                            />
                        ))}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            <MessageComposer conversationId={conversationId} />
        </>
    );
};
