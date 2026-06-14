'use client';

import { Inbox, ListFilter, Send as SendIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CustomSelect } from '@/components/ui/custom-select';
import { useChatRequests } from '../services/chat.service';
import type { ChatRequestBox, ChatRequestOutcome } from '../types';
import { getRequestOutcome } from '../utils/request-status';
import {
    ChatEmptyState,
    ChatErrorState,
    ChatLoadingState,
} from './chat-empty-state';
import { IncomingRequestRow } from './incoming-request-row';
import { OutgoingRequestRow } from './outgoing-request-row';

type StatusFilter = ChatRequestOutcome | 'all';

const styles = {
    filterRow: 'mb-3 flex items-center gap-2 justify-end',
    filterIcon: 'shrink-0 text-foreground/40',
    selectWrap: 'w-44',
};

export const RequestsList = ({ box }: { box: ChatRequestBox }) => {
    const t = useTranslations('Chat');
    const query = useChatRequests(box);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    if (query.isLoading) return <ChatLoadingState label={t('loading')} />;
    if (query.isError) return <ChatErrorState label={t('loadError')} />;

    const boxIcon = box === 'incoming' ? <Inbox size={22} /> : <SendIcon size={22} />;

    const all = query.data ?? [];
    if (all.length === 0) {
        return (
            <ChatEmptyState
                icon={boxIcon}
                label={box === 'incoming' ? t('emptyIncoming') : t('emptyOutgoing')}
            />
        );
    }

    const items =
        statusFilter === 'all'
            ? all
            : all.filter((req) => getRequestOutcome(req) === statusFilter);

    return (
        <>
            <div className={styles.filterRow}>
                <ListFilter size={14} className={styles.filterIcon} />
                <div className={styles.selectWrap}>
                    <CustomSelect
                        value={statusFilter}
                        onChange={(v) => setStatusFilter(v as StatusFilter)}
                        placeholder={t('filterByStatus')}
                        options={[
                            { value: 'all', label: t('statusAll') },
                            { value: 'pending', label: t('statusPending') },
                            { value: 'approved', label: t('statusApproved') },
                            { value: 'rejected', label: t('statusRejected') },
                        ]}
                    />
                </div>
            </div>

            {items.length === 0 ? (
                <ChatEmptyState icon={boxIcon} label={t('noRequestsForStatus')} />
            ) : (
                items.map((req) =>
                    box === 'incoming' ? (
                        <IncomingRequestRow key={req.id} request={req} />
                    ) : (
                        <OutgoingRequestRow key={req.id} request={req} />
                    ),
                )
            )}
        </>
    );
};
