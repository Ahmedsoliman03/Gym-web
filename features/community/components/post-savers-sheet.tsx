'use client';

import { useMemo, useState } from 'react';
import { User, Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Modal } from '@/components/ui/modal';
import { useProfileLink } from '@/features/profile/hooks/useProfileLink';
import type { PostSaver } from '../types';

const styles = {
    saversList: 'space-y-1',
    saverRow:
        'flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors',
    saverAvatar:
        'w-10 h-10 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0',
    saverAvatarImg: 'w-full h-full object-cover',
    saverName: 'text-sm font-bold text-foreground',
    saverEmpty: 'text-sm text-foreground/40 text-center py-6',
    loadingWrap: 'flex items-center justify-center py-6 text-foreground/40',
    searchWrap: 'relative mb-3',
    searchIcon:
        'absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3',
    searchInput:
        'w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm placeholder:text-foreground/30 rtl:pl-3 rtl:pr-9',
};

/** Owner-only sheet (unlike UpvotersSheet, which anyone can open) — who
 * saved this post is private to the post's author. */
function SaverRow({ saver, onClick }: { saver: PostSaver; onClick: () => void }) {
    const { href } = useProfileLink(saver.user.profileId, saver.user.userType);
    const photo = saver.user.photo;
    const row = (
        <>
            <div className={styles.saverAvatar}>
                {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={saver.user.fullName} className={styles.saverAvatarImg} />
                ) : (
                    <User size={18} />
                )}
            </div>
            <span className={styles.saverName}>{saver.user.fullName}</span>
        </>
    );
    return href ? (
        <Link href={href} className={styles.saverRow} onClick={onClick}>
            {row}
        </Link>
    ) : (
        <div className={styles.saverRow}>{row}</div>
    );
}

function PostSaversSheetBody({
    savers,
    isLoading,
    onSaverClick,
}: {
    savers: PostSaver[];
    isLoading: boolean;
    onSaverClick?: () => void;
}) {
    const t = useTranslations('Community');
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return savers;
        return savers.filter((s) =>
            (s.user.fullName ?? '').toLowerCase().includes(q),
        );
    }, [savers, query]);

    const showSearch = !isLoading && savers.length > 0;

    return (
        <>
            {showSearch && (
                <div className={styles.searchWrap}>
                    <span className={styles.searchIcon}>
                        <Search size={14} />
                    </span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder={t('searchVoters')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            )}

            {isLoading ? (
                <div className={styles.loadingWrap}>
                    <Loader2 size={20} className="animate-spin" />
                </div>
            ) : savers.length === 0 ? (
                <p className={styles.saverEmpty}>{t('noSavers')}</p>
            ) : filtered.length === 0 ? (
                <p className={styles.saverEmpty}>{t('noVotersMatch')}</p>
            ) : (
                <ul className={styles.saversList}>
                    {filtered.map((s, idx) => (
                        <li key={`${s.user.id}-${idx}`}>
                            <SaverRow saver={s} onClick={() => onSaverClick?.()} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

export function PostSaversSheet({
    isOpen,
    onClose,
    savers,
    isLoading = false,
    onSaverClick,
}: {
    isOpen: boolean;
    onClose: () => void;
    savers: PostSaver[];
    isLoading?: boolean;
    onSaverClick?: () => void;
}) {
    const t = useTranslations('Community');
    const title =
        savers.length > 0
            ? `${t('saversTitle')} · ${t('saversCount', { count: savers.length })}`
            : t('saversTitle');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <PostSaversSheetBody
                savers={savers}
                isLoading={isLoading}
                onSaverClick={onSaverClick}
            />
        </Modal>
    );
}
