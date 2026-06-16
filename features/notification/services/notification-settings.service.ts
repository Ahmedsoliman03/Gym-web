import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';

// Wire shape mirrors postman/README.md → "Notifications → Get/Update Notification Settings".
// The backend ignores unknown keys, so the type is closed to the documented set.
export interface NotificationPreferences {
    post_vote: boolean;
    post_comment: boolean;
    comment_reply: boolean;
    job_application: boolean;
}

export interface NotificationSettings {
    preferences: NotificationPreferences;
}

export type NotificationPreferencesPatch = Partial<NotificationPreferences>;

export const notificationSettingsKeys = {
    settings: ['notifications', 'settings'] as const,
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
    const { data } = await api.get<NotificationSettings>('/api/notifications/settings');
    return data;
};

export const useNotificationSettings = () =>
    useQuery<NotificationSettings>({
        queryKey: notificationSettingsKeys.settings,
        queryFn: getNotificationSettings,
    });

export const updateNotificationSettings = async (
    preferences: NotificationPreferencesPatch,
): Promise<NotificationSettings> => {
    const { data } = await api.patch<NotificationSettings>(
        '/api/notifications/settings',
        { preferences },
    );
    return data;
};

export const useUpdateNotificationSettingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateNotificationSettings,
        onSuccess: (settings) => {
            queryClient.setQueryData(notificationSettingsKeys.settings, settings);
        },
    });
};
