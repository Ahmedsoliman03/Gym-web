import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { UserProfile } from '../types';



export const getProfile = async (): Promise<UserProfile> => {
    const { data } = await api.get('/api/me');
    return data;
};

export const updateProfile = async (payload: FormData): Promise<UserProfile> => {
    const { data } = await api.patch('/api/me', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const useProfileQuery = () => {
    // The `user_type` cookie is set by the backend proxy on login and cleared
    // on logout. Use its presence as a "we have a session" hint so logged-out
    // users on public pages don't churn 401s against /api/me.
    const isPossiblyLoggedIn =
        typeof document !== 'undefined' && /(?:^|;\s*)user_type=/.test(document.cookie);
    return useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        enabled: isPossiblyLoggedIn,
    });
};

export const useUpdateProfileMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(['profile'], data);
            queryClient.setQueryData(['session'], data);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['session'] });
        },
    });
};
