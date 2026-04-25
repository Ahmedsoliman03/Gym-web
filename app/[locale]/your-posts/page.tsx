import { JobFeed } from "@/features/jobs/components/job-feed";
import { JobHeader } from "@/features/jobs/components/job-header";
import { useTranslations } from "next-intl";

export default function YourPostsPage() {
    const t = useTranslations('Navbar');

    return (
        <div className="pt-24 pb-12 px-6 md:px-12 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto">
                <JobHeader 
                    title={t('yourPosts')} 
                    tag={t('userMenu')}
                    description={t('yourPostsDescription')}
                    statsCount="3"
                    statsLabel={t('yourPostsStatsLabel')}
                />
                <JobFeed />
            </div>
        </div>
    );
}
