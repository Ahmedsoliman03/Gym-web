'use client';

import AuthLayout from '@/features/auth/components/auth-layout';

export default function AuthLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AuthLayout>{children}</AuthLayout>
    );
}
