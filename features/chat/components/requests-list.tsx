'use client';

import { Inbox, Send as SendIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useChatRequests } from '../services/chat.service';
import type { ChatRequestBox } from '../types';
import {
    ChatEmptyState,
    ChatErrorState,
    ChatLoadingState,
} from './chat-empty-state';
import { IncomingRequestRow } from './incoming-request-row';
import { OutgoingRequestRow } from './outgoing-request-row';

export const RequestsList = ({ box }: { box: ChatRequestBox }) => {
    const t = useTranslations('Chat');
    const query = useChatRequests(box);

    if (query.isLoading) return <ChatLoadingState label={t('loading')} />;
    if (query.isError) return <ChatErrorState label={t('loadError')} />;

    const items = query.data ?? [];
    if (items.length === 0) {
        return (
            <ChatEmptyState
                icon={box === 'incoming' ? <Inbox size={22} /> : <SendIcon size={22} />}
                label={box === 'incoming' ? t('emptyIncoming') : t('emptyOutgoing')}
            />
        );
    }
    return (
        <>
            {items.map((req) =>
                box === 'incoming' ? (
                    <IncomingRequestRow key={req.id} request={req} />
                ) : (
                    <OutgoingRequestRow key={req.id} request={req} />
                ),
            )}
        </>
    );
};
