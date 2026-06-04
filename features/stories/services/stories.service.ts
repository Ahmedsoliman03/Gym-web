import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Story, StoryViewersResponse } from '../types';

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
            queryClient.invalidateQueries({ queryKey: ['stories', 'mine'] });
        },
    });
};

export const getStories = async (): Promise<Story[]> => {
    const { data } = await api.get<Story[]>('/api/community/stories?scope=all');
    return data;
};

export const useStories = (enabled = true) => {
    // Stories require an authenticated session. Use the non-HttpOnly `user_type`
    // cookie set by the backend proxy as a "we have a session" hint so logged-out
    // visitors on /gyms or /coaches don't fire 401s and don't see a bar. Callers
    // can further gate this by passing `enabled=false` (e.g., when the profile
    // query has not yet confirmed the user is authenticated).
    const isPossiblyLoggedIn =
        typeof document !== 'undefined' && /(?:^|;\s*)user_type=/.test(document.cookie);
    return useQuery<Story[]>({
        queryKey: ['stories'],
        queryFn: getStories,
        enabled: enabled && isPossiblyLoggedIn,
    });
};

export const getMyStories = async (): Promise<Story[]> => {
    const { data } = await api.get<Story[]>('/api/community/stories/mine');
    return data;
};

export const useMyStories = (enabled = true) => {
    const isPossiblyLoggedIn =
        typeof document !== 'undefined' && /(?:^|;\s*)user_type=/.test(document.cookie);
    return useQuery<Story[]>({
        queryKey: ['stories', 'mine'],
        queryFn: getMyStories,
        enabled: enabled && isPossiblyLoggedIn,
    });
};

export const deleteStory = async (storyId: string): Promise<void> => {
    await api.delete(`/api/community/stories/${storyId}`);
};

export const useDeleteStoryMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteStory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stories'] });
            queryClient.invalidateQueries({ queryKey: ['stories', 'mine'] });
        },
    });
};

export const reportStory = async ({
    storyId,
    reason,
}: {
    storyId: string;
    reason: string;
}): Promise<void> => {
    await api.post(`/api/community/stories/${storyId}/report`, { reason });
};

export const useReportStoryMutation = () => {
    return useMutation({ mutationFn: reportStory });
};

export const getStoryViewers = async (storyId: string): Promise<StoryViewersResponse> => {
    const { data } = await api.get<StoryViewersResponse>(
        `/api/community/stories/${storyId}/viewers`,
    );
    return data;
};

export const useStoryViewers = (storyId: string | null, enabled = true) => {
    return useQuery<StoryViewersResponse>({
        queryKey: ['stories', 'viewers', storyId],
        queryFn: () => getStoryViewers(storyId as string),
        enabled: enabled && !!storyId,
    });
};
