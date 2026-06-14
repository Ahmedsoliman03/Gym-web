'use client';

import {
    Bookmark,
    Briefcase,
    FileText,
    User,
    type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useRouter } from '@/i18n/routing';
import { MyApplicationsView } from '@/features/applications/components/my-applications-view';
import { MyPostsView } from '@/features/community/components/my-posts-view';
import { SavedPostsView } from '@/features/community/components/saved-posts-view';
import { MyJobsView } from '@/features/jobs/components/my-jobs-view';
import { SavedJobsView } from '@/features/jobs/components/saved-jobs-view';

type TabKey =
    | 'profile'
    | 'posts'
    | 'saved-posts'
    | 'saved-jobs'
    | 'my-jobs'
    | 'my-applications';

type ProfileUserType = 'client' | 'coach' | 'gym';

interface TabDef {
    key: TabKey;
    labelKey: string;
    icon: LucideIcon;
}

const styles = {
    tabBar:
        'flex items-center gap-1 p-1 rounded-2xl bg-surface border border-white/5 mb-6 overflow-x-auto',
    tab: (active: boolean) =>
        `flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            active
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-foreground/50 hover:text-foreground border border-transparent'
        }`,
};

/** Tabs available per role. Posts is author-only (clients can't publish posts);
 *  My Jobs is gym-only; My Applications is coach-only. Keep this in sync with
 *  `buildAccountLinks` in components/navbar/navbar-data.ts. */
const tabsForUserType = (userType: ProfileUserType): TabDef[] => {
    const base: TabDef[] = [
        { key: 'profile', labelKey: 'tabProfile', icon: User },
    ];
    if (userType !== 'client') {
        base.push({ key: 'posts', labelKey: 'tabPosts', icon: FileText });
    }
    base.push(
        { key: 'saved-posts', labelKey: 'tabSavedPosts', icon: Bookmark },
        { key: 'saved-jobs', labelKey: 'tabSavedJobs', icon: Bookmark },
    );
    if (userType === 'gym') {
        base.push({ key: 'my-jobs', labelKey: 'tabMyJobs', icon: Briefcase });
    }
    if (userType === 'coach') {
        base.push({
            key: 'my-applications',
            labelKey: 'tabMyApplications',
            icon: FileText,
        });
    }
    return base;
};

const TabContent = ({ tab }: { tab: TabKey }) => {
    switch (tab) {
        case 'posts':
            return <MyPostsView embedded />;
        case 'saved-posts':
            return <SavedPostsView embedded />;
        case 'saved-jobs':
            return <SavedJobsView embedded />;
        case 'my-jobs':
            return <MyJobsView embedded />;
        case 'my-applications':
            return <MyApplicationsView embedded />;
        default:
            return null;
    }
};

export function ProfileTabs({
    userType,
    children,
}: {
    userType: ProfileUserType;
    children: ReactNode;
}) {
    const t = useTranslations('Profile');
    const router = useRouter();
    const searchParams = useSearchParams();

    const tabs = tabsForUserType(userType);
    const requested = searchParams.get('tab') as TabKey | null;
    // Fall back to the profile tab when the query is missing or points at a tab
    // this role doesn't have (e.g. a stale `?tab=my-jobs` link for a coach).
    const active: TabKey = tabs.some((tabDef) => tabDef.key === requested)
        ? (requested as TabKey)
        : 'profile';

    const selectTab = (key: TabKey) => {
        // `replace` keeps the back button pointed at the page the user came
        // from rather than each tab switch.
        router.replace(key === 'profile' ? '/profile' : `/profile?tab=${key}`);
    };

    return (
        <>
            <div className={styles.tabBar}>
                {tabs.map(({ key, labelKey, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => selectTab(key)}
                        className={styles.tab(active === key)}
                    >
                        <Icon size={14} />
                        {t(labelKey)}
                    </button>
                ))}
            </div>

            {active === 'profile' ? children : <TabContent tab={active} />}
        </>
    );
}
