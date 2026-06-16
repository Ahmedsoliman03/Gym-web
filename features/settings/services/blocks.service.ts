import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/utils/axios';

export interface BlockedUser {
    id: string;
    profileId: string | null;
    fullName: string;
    userType: 'client' | 'coach' | 'gym' | 'admin';
    photo: string | null;
    city: string;
    area: string;
}

export interface UserBlock {
    id: string;
    blockedUser: BlockedUser;
    createdAt: string;
}

export const blockKeys = {
    all: ['blocks'] as const,
};

export const getBlockedUsers = async (): Promise<UserBlock[]> => {
    const { data } = await api.get<UserBlock[]>('/api/blocks');
    return data;
};

export const blockUser = async (userId: string): Promise<UserBlock> => {
    const { data } = await api.post<UserBlock>('/api/blocks', { userId });
    return data;
};

export const unblockUser = async (userId: string): Promise<void> => {
    await api.delete(`/api/blocks/${userId}`);
};

export const useBlockedUsersQuery = () => {
    return useQuery({
        queryKey: blockKeys.all,
        queryFn: getBlockedUsers,
    });
};

export const useBlockUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: blockUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blockKeys.all });
            queryClient.invalidateQueries({ queryKey: ['coaches'] });
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
            queryClient.invalidateQueries({ queryKey: ['community'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
        },
    });
};

export const useUnblockUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: unblockUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blockKeys.all });
            queryClient.invalidateQueries({ queryKey: ['coaches'] });
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
            queryClient.invalidateQueries({ queryKey: ['community'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
        },
    });
};
