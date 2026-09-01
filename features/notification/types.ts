export type NotificationType =
    | 'post_vote'
    | 'post_share'
    | 'post_save'
    | 'post_comment'
    | 'comment_vote'
    | 'comment_reply'
    | 'reply_vote'
    | 'job_application'
    | 'job_save';

export interface NotificationActor {
    id: string;
    profileId?: string;
    fullName: string;
    userType: 'client' | 'coach' | 'gym';
    photo: string | null;
    city?: string;
    area?: string;
}

export interface NotificationData {
    postId?: string;
    shareId?: string;
    commentId?: string;
    replyId?: string;
    jobId?: string;
    applicationId?: string;
    vote?: 'up' | 'down';
}

export interface AppNotification {
    id: string;
    type: NotificationType;
    actor: NotificationActor | null;
    actorsCount: number;
    otherActorsCount: number;
    text: string;
    link: string;
    data: NotificationData;
    isRead: boolean;
    createdAt: string;
    lastActivityAt: string;
}

export interface NotificationListResponse {
    notifications: AppNotification[];
    unreadCount: number;
}
