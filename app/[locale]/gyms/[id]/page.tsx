import { GymDetailView } from "@/features/gyms/components/gym-detail-view";

interface GymDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function GymDetailPage({ params }: GymDetailPageProps) {
  const { id } = await params;
  return <GymDetailView id={id} />;
}
