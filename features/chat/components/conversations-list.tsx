'use client';

import { MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useConversations } from '../services/chat.service';
import {
    ChatEmptyState,
    ChatErrorState,
    ChatLoadingState,
} from './chat-empty-state';
import { ConversationRow } from './conversation-row';

export const ConversationsList = ({
    onOpen,
}: {
    onOpen?: (conversationId: string) => void;
}) => {
    const t = useTranslations('Chat');
    const query = useConversations();

    if (query.isLoading)
        return <ChatLoadingState label={t('loadingConversations')} />;
    if (query.isError) return <ChatErrorState label={t('loadErrorConversations')} />;

    const items = query.data ?? [];
    if (items.length === 0) {
        return (
            <ChatEmptyState
                icon={<MessageSquare size={22} />}
                label={t('emptyConversations')}
            />
        );
    }
    return (
        <>
            {items.map((c) => (
                <ConversationRow key={c.id} conversation={c} onOpen={onOpen} />
            ))}
        </>
    );
};
