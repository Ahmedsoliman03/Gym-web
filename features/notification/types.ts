// Notification domain types. The REST contract lives in
// services/notification.service.ts; the wire shapes below mirror
// postman/README.md → "Notifications" and the `notification.*` events on the
// shared chat WebSocket (see features/chat/types.ts → ChatServerEvent).

/** Documented notification kinds. Kept in sync with the preference keys in
 *  notification-settings.service.ts (`NotificationPreferences`). The backend
 *  may introduce new kinds, so consumers must handle an unknown `type`
 *  gracefully (fall back to a generic icon). */
export type NotificationType =
    | 'chat_message'
    | 'post_vote'
    | 'post_comment'
    | 'comment_reply'
    | 'job_application';

/** Actor payload — the same Author shape returned across community endpoints
 *  (postman/README.md → "Author payload shape"). `id` is the `User.id`;
 *  `profileId` is the matching coach/gym/client profile id. */
export interface NotificationActor {
    id: string;
    profileId?: string;
    fullName: string;
    userType: 'client' | 'coach' | 'gym';
    photo: string | null;
    city?: string;
    area?: string;
}

/** Deep-link payload. Which keys are present depends on `type` — e.g. a
 *  `post_comment` carries `postId` + `commentId`, a `chat_message` carries
 *  `conversationId` + `messageId`. All optional. */
export interface NotificationData {
    postId?: string;
    commentId?: string;
    replyId?: string;
    jobId?: string;
    applicationId?: string;
    conversationId?: string;
    messageId?: string;
    /** Present on `post_vote` / `comment_*_vote` notifications. */
    vote?: 'up' | 'down';
}

/** One notification item as returned by `GET /api/notifications` and pushed
 *  on `notification.new`. `text` is pre-localized by the backend, so the UI
 *  renders it verbatim. */
export interface AppNotification {
    id: string;
    type: NotificationType;
    /** Most recent actor; null for system notifications. */
    actor: NotificationActor | null;
    /** Total distinct actors aggregated into this notification (e.g. 3 people
     *  voted on one post). */
    actorsCount: number;
    /** actorsCount minus the named actor — e.g. "Ahmed +2" → 2. */
    otherActorsCount: number;
    /** Pre-localized, ready-to-render summary line. */
    text: string;
    /** Locale-less in-app path, e.g. `/community/posts/<id>?commentId=<id>`.
     *  Push it through the locale-aware router. */
    link: string;
    data: NotificationData;
    isRead: boolean;
    createdAt: string;
    lastActivityAt: string;
}

/** `GET /api/notifications?limit=50` response. */
export interface NotificationListResponse {
    notifications: AppNotification[];
    unreadCount: number;
}
