'use client';

import AuthLayout from '@/features/auth/components/auth-layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthLayout>{children}</AuthLayout>
        </QueryClientProvider>
    );
}
