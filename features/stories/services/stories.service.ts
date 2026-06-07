import { useEffect } from 'react';
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

/**
 * Fetch a single active story by id. The backend records/updates the current
 * user's view as a side effect of this call (per postman README), so the hook
 * intentionally fires once per story id rather than re-using cached results
 * forever — we want the "viewed" mark to land on each open.
 */
export const getStory = async (storyId: string): Promise<Story> => {
    const { data } = await api.get<Story>(`/api/community/stories/${storyId}`);
    return data;
};

export const useStoryDetails = (storyId: string | null, enabled = true) => {
    const queryClient = useQueryClient();
    const query = useQuery<Story>({
        queryKey: ['stories', 'details', storyId],
        queryFn: () => getStory(storyId as string),
        enabled: enabled && !!storyId,
        // Always refetch on open so the view-mark side effect runs and any
        // newer media replacements show up.
        staleTime: 0,
        gcTime: 0,
    });

    // The Story Details endpoint records the current user's view server-side,
    // which flips `isViewed` on subsequent list responses. Invalidate both the
    // public all-stories list AND the owner's `mine` list so any consumer (the
    // StoriesBar ring AND the owner's own profile badge) sees the new viewed
    // state right away. `exact: true` keeps us from recursively invalidating
    // this very query, which is keyed under `['stories', 'details', ...]`.
    //
    // Coach and gym DETAIL responses also embed an `active stories` array that
    // the per-profile badge reads through the `stories` prop. Those caches
    // live under `['coaches', id]` / `['gyms', id]` so the stories-key
    // invalidations above don't touch them — patch the matching story in
    // place instead so the ring color (green ↔ gray) tracks `isViewed`
    // without forcing a full coach/gym detail refetch mid-viewing.
    useEffect(() => {
        if (!query.data) return;
        const story = query.data;

        queryClient.invalidateQueries({ queryKey: ['stories'], exact: true });
        queryClient.invalidateQueries({ queryKey: ['stories', 'mine'], exact: true });

        const patchDetailEntries = (rootKey: string) => {
            const entries = queryClient.getQueriesData<unknown>({ queryKey: [rootKey] });
            for (const [key, data] of entries) {
                // Skip the list query (`[rootKey]`); only detail queries
                // (`[rootKey, id]`) carry an embedded `stories` array.
                if ((key as unknown[]).length < 2) continue;
                if (!data || typeof data !== 'object') continue;
                const detail = data as { stories?: Story[] };
                if (!Array.isArray(detail.stories)) continue;
                if (!detail.stories.some((s) => s?.id === story.id)) continue;
                queryClient.setQueryData(key, {
                    ...detail,
                    stories: detail.stories.map((s) =>
                        s?.id === story.id ? { ...s, ...story } : s,
                    ),
                });
            }
        };
        patchDetailEntries('coaches');
        patchDetailEntries('gyms');
    }, [query.data, queryClient]);

    return query;
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
