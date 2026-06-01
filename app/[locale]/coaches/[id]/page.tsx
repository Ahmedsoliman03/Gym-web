import { CoachDetailView } from "@/features/coaches/components/coach-detail-view";

interface CoachDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function CoachDetailPage({ params }: CoachDetailPageProps) {
  const { id } = await params;
  return <CoachDetailView id={id} />;
}
