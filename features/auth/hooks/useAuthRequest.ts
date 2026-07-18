'use client';

import {
    useRequestAccessMutation,
    useActivateMutation,
    useResendActivationMutation
} from '../services/auth.service';
import {
    RequestAccessRequest,
    ActivateRequest,
    ResendActivationRequest
} from '../types';

export const useAuthRequest = () => {
    const requestAccessMutation = useRequestAccessMutation();
    const activateMutation = useActivateMutation();
    const resendActivationMutation = useResendActivationMutation();

    const requestAccess = async (values: RequestAccessRequest) => {
        return await requestAccessMutation.mutateAsync(values);
    };

    const activate = async (values: ActivateRequest) => {
        return await activateMutation.mutateAsync(values);
    };

    const resendActivation = async (values: ResendActivationRequest) => {
        return await resendActivationMutation.mutateAsync(values);
    };

    return {
        requestAccess,
        activate,
        resendActivation,
        isLoading: requestAccessMutation.isPending || activateMutation.isPending,
        requestAccessMutation,
        activateMutation,
        resendActivationMutation
    };
};
