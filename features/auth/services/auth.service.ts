import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import {
    LoginRequest,
    RegisterRequest,
    RequestAccessRequest,
    VerifyOTPRequest,
    ActivateRequest,
} from '../types';

export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: LoginRequest) => {
            const { data } = await api.post('/api/auth/login', values);
            return data;
        },
        onSuccess: (data) => {
            // if (data?.token) {
            //     const expires = new Date();
            //     expires.setDate(expires.getDate() + 7); // 7 days
            //     document.cookie = `access_token=${data.token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
            // }
            queryClient.setQueryData(['session'], data.user);
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

export const useVerifyOTPMutation = () => {
    return useMutation({
        mutationFn: async (values: VerifyOTPRequest) => {
            const { data } = await api.post('/api/auth/verify-otp', values);
            return data;
        }
    });
};

export const useActivateMutation = () => {
    return useMutation({
        mutationFn: async (values: ActivateRequest) => {
            const { data } = await api.post('/api/auth/activate', values);
            return data;
        }
    });
};

export const useRequestAccessMutation = () => {
    return useMutation({
        mutationFn: async (values: RequestAccessRequest) => {
            const formData = new FormData();

            Object.entries(values).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'specialization' && Array.isArray(value)) {
                        formData.append(key, JSON.stringify(value));
                    } else if (Array.isArray(value)) {
                        value.forEach((v) => {
                            if (v instanceof File) {
                                formData.append(`${key}`, v); // Backend usually handles multi-files with same key or key[]
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

            const { data } = await api.post('/api/request-access', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        }
    });
};


// Trades the authenticated HTTP session for a short-lived (60s) JWT that the
// client passes as `?ticket=...` on the chat WS upgrade. The HttpOnly cookie
// can't be relied on at the WS host because the Next proxy (:3000) and Daphne
// (:8001) live on different origins and Chrome's storage partitioning blocks
// the cookie on the upgrade request. See backend `apps/chat/auth.py`.
export const getWsTicket = async (): Promise<string> => {
    const { data } = await api.post<{ ticket: string }>('/api/auth/ws-ticket');
    return data.ticket;
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
