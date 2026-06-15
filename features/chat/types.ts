// Chat domain types. The REST service in services/chat.service.ts owns the
// HTTP contract; the WebSocket event shapes below mirror the realtime
// channel documented in postman/README.md (`ws://.../ws/chat/`) so the
// future socket client and the REST layer share one source of truth.

import type { AppNotification } from '@/features/notification/types';

export type PresenceStatus = 'online' | 'offline' | 'busy';

/** Who is allowed to start a chat with this user without an approval step.
 *  - `open`: direct conversation is created on `POST /api/chat/start`.
 *  - `request_required`: a pending ChatRequest is created instead. */
export type ChatAccessRule = 'open' | 'request_required';

export type ChatRequestBox = 'incoming' | 'outgoing';

/** Raw wire status. Backend may send either the explicit `approved`/`rejected`
 *  outcome OR a generic `finished` once the request has been responded to —
 *  in the latter case the actual outcome is discriminated by whether
 *  `ChatRequest.conversation` got populated. Use `getRequestOutcome` instead
 *  of switching on this directly. */
export type ChatRequestStatus = 'pending' | 'approved' | 'rejected' | 'finished';

/** Normalized outcome the UI actually renders. */
export type ChatRequestOutcome = 'pending' | 'approved' | 'rejected';

/** Minimal user shape returned inside conversations, messages, and requests
 *  (apps/chat/serializers.py:24). `id` is the `User.id` — the same id you
 *  pass to `POST /api/chat/start { userId }`. */
export interface ChatUser {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    userType: 'client' | 'coach' | 'gym';
    /** Absolute URL or null. */
    photo: string | null;
    /** Realtime presence — backed by the `presence.update` WS event. May be
     *  missing on initial REST responses and only filled in once the socket
     *  delivers an update. */
    status?: PresenceStatus;
}

/** One side of a conversation. The endpoint does NOT flag which participant
 *  is the current user, so consumers must match `user.id` against `/api/me`. */
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
    /** Echoed back on `message.new` for the original sender so optimistic
     *  messages can be reconciled with the server-confirmed copy. The wire
     *  represents "not set" as an empty string, not null (matches the partial
     *  unique constraint in apps/chat/models.py:196). */
    clientMessageId: string;
    createdAt: string;
}

export interface ChatConversation {
    id: string;
    /** Both sides. The endpoint does not flag which one is the current user —
     *  consumers must filter by `participant.user.id !== meId`. */
    participants: ConversationParticipant[];
    lastMessage: ChatMessage | null;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChatRequest {
    id: string;
    /** Sender of the request. On `?box=incoming`, this is the other person
     *  asking to chat with you; on `?box=outgoing`, this is you. */
    fromUser: ChatUser;
    /** Recipient. On `?box=incoming`, this is you; on `?box=outgoing`, this
     *  is the person you asked. */
    toUser: ChatUser;
    status: ChatRequestStatus;
    /** Conversation id, populated once the request is approved. */
    conversation: string | null;
    createdAt: string;
    respondedAt: string | null;
}

/** `POST /api/chat/start` returns one of two shapes depending on the
 *  target's access rule: a ready-to-use conversation, or a pending request
 *  the target still needs to approve. The discriminator on the wire is
 *  `status` (not `kind`). */
export type StartChatResult =
    | { status: 'conversation'; conversation: ChatConversation }
    | { status: 'request_pending';      request: ChatRequest };

export interface StartChatRequest {
    userId: string;
}

export interface ConversationMessagesQuery {
    conversationId: string;
    limit?: number;
    /** Cursor for older-message pagination, if/when the backend adds it. */
    before?: string;
}

// ── WebSocket events ─────────────────────────────────────────────────────────
// Wire format documented in postman/README.md → "WebSocket Chat + Notifications".

export type ChatClientEvent =
    | { type: 'message.send';      conversationId: string; body: string; clientMessageId?: string }
    | { type: 'typing.start';      conversationId: string }
    | { type: 'typing.stop';       conversationId: string }
    | { type: 'presence.set';      status: PresenceStatus }
    | { type: 'presence.heartbeat' };

/** Server-pushed event over the same `/ws/chat/` socket. Notification events
 *  ride this channel too — see features/notification for their consumers. */
export type ChatServerEvent =
    | { type: 'message.new';        conversationId: string; message: ChatMessage }
    | { type: 'typing.update';      conversationId: string; userId: string; isTyping: boolean }
    | { type: 'presence.update';    userId: string; status: PresenceStatus }
    | { type: 'notification.new';     notification: AppNotification; unreadCount: number }
    | { type: 'notification.read';    notificationId: string; unreadCount: number }
    | { type: 'notification.deleted'; notificationId: string; unreadCount: number }
    | { type: 'notification.clear';   unreadCount: number };
