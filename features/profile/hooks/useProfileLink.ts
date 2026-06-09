'use client';

import type { Route } from 'next';
import { useProfileUser } from './useProfileUser';

export type ProfileUserType = 'coach' | 'gym' | 'client';

interface UseProfileLinkResult {
    /** Internal route to navigate to, or `null` when there is no destination. */
    href: Route | null;
    /** True when the target id resolves to the currently signed-in user. */
    isSelf: boolean;
}

export function useProfileLink(
    id: string | null | undefined,
    userType: ProfileUserType | null | undefined,
): UseProfileLinkResult {
    const { profile } = useProfileUser();

    const myUserId = profile?.id;
    const myProfileId = profile?.profile?.id;

    const isSelf =
        !!id &&
        !!profile &&
        (id === myUserId || id === myProfileId);

    if (!id || !userType) {
        return { href: null, isSelf: false };
    }

    if (isSelf) {
        return { href: '/profile' as Route, isSelf: true };
    }

    if (userType === 'coach') {
        return { href: `/coaches/${id}` as Route, isSelf: false };
    }

    if (userType === 'gym') {
        return { href: `/gyms/${id}` as Route, isSelf: false };
    }

    // Clients don't have a public profile page.
    return { href: null, isSelf: false };
}
