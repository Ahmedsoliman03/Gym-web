import { AuthorPostsView } from '@/features/community/components/author-posts-view';

interface CoachPostsPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function CoachPostsPage({ params }: CoachPostsPageProps) {
  const { id } = await params;
  return <AuthorPostsView authorType="coach" profileId={id} />;
}
