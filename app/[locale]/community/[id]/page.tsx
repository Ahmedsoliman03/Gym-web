import { CommunityPostDetailView } from '@/features/community/components/community-post-detail-view';

interface CommunityPostPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function CommunityPostPage({ params }: CommunityPostPageProps) {
  const { id } = await params;
  return <CommunityPostDetailView postId={id} />;
}
