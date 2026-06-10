'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';
import { MyApplicationCard } from '@/features/applications/components/my-application-card';
import { useMyApplications } from '@/features/applications/services/applications.service';
import { PageHeader } from '@/components/ui/page-header';
import { GLoader } from '@/components/ui/g-loader';
import { CustomSelect } from '@/components/ui/custom-select';

const styles = {
    page: "pt-20 sm:pt-24 pb-16 px-3 sm:px-6 md:px-12 min-h-screen",
    inner: "max-w-5xl mx-auto",
    filterRow: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8",
    loaderWrap: "flex items-center justify-center py-24 text-primary",
    emptyState: "text-center py-16 sm:py-24 text-foreground/30",
    emptyIcon: "mx-auto mb-4 opacity-20",
    emptyText: "text-base sm:text-lg font-bold",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
};

type StatusFilter = 'all' | 'open' | 'closed';

export default function MyApplicationsPage() {
    const t = useTranslations('Applications');
    const [postFilter, setPostFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const { data: applications = [], isLoading } = useMyApplications();

    // Drop applications whose job payload didn't come back — defensive against
    // backend nulls so the cards below can safely read `app.job.id`.
    const safeApplications = useMemo(
        () => applications.filter((app) => !!app.job),
        [applications],
    );

    // Posts the coach has applied to — one option per distinct job.id, with a
    // tally so they can spot where they've sent multiple applications.
    const postOptions = useMemo(() => {
        const seen = new Map<string, { title: string; count: number }>();
        safeApplications.forEach((app) => {
            const id = app.job?.id;
            if (!id) return;
            const entry = seen.get(id);
            if (entry) {
                entry.count += 1;
            } else {
                seen.set(id, {
                    title: app.job?.title || id,
                    count: 1,
                });
            }
        });
        const opts = [
            { value: 'all', label: `${t('allPosts')} (${safeApplications.length})` },
        ];
        seen.forEach((entry, id) => {
            opts.push({ value: id, label: `${entry.title} (${entry.count})` });
        });
        return opts;
    }, [safeApplications, t]);

    const openCount = useMemo(
        () => safeApplications.filter((app) => app.job?.status === 'open').length,
        [safeApplications],
    );
    const closedCount = safeApplications.length - openCount;

    const statusOptions = [
        { value: 'all', label: `${t('filterAll')} (${safeApplications.length})` },
        { value: 'open', label: `${t('filterOpen')} (${openCount})` },
        { value: 'closed', label: `${t('filterClosed')} (${closedCount})` },
    ];

    const filtered = useMemo(() => {
        return safeApplications.filter((app) => {
            const matchesPost = postFilter === 'all' || app.job?.id === postFilter;
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'open'
                    ? app.job?.status === 'open'
                    : app.job?.status !== 'open');
            return matchesPost && matchesStatus;
        });
    }, [safeApplications, postFilter, statusFilter]);

    return (
        <div className={styles.page}>
            <div className={styles.inner}>

                <PageHeader
                    title={t('myTitle')}
                    description={t('myDescription')}
                    highlight={t('myHighlight')}
                />

                <div className={styles.filterRow}>
                    <CustomSelect
                        value={postFilter}
                        onChange={setPostFilter}
                        options={postOptions}
                        placeholder={t('filterByPost')}
                    />
                    <CustomSelect
                        value={statusFilter}
                        onChange={(v) => setStatusFilter(v as StatusFilter)}
                        options={statusOptions}
                        placeholder={t('filterByStatus')}
                    />
                </div>

                {isLoading ? (
                    <div className={styles.loaderWrap}>
                        <GLoader size={64} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FileText size={48} className={styles.emptyIcon} />
                        <p className={styles.emptyText}>{t('noMyApplications')}</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filtered.map((app) => (
                            <MyApplicationCard key={app.id} app={app} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
