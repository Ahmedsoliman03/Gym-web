import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import {
    LoginRequest,
    RegisterRequest,
    RequestAccessRequest,
    VerifyOTPRequest,
    ActivateRequest,
    GoogleAuthRequest,
    GoogleAuthResponse,
    GoogleSignupCompleteRequest,
    ResendOtpRequest,
    ResendActivationRequest,
    RequestAccessResponse,
    UpdateCommunicationPreferenceRequest,
} from '../types';

const syncAuthenticatedUser = (
    queryClient: ReturnType<typeof useQueryClient>,
    user: unknown,
) => {
    if (!user) return;
    queryClient.setQueryData(['session'], user);
    queryClient.setQueryData(['profile'], (previous: unknown) => previous ?? user);
    void queryClient.invalidateQueries({ queryKey: ['profile'] });
    void queryClient.invalidateQueries({ queryKey: ['session'] });
};

export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: LoginRequest) => {
            const { data } = await api.post('/api/auth/login', values);
            return data;
        },
        onSuccess: (data) => {
            syncAuthenticatedUser(queryClient, data.user);
        }
    });
};

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: async (values: RegisterRequest) => {
            const { data } = await api.post('/api/auth/register', values);
            return data;
        }
    });
};

export const useGoogleAuthMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: GoogleAuthRequest): Promise<GoogleAuthResponse> => {
            const { data } = await api.post<GoogleAuthResponse>('/api/auth/google', values);
            return data;
        },
        onSuccess: (data) => {
            if (data.status === 'authenticated') {
                syncAuthenticatedUser(queryClient, data.user);
            }
        },
    });
};

export const useGoogleSignupCompleteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: GoogleSignupCompleteRequest) => {
            const { data } = await api.post('/api/auth/google/complete', values);
            return data;
        },
        onSuccess: (data) => {
            syncAuthenticatedUser(queryClient, data.user);
        },
    });
};

export const useVerifyOTPMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: VerifyOTPRequest) => {
            const { data } = await api.post('/api/auth/verify-otp', {
                type: 'whatsapp',
                ...values,
            });
            return data;
        },
        onSuccess: (data) => {
            syncAuthenticatedUser(queryClient, data.user);
        },
    });
};


export const useResendOtpMutation = () => {
    return useMutation({
        mutationFn: async (values: ResendOtpRequest) => {
            const { data } = await api.post('/api/auth/resend-otp', values);
            return data;
        },
    });
};

export const useResendActivationMutation = () => {
    return useMutation({
        mutationFn: async (values: ResendActivationRequest) => {
            const { data } = await api.post('/api/auth/resend-activation', values);
            return data;
        },
    });
};

export const useUpdateCommunicationPreferenceMutation = () => {
    return useMutation({
        mutationFn: async ({ requestId, communication_preference }: UpdateCommunicationPreferenceRequest) => {
            const { data } = await api.patch(`/api/access-requests/${encodeURIComponent(String(requestId))}/communication-preference`, {
                communication_preference,
            });
            return data;
        },
    });
};

export const useActivateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: ActivateRequest) => {
            const { data } = await api.post('/api/auth/activate', values);
            return data;
        },
        onSuccess: (data) => {
            syncAuthenticatedUser(queryClient, data.user);
        },
    });
};

export const useRequestAccessMutation = () => {
    return useMutation({
        mutationFn: async (values: RequestAccessRequest): Promise<RequestAccessResponse> => {
            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'specialization' && Array.isArray(value)) {
                        formData.append(key, JSON.stringify(value));
                    } else if (Array.isArray(value)) {
                        value.forEach((v) => {
                            if (v instanceof File) {
                                formData.append(`${key}`, v);
                            } else {
                                formData.append(`${key}[]`, String(v));
                            }
                        });
                    } else if (value instanceof File) {
                        formData.append(key, value);
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            const { data } = await api.post<RequestAccessResponse>('/api/request-access', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        }
    });
};


export const getWsTicket = async (): Promise<string> => {
    const { data } = await api.post<{ ticket: string }>('/api/auth/ws-ticket');
    return data.ticket;
};

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const useChangePasswordMutation = () => {
    return useMutation({
        mutationFn: async (values: ChangePasswordRequest) => {
            const { data } = await api.post('/api/auth/change-password', values);
            return data;
        },
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/api/auth/logout');
            return data;
        },
        onSuccess: () => {

            queryClient.clear();
        }
    });
};
