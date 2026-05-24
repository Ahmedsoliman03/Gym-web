'use client';

import {
    LoginRequest,
    RegisterRequest,
    VerifyOTPRequest,
    RefreshRequest
} from '../types';
import {
    useLoginMutation,
    useRegisterMutation,
    useVerifyOTPMutation,
    useLogoutMutation,
    useRefreshMutation
} from '../services/auth.service';

export const useAuthUser = () => {
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation();
    const verifyOTPMutation = useVerifyOTPMutation();
    const logoutMutation = useLogoutMutation();
    const refreshMutation = useRefreshMutation();

    const login = async (values: LoginRequest) => {
        return await loginMutation.mutateAsync(values);
    };

    const register = async (values: RegisterRequest) => {
        return await registerMutation.mutateAsync(values);
    };

    const verifyOTP = async (values: VerifyOTPRequest) => {
        return await verifyOTPMutation.mutateAsync(values);
    };

    const logout = async () => {
        return await logoutMutation.mutateAsync();
    };

    const refresh = async (values: RefreshRequest) => {
        return await refreshMutation.mutateAsync(values);
    };

    return {
        login,
        register,
        verifyOTP,
        logout,
        refresh,
        isLoading: loginMutation.isPending ||
            registerMutation.isPending ||
            verifyOTPMutation.isPending ||
            logoutMutation.isPending ||
            refreshMutation.isPending,
        loginMutation,
        registerMutation,
        verifyOTPMutation,
        logoutMutation,
        refreshMutation
    };
};
