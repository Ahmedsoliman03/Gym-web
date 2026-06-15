import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import type { AppNotification, NotificationListResponse } from '../types';

// ── Query keys ────────────────────────────────────────────────────────────────
export const notificationKeys = {
    all: ['notifications'] as const,
    // Partial key matching every paginated list (any `limit`). Deliberately
    // narrower than `all` so cache patches never touch the settings query at
    // ['notifications', 'settings'].
    lists: ['notifications', 'list'] as const,
    list: (limit: number) => ['notifications', 'list', limit] as const,
};

const DEFAULT_LIMIT = 50;

// ── List ──────────────────────────────────────────────────────────────────────

/** Raw wire shape: the list lives under `results` (not `notifications`) and the
 *  count under `unreadCount`. Normalized to `NotificationListResponse` here so
 *  the rest of the app — and the socket cache patchers — speak one shape. */
interface NotificationListWire {
    unreadCount?: number;
    results?: AppNotification[];
}

export const getNotifications = async (limit = DEFAULT_LIMIT): Promise<NotificationListResponse> => {
    const { data } = await api.get<NotificationListWire>('/api/notifications', {
        params: { limit },
    });
    return {
        notifications: data.results ?? [],
        unreadCount: data.unreadCount ?? 0,
    };
};

export const useNotificationsQuery = (limit = DEFAULT_LIMIT) =>
    useQuery<NotificationListResponse>({
        queryKey: notificationKeys.list(limit),
        queryFn: () => getNotifications(limit),
    });

// ── Cache helpers ─────────────────────────────────────────────────────────────
// All cache mutations funnel through these so the REST mutations and the
// realtime socket events (chat-socket-provider) stay consistent. They patch
// every cached list page (keyed by limit) via a partial-key match.

type ListUpdater = (prev: NotificationListResponse) => NotificationListResponse;

const patchLists = (qc: QueryClient, update: ListUpdater) => {
    qc.setQueriesData<NotificationListResponse>(
        { queryKey: notificationKeys.lists },
        (prev) => (prev?.notifications ? update(prev) : prev),
    );
};

const recountUnread = (notifications: AppNotification[]) =>
    notifications.reduce((acc, n) => (n.isRead ? acc : acc + 1), 0);

/** Prepend (or move-to-top) an incoming notification and bump unread.
 *  `unreadCount` from the server is authoritative when provided. */
export const applyNotificationNew = (
    qc: QueryClient,
    notification: AppNotification,
    unreadCount?: number,
) => {
    patchLists(qc, (prev) => {
        const rest = prev.notifications.filter((n) => n.id !== notification.id);
        const notifications = [notification, ...rest];
        return {
            notifications,
            unreadCount: unreadCount ?? recountUnread(notifications),
        };
    });
};

export const applyNotificationRead = (
    qc: QueryClient,
    notificationId: string,
    unreadCount?: number,
) => {
    patchLists(qc, (prev) => {
        const notifications = prev.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n,
        );
        return { notifications, unreadCount: unreadCount ?? recountUnread(notifications) };
    });
};

export const applyAllNotificationsRead = (qc: QueryClient) => {
    patchLists(qc, (prev) => ({
        notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
    }));
};

export const applyNotificationDeleted = (
    qc: QueryClient,
    notificationId: string,
    unreadCount?: number,
) => {
    patchLists(qc, (prev) => {
        const notifications = prev.notifications.filter((n) => n.id !== notificationId);
        return { notifications, unreadCount: unreadCount ?? recountUnread(notifications) };
    });
};

export const applyNotificationsCleared = (qc: QueryClient) => {
    patchLists(qc, () => ({ notifications: [], unreadCount: 0 }));
};

// ── Mutations ─────────────────────────────────────────────────────────────────

export const markNotificationRead = async (id: string): Promise<void> => {
    await api.post(`/api/notifications/${id}/read`);
};

export const useMarkNotificationReadMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: markNotificationRead,
        // Optimistic: flip read immediately; the socket's notification.read
        // (with authoritative unreadCount) reconciles right after.
        onMutate: (id: string) => applyNotificationRead(qc, id),
    });
};

export const markAllNotificationsRead = async (): Promise<void> => {
    await api.post('/api/notifications/read-all');
};

export const useMarkAllNotificationsReadMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: markAllNotificationsRead,
        onMutate: () => applyAllNotificationsRead(qc),
    });
};

export const deleteNotification = async (id: string): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
};

export const useDeleteNotificationMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteNotification,
        onMutate: (id: string) => applyNotificationDeleted(qc, id),
    });
};

export const clearNotifications = async (): Promise<void> => {
    await api.delete('/api/notifications');
};

export const useClearNotificationsMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: clearNotifications,
        onMutate: () => applyNotificationsCleared(qc),
    });
};

/** Total unread across the cached notification list. */
export const useNotificationsUnreadCount = (): number => {
    const { data } = useNotificationsQuery();
    return data?.unreadCount ?? 0;
};
