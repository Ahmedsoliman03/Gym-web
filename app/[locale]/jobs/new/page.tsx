'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { JobOpeningForm } from '@/features/jobs/components/job-opening-form';
import { useCreateJobMutation } from '@/features/jobs/services/jobs.service';

const styles = {
  page: "pt-24 pb-16 px-6 md:px-12 min-h-screen",
  inner: "max-w-3xl mx-auto",
  backLink: "inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-primary transition-colors mb-8 group cursor-pointer border-0 bg-transparent p-0 outline-none",
  backIcon: "group-hover:-translate-x-0.5 transition-transform",
  heading: "text-4xl md:text-5xl font-headline font-black text-foreground mb-2",
  subheading: "text-foreground/50 mb-10",
};

export default function NewJobPage() {
  const t = useTranslations('Jobs');
  const router = useRouter();
  const locale = useLocale();
  const createMutation = useCreateJobMutation();

  const handleJobSubmit = async (values: {
    title: string;
    specialization: string;
    desc: string;
    image: File | null;
  }) => {
    try {
      await createMutation.mutateAsync({
        title: values.title,
        specialization: values.specialization,
        content: values.desc,
        image: values.image,
      });
      toast.success(t('createSuccess'));
      router.push(`/${locale}/jobs`);
    } catch {
      toast.error(t('createFailed'));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <button className={styles.backLink} onClick={() => router.push(`/${locale}/jobs`)}>
          <ArrowLeft size={16} className={styles.backIcon} />
          {t('backToJobs')}
        </button>

        <h1 className={styles.heading}>{t('addPost')}</h1>
        <p className={styles.subheading}>{t('addPostDesc')}</p>

        <JobOpeningForm onSubmit={handleJobSubmit} />
      </div>
    </div>
  );
}
