'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV !== 'production' && (
                <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            )}
        </QueryClientProvider>
    );
}
