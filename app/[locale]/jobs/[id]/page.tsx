import { JobDetailView } from '@/features/jobs/components/job-detail-view';
import { jobShareMetadata } from '@/features/share-preview/metadata';

interface JobDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps) {
  const { id, locale } = await params;
  return jobShareMetadata(id, locale);
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  return <JobDetailView jobId={id} />;
}
