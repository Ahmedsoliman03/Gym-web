import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import {
    ChatConversation,
    ChatMessage,
    ChatRequest,
    ChatRequestBox,
    ChatSettings,
    ChatSettingsUpdate,
    ConversationMessagesQuery,
    StartChatRequest,
    StartChatResult,
} from '../types';

// ── Query keys ──────────────────────────────────────────────────────────────
export const chatKeys = {
    all:           ['chat'] as const,
    settings:      ['chat', 'settings'] as const,
    requests:      (box: ChatRequestBox) => ['chat', 'requests', box] as const,
    conversations: ['chat', 'conversations'] as const,
    messages:      (conversationId: string) => ['chat', 'conversations', conversationId, 'messages'] as const,
};

// ── Settings ────────────────────────────────────────────────────────────────

export const getChatSettings = async (): Promise<ChatSettings> => {
    const { data } = await api.get<ChatSettings>('/api/chat/settings');
    return data;
};

export const useChatSettings = () => {
    return useQuery<ChatSettings>({
        queryKey: chatKeys.settings,
        queryFn: getChatSettings,
    });
};

export const updateChatSettings = async (values: ChatSettingsUpdate): Promise<ChatSettings> => {
    const { data } = await api.patch<ChatSettings>('/api/chat/settings', values);
    return data;
};

export const useUpdateChatSettingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateChatSettings,
        onSuccess: (settings) => {
            queryClient.setQueryData(chatKeys.settings, settings);
        },
    });
};

// ── Start chat ──────────────────────────────────────────────────────────────

export const startChat = async (values: StartChatRequest): Promise<StartChatResult> => {
    const { data } = await api.post<StartChatResult>('/api/chat/start', values);
    return data;
};


/** Prepend a conversation into the cached list, deduping by id and moving an
 *  existing entry to the top. Used by start-chat and approve so the
 *  Conversations tab shows the row instantly — without waiting on (or
 *  depending on) a `/api/chat/conversations` refetch. */
const upsertConversationToTop = (
    queryClient: ReturnType<typeof useQueryClient>,
    conversation: ChatConversation,
) => {
    queryClient.setQueryData<ChatConversation[]>(
        chatKeys.conversations,
        (prev) => {
            if (!prev) return [conversation];
            const rest = prev.filter((c) => c.id !== conversation.id);
            return [conversation, ...rest];
        },
    );
};

export const useStartChatMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: startChat,
        onSuccess: (result) => {
            if (result.status === 'conversation') {
                // 1. Seed the cache so the new row appears instantly when the
                //    panel opens — no refetch round-trip required.
                upsertConversationToTop(queryClient, result.conversation);
                // 2. Force a refetch (not just invalidate) so the server's
                //    authoritative list overwrites our optimistic seed and a
                //    `/api/chat/conversations` request is guaranteed to fire.
                queryClient.refetchQueries({ queryKey: chatKeys.conversations });
            } else {
                queryClient.refetchQueries({ queryKey: chatKeys.requests('outgoing') });
            }
        },
    });
};

// ── Chat requests ───────────────────────────────────────────────────────────

export const getChatRequests = async (box: ChatRequestBox): Promise<ChatRequest[]> => {
    const { data } = await api.get<ChatRequest[]>('/api/chat/requests', { params: { box } });
    return data;
};

export const useChatRequests = (box: ChatRequestBox) => {
    return useQuery<ChatRequest[]>({
        queryKey: chatKeys.requests(box),
        queryFn: () => getChatRequests(box),
    });
};

export const approveChatRequest = async (id: string): Promise<ChatConversation> => {
    const { data } = await api.post<ChatConversation>(`/api/chat/requests/${id}/approve`);
    return data;
};

export const useApproveChatRequestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: approveChatRequest,
        onSuccess: (conversation) => {
            // Same pattern as `useStartChatMutation`: seed the new conversation
            // into the cache for instant UI, then force a refetch so the
            // network call actually happens and we resync with the server.
            upsertConversationToTop(queryClient, conversation);
            queryClient.refetchQueries({ queryKey: chatKeys.requests('incoming') });
            queryClient.refetchQueries({ queryKey: chatKeys.conversations });
        },
    });
};

export const rejectChatRequest = async (id: string): Promise<void> => {
    await api.post(`/api/chat/requests/${id}/reject`);
};

export const useRejectChatRequestMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: rejectChatRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.requests('incoming') });
        },
    });
};

// ── Conversations ───────────────────────────────────────────────────────────

export const getConversations = async (): Promise<ChatConversation[]> => {
    const { data } = await api.get<ChatConversation[]>('/api/chat/conversations');
    return data;
};

export const useConversations = () => {
    return useQuery<ChatConversation[]>({
        queryKey: chatKeys.conversations,
        queryFn: getConversations,
    });
};

export const getConversationMessages = async ({
    conversationId,
    limit = 50,
    before,
}: ConversationMessagesQuery): Promise<ChatMessage[]> => {
    const { data } = await api.get<ChatMessage[]>(
        `/api/chat/conversations/${conversationId}/messages`,
        { params: { limit, ...(before ? { before } : {}) } }
    );
    // The endpoint returns newest-first; reverse to oldest-first so the thread
    // reads top→bottom and socket/optimistic appends land at the bottom.
    return [...data].reverse();
};

export const useConversationMessages = (conversationId: string, limit = 50) => {
    return useQuery<ChatMessage[]>({
        queryKey: chatKeys.messages(conversationId),
        queryFn: () => getConversationMessages({ conversationId, limit }),
        enabled: Boolean(conversationId),
    });
};

export const markConversationRead = async (conversationId: string): Promise<void> => {
    await api.post(`/api/chat/conversations/${conversationId}/read`);
};

export const useMarkConversationReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markConversationRead,
        onMutate: async (conversationId: string) => {
            // Zero out unreadCount in the cached list right away — the socket
            // will deliver the authoritative count later via notification.*.
            await queryClient.cancelQueries({ queryKey: chatKeys.conversations });
            const previous = queryClient.getQueryData<ChatConversation[]>(chatKeys.conversations);
            if (previous) {
                queryClient.setQueryData<ChatConversation[]>(
                    chatKeys.conversations,
                    previous.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
                );
            }
            return { previous };
        },
        onError: (_err, _id, ctx) => {
            if (ctx?.previous) {
                queryClient.setQueryData(chatKeys.conversations, ctx.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
        },
    });
};
