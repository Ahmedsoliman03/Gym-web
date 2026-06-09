'use client';

import { useMemo, useState } from 'react';
import { User, Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Modal } from '@/components/ui/modal';
import { useProfileLink } from '@/features/profile/hooks/useProfileLink';
import type { CommentVoter } from '../types';

const styles = {
    votersList: 'space-y-1',
    voterRow:
        'flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors',
    voterAvatar:
        'w-10 h-10 rounded-full overflow-hidden bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0',
    voterAvatarImg: 'w-full h-full object-cover',
    voterName: 'text-sm font-bold text-foreground',
    voterEmpty: 'text-sm text-foreground/40 text-center py-6',
    loadingWrap: 'flex items-center justify-center py-6 text-foreground/40',
    searchWrap: 'relative mb-3',
    searchIcon:
        'absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3',
    searchInput:
        'w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm placeholder:text-foreground/30 rtl:pl-3 rtl:pr-9',
};

function VoterRow({ voter, onClick }: { voter: CommentVoter; onClick: () => void }) {
    const { href } = useProfileLink(voter.user.profileId, voter.user.userType);
    const photo = voter.user.photo;
    const row = (
        <>
            <div className={styles.voterAvatar}>
                {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt={voter.user.fullName} className={styles.voterAvatarImg} />
                ) : (
                    <User size={18} />
                )}
            </div>
            <span className={styles.voterName}>{voter.user.fullName}</span>
        </>
    );
    return href ? (
        <Link href={href} className={styles.voterRow} onClick={onClick}>
            {row}
        </Link>
    ) : (
        <div className={styles.voterRow}>{row}</div>
    );
}

/**
 * Bottom-sheet style modal listing the people who upvoted a comment or post.
 * Shared between the post card and the comments list so the "Liked by" UI
 * stays consistent in both places. When `isLoading` is true, a spinner is
 * shown in place of the list.
 */
/**
 * Inner contents of the upvoters sheet. Lives in its own component so the
 * `query` state is unmounted whenever the modal closes — that way the next
 * open starts with an empty search instead of needing a setState-in-effect
 * reset hook (which the project's lint config rejects).
 */
function UpvotersSheetBody({
    voters,
    isLoading,
    onVoterClick,
}: {
    voters: CommentVoter[];
    isLoading: boolean;
    onVoterClick?: () => void;
}) {
    const t = useTranslations('Community');
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return voters;
        return voters.filter((v) =>
            (v.user.fullName ?? '').toLowerCase().includes(q),
        );
    }, [voters, query]);

    const showSearch = !isLoading && voters.length > 0;

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
            ) : voters.length === 0 ? (
                <p className={styles.voterEmpty}>{t('noUpvoters')}</p>
            ) : filtered.length === 0 ? (
                <p className={styles.voterEmpty}>{t('noVotersMatch')}</p>
            ) : (
                <ul className={styles.votersList}>
                    {filtered.map((v, idx) => (
                        <li key={`${v.user.id}-${idx}`}>
                            <VoterRow voter={v} onClick={() => onVoterClick?.()} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}

export function UpvotersSheet({
    isOpen,
    onClose,
    voters,
    isLoading = false,
    onVoterClick,
}: {
    isOpen: boolean;
    onClose: () => void;
    voters: CommentVoter[];
    isLoading?: boolean;
    onVoterClick?: () => void;
}) {
    const t = useTranslations('Community');
    const title =
        voters.length > 0
            ? `${t('upvotersTitle')} · ${t('upvotersCount', { count: voters.length })}`
            : t('upvotersTitle');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <UpvotersSheetBody
                voters={voters}
                isLoading={isLoading}
                onVoterClick={onVoterClick}
            />
        </Modal>
    );
}
