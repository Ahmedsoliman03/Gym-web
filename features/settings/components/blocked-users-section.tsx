'use client';

import { Loader2, UserX } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import {
    useBlockedUsersQuery,
    useUnblockUserMutation,
} from '../services/blocks.service';

const styles = {
    wrapper: 'space-y-4',
    empty:
        'rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-5 text-sm font-medium text-foreground/45',
    row:
        'flex items-center justify-between gap-4 py-3 border-b border-white/[0.04] last:border-b-0',
    left: 'flex items-center gap-3 min-w-0',
    avatar:
        'h-11 w-11 rounded-full bg-white/[0.06] border border-white/10 overflow-hidden flex items-center justify-center text-foreground/35 shrink-0',
    avatarImage: 'h-full w-full object-cover',
    name: 'text-sm font-bold text-foreground truncate',
    meta: 'text-xs text-foreground/40 truncate mt-0.5',
    button:
        'shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-black uppercase tracking-wider text-foreground/70 transition-all hover:bg-white/[0.08] disabled:opacity-50 disabled:cursor-not-allowed',
};

export function BlockedUsersSection() {
    const t = useTranslations('Settings');
    const blockedUsers = useBlockedUsersQuery();
    const unblock = useUnblockUserMutation();

    const handleUnblock = (userId: string) => {
        unblock.mutate(userId, {
            onSuccess: () => toast.success(t('unblockSuccess')),
            onError: () => toast.error(t('unblockError')),
        });
    };

    if (blockedUsers.isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm font-bold text-foreground/45">
                <Loader2 size={16} className="animate-spin" />
                {t('blockedUsersLoading')}
            </div>
        );
    }

    if (blockedUsers.isError) {
        return <div className={styles.empty}>{t('blockedUsersLoadError')}</div>;
    }

    const rows = blockedUsers.data ?? [];
    if (rows.length === 0) {
        return <div className={styles.empty}>{t('blockedUsersEmpty')}</div>;
    }

    return (
        <div className={styles.wrapper}>
            {rows.map((block) => {
                const user = block.blockedUser;
                const location = [user.area, user.city].filter(Boolean).join(', ');
                return (
                    <div key={block.id} className={styles.row}>
                        <div className={styles.left}>
                            <div className={styles.avatar}>
                                {user.photo ? (
                                    <Image
                                        src={user.photo}
                                        alt={user.fullName}
                                        width={44}
                                        height={44}
                                        className={styles.avatarImage}
                                        unoptimized
                                    />
                                ) : (
                                    <UserX size={18} />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className={styles.name}>{user.fullName}</div>
                                <div className={styles.meta}>
                                    {t(`blockedType_${user.userType}`)}
                                    {location ? ` · ${location}` : ''}
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => handleUnblock(user.id)}
                            disabled={unblock.isPending}
                        >
                            {unblock.isPending ? t('saving') : t('unblock')}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
