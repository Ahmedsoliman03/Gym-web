import { JobFeed } from "@/features/jobs/components/job-feed";
import { JobHeader } from "@/features/jobs/components/job-header";
import { useTranslations } from "next-intl";

export default function SavedPostsPage() {
    const t = useTranslations('Navbar');

    return (
        <div className="pt-24 pb-12 px-6 md:px-12 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto">
                <JobHeader 
                    title={t('savedPosts')} 
                    tag={t('userMenu')}
                    description={t('savedPostsDescription')}
                    statsCount="12"
                    statsLabel={t('savedPostsStatsLabel')}
                />
                <JobFeed />
            </div>
        </div>
    );
}
