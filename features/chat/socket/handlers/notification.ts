import type { QueryClient } from '@tanstack/react-query';
import {
    applyNotificationNew,
    applyNotificationRead,
    applyNotificationDeleted,
    applyNotificationsCleared,
} from '@/features/notification/services/notification.service';
import { playNotificationSound } from '@/features/notification/utils/notification-sound';
import type { AppNotification } from '@/features/notification/types';

/**
 * Builds the notification event handlers. Notifications ride the same socket as
 * chat, so they are wired here and delegate to the notification feature's cache
 * updaters.
 */
export function createNotificationHandlers(qc: QueryClient) {
    return {
        onNew: (notification: AppNotification, unreadCount: number) => {
            applyNotificationNew(qc, notification, unreadCount);
            playNotificationSound();
        },
        onRead: (notificationId: string, unreadCount: number) => {
            applyNotificationRead(qc, notificationId, unreadCount);
        },
        onDeleted: (notificationId: string, unreadCount: number) => {
            applyNotificationDeleted(qc, notificationId, unreadCount);
        },
        onClear: () => {
            applyNotificationsCleared(qc);
        },
    };
}
