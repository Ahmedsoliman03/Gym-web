import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';


export type SettingsSection = 'password' | 'chat' | 'notifications' | 'blocked';

interface SettingsSectionsResponse {
    sections: SettingsSection[];
}

export const getSettingsSections = async (): Promise<SettingsSection[]> => {
    const { data } = await api.get<SettingsSectionsResponse>('/api/me/settings');
    return data.sections ?? [];
};

export const useSettingsSections = () =>
    useQuery<SettingsSection[]>({
        queryKey: ['settings', 'sections'],
        queryFn: getSettingsSections,
    });
