import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Story } from '../types';

export const createStory = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('durationHours', '24');
    formData.append('media', file);

    await api.post('/api/community/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const useCreateStoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createStory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stories'] });
        },
    });
};

export const getStories = async (): Promise<Story[]> => {
    const { data } = await api.get<Story[]>('/api/community/stories');
    return data;
};

export const useStories = () => {
    // Stories require an authenticated session. Use the non-HttpOnly `user_type`
    // cookie set by the backend proxy as a "we have a session" hint so logged-out
    // visitors on /gyms or /coaches don't fire 401s and don't see a bar.
    const isPossiblyLoggedIn =
        typeof document !== 'undefined' && /(?:^|;\s*)user_type=/.test(document.cookie);
    return useQuery<Story[]>({
        queryKey: ['stories'],
        queryFn: getStories,
        enabled: isPossiblyLoggedIn,
    });
};
