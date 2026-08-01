import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { GymDetailView } from '@/features/gyms/components/gym-detail-view';
import { getGymServer } from '@/features/gyms/services/gyms.server';
import { getGymPostsServer } from '@/features/community/services/community.server';
import { gymShareMetadata } from '@/features/share-preview/metadata';

interface GymDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: GymDetailPageProps) {
  const { id, locale } = await params;
  return gymShareMetadata(id, locale);
}

export default async function GymDetailPage({ params }: GymDetailPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  try {
    const gym = await getGymServer(id);
    queryClient.setQueryData(['gyms', id], gym);

    try {
      const posts = await getGymPostsServer(gym.id);
      queryClient.setQueryData(['community', 'posts', 'gym', gym.id], posts);
    } catch {
      // Posts are non-critical — <ProfilePosts> will fetch/hide on its own.
    }
  } catch {
    // Non-fatal: let GymDetailView fetch through the proxy on mount.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GymDetailView id={id} />
    </HydrationBoundary>
  );
}
