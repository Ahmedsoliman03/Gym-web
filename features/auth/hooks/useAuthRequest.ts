'use client';

import {
    useRequestAccessMutation,
    useActivateMutation,
    useResendActivationMutation,
    useUpdateCommunicationPreferenceMutation
} from '../services/auth.service';
import {
    RequestAccessRequest,
    ActivateRequest,
    ResendActivationRequest,
    UpdateCommunicationPreferenceRequest
} from '../types';

export const useAuthRequest = () => {
    const requestAccessMutation = useRequestAccessMutation();
    const activateMutation = useActivateMutation();
    const resendActivationMutation = useResendActivationMutation();
    const updateCommunicationPreferenceMutation = useUpdateCommunicationPreferenceMutation();

    const requestAccess = async (values: RequestAccessRequest) => {
        return await requestAccessMutation.mutateAsync(values);
    };

    const activate = async (values: ActivateRequest) => {
        return await activateMutation.mutateAsync(values);
    };

    const resendActivation = async (values: ResendActivationRequest) => {
        return await resendActivationMutation.mutateAsync(values);
    };

    const updateCommunicationPreference = async (values: UpdateCommunicationPreferenceRequest) => {
        return await updateCommunicationPreferenceMutation.mutateAsync(values);
    };

    return {
        requestAccess,
        activate,
        resendActivation,
        updateCommunicationPreference,
        isLoading: requestAccessMutation.isPending || activateMutation.isPending,
        requestAccessMutation,
        activateMutation,
        resendActivationMutation,
        updateCommunicationPreferenceMutation
    };
};
