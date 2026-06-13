'use client';

import { useConversations } from '../services/chat.service';
import { useChatSocket } from '../socket/chat-socket-provider';

/** Total unread messages across every conversation. Reconciles the server's
 *  `unreadCount` with the socket's live local tally (`Math.max`) so a freshly
 *  arrived message counts immediately and a stale refetch can't zero it. */
export const useChatUnreadCount = (): number => {
    const { data } = useConversations();
    const { unreadByConversation } = useChatSocket();
    if (!data) return 0;
    return data.reduce(
        (acc, c) => acc + Math.max(c.unreadCount, unreadByConversation[c.id] ?? 0),
        0,
    );
};
