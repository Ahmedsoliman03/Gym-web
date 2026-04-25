import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { JOBS } from '@/constants/jops';
import { JobDetailView } from '@/features/jobs/components/job-detail-view';

interface JobDetailPageProps {
  params: Promise<{ id: string; locale: string }>;
}

// ─── Open Graph metadata (for WhatsApp / Telegram / Twitter link previews) ────

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const job = JOBS.find(j => j.id === Number(id));

  if (!job) return {};

  return {
    title: `${job.title} — GymSpot`,
    description: job.description,
    openGraph: {
      title: job.title,
      description: job.description,
      url: `/${locale}/jobs/${job.id}`,
      siteName: 'GymSpot',
      images: [
        {
          url: job.image,
          width: 1200,
          height: 630,
          alt: job.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: job.title,
      description: job.description,
      images: [job.image],
    },
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = JOBS.find(j => j.id === Number(id));

  if (!job) {
    notFound();
  }

  return <JobDetailView job={job} />;
}

export async function generateStaticParams() {
  return JOBS.map(job => ({ id: String(job.id) }));
}
