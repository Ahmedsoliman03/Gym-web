import { Bookmark, Briefcase, FileText, Settings } from 'lucide-react';
import type { AccountEntry, AccountLink, NavEntry, NavItem, UserType } from './types';

type Translate = (key: string) => string;

const groupOrLink = (label: string, items: NavItem[]): NavEntry[] => {
  if (items.length === 0) return [];
  if (items.length === 1)
    return [{ type: 'link', label: items[0].label, href: items[0].href }];
  return [{ type: 'group', label, items }];
};

export function buildNavEntries(
  t: Translate,
  { isLoggedIn, userType }: { isLoggedIn: boolean; userType: UserType },
): NavEntry[] {
  const canSeeApplications = userType === 'gym';
  const canSeeJobs = userType === 'gym' || userType === 'coach';

  const careersItems: NavItem[] = [
    ...(canSeeJobs ? [{ label: t('jobBoard'), href: '/jobs' }] : []),
    ...(canSeeApplications
      ? [{ label: t('applications'), href: '/applications' }]
      : []),
  ];

  const useDefaultNavbar = !isLoggedIn || userType === 'client';

  if (useDefaultNavbar) {
    return [
      { type: 'link', label: t('community'), href: '/community' },
      ...groupOrLink(t('explore'), [
        { label: t('coaches'), href: '/coaches' },
        { label: t('gyms'), href: '/gyms' },
        { label: t('exercises'), href: '/exercises' },
        { label: t('nutrition'), href: '/nutrition', disabled: true, badge: t('comingSoon') },
      ]),
      // { type: 'link', label: t('plans'), href: '/plans' },
      { type: 'link', label: t('about'), href: '/about' },
    ];
  }

  return [
    ...groupOrLink(t('explore'), [
      { label: t('coaches'), href: '/coaches' },
      { label: t('gyms'), href: '/gyms' },
      { label: t('community'), href: '/community' },
      { label: t('exercises'), href: '/exercises' },
      { label: t('nutrition'), href: '/nutrition', disabled: true, badge: t('comingSoon') },
    ]),
    ...groupOrLink(t('careers'), careersItems),
    // { type: 'link', label: t('plans'), href: '/plans' },
    { type: 'link', label: t('about'), href: '/about' },
  ];
}

/** Collapses to a plain link when there's only one item — same convention
 * as `groupOrLink` above, applied to the account dropdown instead of the
 * top nav (e.g. a client only ever has "Saved Posts", not a "Posts" group). */
const accountGroupOrLink = (label: string, icon: AccountLink['icon'], items: AccountLink[]): AccountEntry[] => {
  if (items.length === 0) return [];
  if (items.length === 1) return [{ type: 'link', href: items[0].href, label: items[0].label, icon: items[0].icon }];
  return [{ type: 'group', label, icon, items }];
};

export function buildAccountLinks(t: Translate, userType: UserType): AccountEntry[] {
  const postsItems: AccountLink[] = [
    // My Posts is author-only (clients can't publish posts).
    ...(userType === 'coach' || userType === 'gym'
      ? [{ href: '/profile?tab=posts', label: t('myPosts'), icon: FileText }]
      : []),
    { href: '/profile?tab=saved-posts', label: t('savedPosts'), icon: Bookmark },
  ];

  const jobsItems: AccountLink[] = [
    // My Applications is coach-only (only coaches apply to jobs).
    ...(userType === 'coach'
      ? [{ href: '/profile?tab=my-applications', label: t('myApplications'), icon: FileText }]
      : []),
    // My Jobs is gym-only (only gyms author job posts).
    ...(userType === 'gym'
      ? [{ href: '/profile?tab=my-jobs', label: t('myJobs'), icon: Briefcase }]
      : []),
    // Saved Jobs is hidden for clients — they can't reach /jobs to save any.
    ...(userType !== 'client'
      ? [{ href: '/profile?tab=saved-jobs', label: t('savedJobs'), icon: Bookmark }]
      : []),
  ];

  return [
    ...accountGroupOrLink(t('posts'), FileText, postsItems),
    ...accountGroupOrLink(t('jobs'), Briefcase, jobsItems),
    // Usage exists only for gyms and coaches (platform subscriptions).
    // Usage tab is temporarily disabled.
    // ...(userType !== 'client'
    //   ? [{ type: 'link', href: '/profile?tab=usage', label: t('usage'), icon: Gauge }]
    //   : []),
    { type: 'link', href: '/settings', label: t('settings'), icon: Settings },
  ];
}
