'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import { SPECIALIZATIONS } from '@/constants/specializations';
import { ApplicationCard } from '@/features/applications/components/application-card';
import { useMyJobsApplications } from '@/features/applications/services/applications.service';
import { PageHeader } from '@/components/ui/page-header';
import { GLoader } from '@/components/ui/g-loader';
import { CustomSelect } from '@/components/ui/custom-select';

const styles = {
    page: "pt-20 sm:pt-24 pb-16 px-3 sm:px-6 md:px-12 min-h-screen",
    inner: "max-w-5xl mx-auto",
    pageHeader: "mb-12",
    filterRow: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 sm:mb-8",
    loaderWrap: "flex items-center justify-center py-24 text-primary",
    emptyState: "text-center py-16 sm:py-24 text-foreground/30",
    emptyIcon: "mx-auto mb-4 opacity-20",
    emptyText: "text-base sm:text-lg font-bold",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6",
};

type StatusFilter = 'all' | 'open' | 'closed';

export default function ApplicationsPage() {
    const t = useTranslations('Applications');
    const [specFilter, setSpecFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const { data: applications = [], isLoading } = useMyJobsApplications();

    // Build the specialization options from the disciplines that actually
    // appear in the incoming applications — no point offering "Yoga" if no
    // open post is yoga-related. Each option carries its applicant count.
    const specOptions = useMemo(() => {
        const counts = new Map<string, number>();
        applications.forEach((app) => {
            (app.job?.specialization ?? []).forEach((s) => {
                counts.set(s, (counts.get(s) ?? 0) + 1);
            });
        });
        const opts = [
            { value: 'all', label: `${t('allPosts')} (${applications.length})` },
        ];
        SPECIALIZATIONS.forEach((spec) => {
            const count = counts.get(spec.value);
            if (count) opts.push({ value: spec.value, label: `${spec.fallback} (${count})` });
        });
        return opts;
    }, [applications, t]);

    const openCount = useMemo(
        () => applications.filter((app) => app.job?.status === 'open').length,
        [applications],
    );
    const closedCount = applications.length - openCount;

    const statusOptions = [
        { value: 'all', label: `${t('filterAll')} (${applications.length})` },
        { value: 'open', label: `${t('filterOpen')} (${openCount})` },
        { value: 'closed', label: `${t('filterClosed')} (${closedCount})` },
    ];

    const filtered = useMemo(() => {
        return applications.filter((app) => {
            const matchesSpec =
                specFilter === 'all' ||
                (app.job?.specialization ?? []).includes(specFilter);
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'open'
                    ? app.job?.status === 'open'
                    : app.job?.status !== 'open');
            return matchesSpec && matchesStatus;
        });
    }, [applications, specFilter, statusFilter]);

    return (
        <div className={styles.page}>
            <div className={styles.inner}>

                <PageHeader
                    title={t('title')}
                    description={t('description')}
                    highlight={t('highlight')}
                />

                <div className={styles.filterRow}>
                    <CustomSelect
                        value={specFilter}
                        onChange={setSpecFilter}
                        options={specOptions}
                        placeholder={t('filterBySpecialization')}
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
                        <User size={48} className={styles.emptyIcon} />
                        <p className={styles.emptyText}>{t('noApplications')}</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filtered.map((app) => (
                            <ApplicationCard key={app.id} app={app} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
