import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { CoachesView } from '@/features/coaches/components/coaches-view';
import { getCoachesServer } from '@/features/coaches/services/coaches.server';

export default async function CoachesPage() {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['coaches'],
      queryFn: getCoachesServer,
    });
  } catch {

    // Non-fatal: leave the cache empty and let CoachesView fetch through the
    // proxy on mount (which also handles token refresh). Graceful degradation.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CoachesView />
    </HydrationBoundary>
  );
}
