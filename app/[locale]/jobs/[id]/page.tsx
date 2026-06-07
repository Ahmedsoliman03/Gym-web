import { JobDetailView } from '@/features/jobs/components/job-detail-view';

interface JobDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return <JobDetailView jobId={id} />;
}
