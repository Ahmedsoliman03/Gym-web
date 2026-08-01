import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { CommunityPostDetailView } from '@/features/community/components/community-post-detail-view';
import { getPostServer } from '@/features/community/services/community.server';
import { postShareMetadata } from '@/features/share-preview/metadata';

interface CommunityPostPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: CommunityPostPageProps) {
  const { id, locale } = await params;
  return postShareMetadata(id, locale);
}

export default async function CommunityPostPage({ params }: CommunityPostPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: ['community', 'post', id],
      queryFn: () => getPostServer(id),
    });
  } catch {
    // Non-fatal: let the client fetch through the proxy on mount.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CommunityPostDetailView postId={id} />
    </HydrationBoundary>
  );
}
