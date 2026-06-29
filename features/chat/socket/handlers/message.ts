import type { QueryClient } from '@tanstack/react-query';
import { chatKeys } from '../../services/chat.service';
import { playNewMessageSound } from '../../utils/notification-sound';
import type { ChatConversation, ChatMessage } from '../../types';
import type { UserProfile } from '@/features/profile/types';

interface MessageHandlerDeps {
    // Whether the user is actively looking at this conversation right now.
    isViewingConversation: (conversationId: string) => boolean;
    // Increment the local unread tally for a conversation.
    bumpUnread: (conversationId: string) => void;
}

export function createMessageHandlers(qc: QueryClient, deps: MessageHandlerDeps) {
    const applyMessageNew = (conversationId: string, message: ChatMessage) => {
        const me = qc.getQueryData<UserProfile>(['profile']);
        const isMine = !!me && message.sender?.id === me.id;
        const isViewingThisChat = deps.isViewingConversation(conversationId);
        // A message I sent, or one in the chat I'm watching, is never unread.
        const countsAsUnread = !isMine && !isViewingThisChat;

        qc.setQueryData<ChatMessage[]>(chatKeys.messages(conversationId), (prev) => {
            if (!prev) return prev;
            if (message.clientMessageId) {
                const idx = prev.findIndex(
                    (m) => m.clientMessageId && m.clientMessageId === message.clientMessageId,
                );
                if (idx !== -1) {
                    const next = prev.slice();
                    next[idx] = message;
                    return next;
                }
            }
            if (prev.some((m) => m.id === message.id)) return prev;
            return [...prev, message];
        });

        qc.setQueryData<ChatConversation[]>(chatKeys.conversations, (prev) => {
            if (!prev) return prev;
            const idx = prev.findIndex((c) => c.id === conversationId);
            if (idx === -1) {
                qc.invalidateQueries({ queryKey: chatKeys.conversations });
                return prev;
            }
            const conv = prev[idx];
            const updated: ChatConversation = {
                ...conv,
                lastMessage: message,
                updatedAt: message.createdAt,
                unreadCount: countsAsUnread ? conv.unreadCount + 1 : conv.unreadCount,
            };
            return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
        });

        if (countsAsUnread) {
            deps.bumpUnread(conversationId);
            // Audible alert for the incoming message (gym boxing-bell).
            playNewMessageSound();
        }
    };

    const applyMessageUpdated = (conversationId: string, message: ChatMessage) => {
        qc.setQueryData<ChatMessage[] | undefined>(
            chatKeys.messages(conversationId),
            (prev) => prev?.map((m) => (m.id === message.id ? message : m)),
        );
        qc.setQueryData<ChatConversation[] | undefined>(chatKeys.conversations, (prev) =>
            prev?.map((conversation) =>
                conversation.lastMessage?.id === message.id
                    ? { ...conversation, lastMessage: message }
                    : conversation,
            ),
        );
    };

    const applyMessageDeleted = (conversationId: string, messageId: string) => {
        qc.setQueryData<ChatMessage[] | undefined>(
            chatKeys.messages(conversationId),
            (prev) => prev?.filter((m) => m.id !== messageId),
        );
        qc.invalidateQueries({ queryKey: chatKeys.conversations });
    };

    return { applyMessageNew, applyMessageUpdated, applyMessageDeleted };
}
