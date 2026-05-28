'use client';

import {
    LoginRequest,
    RegisterRequest,
    VerifyOTPRequest,
} from '../types';
import {
    useLoginMutation,
    useRegisterMutation,
    useVerifyOTPMutation,
    useLogoutMutation,
} from '../services/auth.service';

export const useAuthUser = () => {
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation();
    const verifyOTPMutation = useVerifyOTPMutation();
    const logoutMutation = useLogoutMutation();

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



    return {
        login,
        register,
        verifyOTP,
        logout,
        isLoading: loginMutation.isPending ||
            registerMutation.isPending ||
            verifyOTPMutation.isPending ||
            logoutMutation.isPending,
        loginMutation,
        registerMutation,
        verifyOTPMutation,
        logoutMutation,
    };
};
