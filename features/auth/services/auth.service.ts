import { useMutation, useQueryClient } from '@tanstack/react-query';

// Mock service for demonstration
const mockApiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: any) => {
            await mockApiDelay(1000);
            console.log('Login attempt:', values);
            return { user: { id: 1, email: values.email }, token: 'mock-jwt' };
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['session'], data);
        }
    });
};

export const useRequestAccessMutation = () => {
    return useMutation({
        mutationFn: async (values: any) => {
            await mockApiDelay(1000);
            console.log('Request access:', values);
            return { success: true };
        }
    });
};
export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: async (values: any) => {
            await mockApiDelay(1000);
            console.log('Register attempt:', values);
            return { success: true };
        }
    });
};

export const useVerifyOTPMutation = () => {
    return useMutation({
        mutationFn: async (values: { code: string }) => {
            await mockApiDelay(1000);
            console.log('Verify OTP:', values);
            return { success: true };
        }
    });
};
