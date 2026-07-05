'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Devtools are dev-only. Loading them through next/dynamic (instead of a static
// top-level import) keeps the ~45 KB devtools payload out of the production main
// bundle: the render branch below is dead-code-eliminated in prod, so the async
// chunk is never fetched.
const ReactQueryDevtools = dynamic(
    () => import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools),
    { ssr: false },
);

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Most data here (coaches, gyms, exercises) is static within a
                // session; a longer staleTime + no focus-refetch avoids re-hitting
                // the proxy on every window focus. Override per-query where fresh.
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
                refetchOnWindowFocus: false,
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
