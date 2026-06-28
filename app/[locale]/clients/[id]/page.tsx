import { ClientDetailView } from "@/features/clients/components/client-detail-view";

interface ClientDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  return <ClientDetailView id={id} />;
}
