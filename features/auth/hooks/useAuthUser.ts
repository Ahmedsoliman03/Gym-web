'use client';

import {
    LoginRequest,
    RegisterRequest,
    VerifyOTPRequest,
    ResendOtpRequest,
} from '../types';
import {
    useLoginMutation,
    useRegisterMutation,
    useVerifyOTPMutation,
    useResendOtpMutation,
    useLogoutMutation,
} from '../services/auth.service';

export const useAuthUser = () => {
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation();
    const verifyOTPMutation = useVerifyOTPMutation();
    const resendOtpMutation = useResendOtpMutation();
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

    const resendOtp = async (values: ResendOtpRequest) => {
        return await resendOtpMutation.mutateAsync(values);
    };

    const logout = async () => {
        return await logoutMutation.mutateAsync();
    };



    return {
        login,
        register,
        verifyOTP,
        resendOtp,
        logout,
        isLoading: loginMutation.isPending ||
            registerMutation.isPending ||
            verifyOTPMutation.isPending ||
            resendOtpMutation.isPending ||
            logoutMutation.isPending,
        loginMutation,
        registerMutation,
        verifyOTPMutation,
        resendOtpMutation,
        logoutMutation,
    };
};
