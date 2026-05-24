'use client';

import { 
    useRequestAccessMutation, 
    useActivateMutation
} from '../services/auth.service';
import {
    RequestAccessRequest,
    ActivateRequest 
} from '../types';

export const useAuthRequest = () => {
    const requestAccessMutation = useRequestAccessMutation();
    const activateMutation = useActivateMutation();

    const requestAccess = async (values: RequestAccessRequest) => {
        return await requestAccessMutation.mutateAsync(values);
    };

    const activate = async (values: ActivateRequest) => {
        return await activateMutation.mutateAsync(values);
    };

    return {
        requestAccess,
        activate,
        isLoading: requestAccessMutation.isPending || activateMutation.isPending,
        requestAccessMutation,
        activateMutation
    };
};
