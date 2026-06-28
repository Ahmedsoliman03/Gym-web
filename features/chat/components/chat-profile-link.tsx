'use client';

import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { useProfileLink } from '@/features/profile/hooks/useProfileLink';
import type { ChatUser } from '../types';

export const ChatProfileLink = ({
    user,
    className,
    children,
}: {
    user: Pick<ChatUser, 'profileId' | 'userType'> | null | undefined;
    className?: string;
    children: ReactNode;
}) => {
    const { href } = useProfileLink(user?.profileId, user?.userType);

   
    if (!href) return <div className={className}>{children}</div>;

    return (
        <Link
            href={href}
            className={className}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </Link>
    );
};
