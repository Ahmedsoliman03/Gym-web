import type { AppNotification } from '@/features/notification/types';

export type PresenceStatus = 'online' | 'offline' | 'busy';

export type ChatAccessRule = 'open' | 'request_required';

export type ChatRequestBox = 'incoming' | 'outgoing';

export type ChatRequestStatus = 'pending' | 'approved' | 'rejected' | 'finished';

export type ChatRequestOutcome = 'pending' | 'approved' | 'rejected';

export interface ChatUser {
    id: string;
    profileId?: string | null;
    fullName: string;
    email: string;
    phone: string;
    userType: 'client' | 'coach' | 'gym';
    photo: string | null;
    status?: PresenceStatus;
}

export interface ConversationParticipant {
    user: ChatUser;
    lastReadMessage: string | null;
    lastReadAt: string | null;
    muted: boolean;
}

export interface ChatSettings {
    manualStatus: PresenceStatus;
    allowClients: ChatAccessRule;
    allowCoaches: ChatAccessRule;
    allowGyms: ChatAccessRule;
}

export type ChatSettingsUpdate = Partial<ChatSettings>;

export interface ChatMessage {
    id: string;
    sender: ChatUser;
    body: string;
    attachment: string | null;
    clientMessageId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChatConversation {
    id: string;
    participants: ConversationParticipant[];
    lastMessage: ChatMessage | null;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChatRequest {
    id: string;
    fromUser: ChatUser;
    toUser: ChatUser;
    initialMessage: string;
    status: ChatRequestStatus;
    conversation: string | null;
    createdAt: string;
    respondedAt: string | null;
}

export type StartChatResult =
    | { status: 'conversation'; conversation: ChatConversation }
    | { status: 'request_pending';      request: ChatRequest };

export interface StartChatRequest {
    userId: string;
    initialMessage?: string;
}

export interface ConversationMessagesQuery {
    conversationId: string;
    limit?: number;
    before?: string;
}

export type ChatClientEvent =
    | { type: 'message.send';      conversationId: string; body: string; clientMessageId?: string }
    | { type: 'typing.start';      conversationId: string }
    | { type: 'typing.stop';       conversationId: string }
    | { type: 'presence.set';      status: PresenceStatus }
    | { type: 'presence.watch';    userIds: string[] }
    | { type: 'presence.heartbeat' };

export type ChatServerEvent =
    | { type: 'message.new';        conversationId: string; message: ChatMessage }
    | { type: 'message.updated';    conversationId: string; message: ChatMessage }
    | { type: 'message.deleted';    conversationId: string; messageId: string }
    | { type: 'typing.update';      conversationId: string; userId: string; isTyping: boolean }
    | { type: 'presence.update';    userId: string; status: PresenceStatus }
    | { type: 'notification.new';     notification: AppNotification; unreadCount: number }
    | { type: 'notification.read';    notificationId: string; unreadCount: number }
    | { type: 'notification.deleted'; notificationId: string; unreadCount: number }
    | { type: 'notification.clear';   unreadCount: number };
