import { Bookmark, Briefcase, FileText, Inbox, Settings } from 'lucide-react';
import type { AccountLink, NavEntry, NavItem, UserType } from './types';

type Translate = (key: string) => string;

// A labelled group only makes sense with 2+ destinations. With exactly one it
// collapses to a plain top-level link (like Plans); with none it disappears.
const groupOrLink = (label: string, items: NavItem[]): NavEntry[] => {
  if (items.length === 0) return [];
  if (items.length === 1)
    return [{ type: 'link', label: items[0].label, href: items[0].href }];
  return [{ type: 'group', label, items }];
};

/**
 * Top-level navbar entries, role-aware. Mirrors the middleware restriction
 * table so a user never sees a link they can't open:
 *   - /applications: gym-only   - /jobs: gyms + coaches only
 * Clients are treated like guests and get the flat default navbar; gyms and
 * coaches get the grouped Explore/Careers navbar. Plans is shown to everyone.
 */
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
      { type: 'link', label: t('coaches'), href: '/coaches' },
      { type: 'link', label: t('gyms'), href: '/gyms' },
      { type: 'link', label: t('plans'), href: '/plans' },
      { type: 'link', label: t('about'), href: '/about' },
    ];
  }

  return [
    ...groupOrLink(t('explore'), [
      { label: t('coaches'), href: '/coaches' },
      { label: t('gyms'), href: '/gyms' },
      { label: t('community'), href: '/community' },
    ]),
    ...groupOrLink(t('careers'), careersItems),
    { type: 'link', label: t('plans'), href: '/plans' },
    { type: 'link', label: t('about'), href: '/about' },
  ];
}

/**
 * Secondary account links for signed-in users — rendered both in the desktop
 * avatar dropdown and the mobile "More" section, so they live in one place.
 * (Profile and Logout are handled separately by each surface.)
 */
export function buildAccountLinks(t: Translate, userType: UserType): AccountLink[] {
  return [
    { href: '/chat/requests', label: t('chatRequests'), icon: Inbox },
    { href: '/my-posts', label: t('myPosts'), icon: FileText },
    { href: '/saved-posts', label: t('savedPosts'), icon: Bookmark },
    // My Jobs is gym-only (only gyms author job posts).
    ...(userType === 'gym'
      ? [{ href: '/my-jobs', label: t('myJobs'), icon: Briefcase }]
      : []),
    // My Applications is coach-only (only coaches apply to jobs).
    ...(userType === 'coach'
      ? [{ href: '/my-applications', label: t('myApplications'), icon: FileText }]
      : []),
    { href: '/saved-jobs', label: t('savedJobs'), icon: Bookmark },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];
}
