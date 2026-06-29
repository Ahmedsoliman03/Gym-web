'use client';

import { useConversations } from '../services/chat.service';
import { useChatSocket } from '../socket/chat-socket-provider';

export const useChatUnreadCount = (): number => {
    const { data } = useConversations();
    const { unreadByConversation } = useChatSocket();
    if (!data) return 0;
    return data.reduce(
        (acc, c) => acc + Math.max(c.unreadCount, unreadByConversation[c.id] ?? 0),
        0,
    );
};
