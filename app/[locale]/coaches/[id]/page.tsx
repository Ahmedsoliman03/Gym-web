import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { CoachDetailView } from '@/features/coaches/components/coach-detail-view';
import { getCoachServer } from '@/features/coaches/services/coaches.server';
import { getCoachPostsServer } from '@/features/community/services/community.server';
import { coachShareMetadata } from '@/features/share-preview/metadata';

interface CoachDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: CoachDetailPageProps) {
  const { id, locale } = await params;
  return coachShareMetadata(id, locale);
}

export default async function CoachDetailPage({ params }: CoachDetailPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  try {
    const coach = await getCoachServer(id);
    queryClient.setQueryData(['coaches', id], coach);

    try {
      const posts = await getCoachPostsServer(coach.id);
      queryClient.setQueryData(['community', 'posts', 'coach', coach.id], posts);
    } catch {
      // Posts are non-critical — <ProfilePosts> will fetch/hide on its own.
    }
  } catch {
    // Non-fatal: let CoachDetailView fetch through the proxy on mount.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CoachDetailView id={id} />
    </HydrationBoundary>
  );
}
