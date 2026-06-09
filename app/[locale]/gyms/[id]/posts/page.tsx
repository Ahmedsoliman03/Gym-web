import { AuthorPostsView } from '@/features/community/components/author-posts-view';

interface GymPostsPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function GymPostsPage({ params }: GymPostsPageProps) {
  const { id } = await params;
  return <AuthorPostsView authorType="gym" profileId={id} />;
}
