import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { CommunityView } from '@/features/community/components/community-view';
import { getFeedServer } from '@/features/community/services/community.server';

export default async function CommunityPage() {
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ['community', 'feed'],
      queryFn: getFeedServer,
      initialPageParam: null as string | null,
    });
  } catch {
    // Non-fatal: let CommunityView fetch through the proxy on mount.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CommunityView />
    </HydrationBoundary>
  );
}
