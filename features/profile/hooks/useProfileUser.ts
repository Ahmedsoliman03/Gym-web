'use client';

import { useProfileQuery, useUpdateProfileMutation } from '../services/profile.service';

export const useProfileUser = () => {
    const profileQuery = useProfileQuery();
    const updateProfileMutation = useUpdateProfileMutation();

    const updateProfile = async (payload: FormData) => {
        return await updateProfileMutation.mutateAsync(payload);
    };

    return {
        profile: profileQuery.data,
        isLoading: profileQuery.isLoading || updateProfileMutation.isPending,
        error: profileQuery.error,
        updateProfile,
        profileQuery,
        updateProfileMutation
    };
};
