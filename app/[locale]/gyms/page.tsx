import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { GymsView } from '@/features/gyms/components/gyms-view';
import { getGymsServer } from '@/features/gyms/services/gyms.server';

export default async function GymsPage() {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({ queryKey: ['gyms'], queryFn: getGymsServer });
  } catch {
    // Non-fatal: let GymsView fetch through the proxy on mount.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GymsView />
    </HydrationBoundary>
  );
}
