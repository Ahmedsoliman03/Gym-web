'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ChatRequest, ChatRequestOutcome } from '../types';
import { formatWhen } from '@/utils/format';
import { getRequestOutcome } from '../utils/request-status';
import { ChatRowAvatar } from './chat-row-avatar';

const styles = {
    rowCard:
        'rounded-2xl border border-white/10 bg-surface/40 p-3 flex items-center gap-3',
    rowInfo: 'flex-1 min-w-0',
    rowName: 'text-sm font-bold truncate',
    rowMeta: 'text-[11px] text-foreground/50 truncate',
    rowActions: 'flex items-center gap-1.5 shrink-0',
    statusChip: (outcome: ChatRequestOutcome) =>
        `text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            outcome === 'pending'
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                : outcome === 'approved'
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`,
};

export const OutgoingRequestRow = ({ request }: { request: ChatRequest }) => {
    const t = useTranslations('Chat');
    const locale = useLocale();
    // Outgoing = you sent it, so the other person is `toUser`.
    const other = request.toUser;
    const outcome = getRequestOutcome(request);

    return (
        <div className={styles.rowCard}>
            <ChatRowAvatar photo={other?.photo} name={other?.fullName ?? ''} />
            <div className={styles.rowInfo}>
                <div className={styles.rowName}>{other?.fullName}</div>
                <div className={styles.rowMeta}>
                    {`${t('sentRequestTo')} · ${formatWhen(request.createdAt, locale)}`}
                </div>
            </div>
            <div className={styles.rowActions}>
                <span className={styles.statusChip(outcome)}>
                    {outcome === 'pending'
                        ? t('statusPending')
                        : outcome === 'approved'
                          ? t('statusApproved')
                          : t('statusRejected')}
                </span>
            </div>
        </div>
    );
};
