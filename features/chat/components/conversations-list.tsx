'use client';

import { MessageSquare, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { useConversations } from '../services/chat.service';
import { pickOtherUser } from '../utils/format';
import {
    ChatEmptyState,
    ChatErrorState,
    ChatLoadingState,
} from './chat-empty-state';
import { ConversationRow } from './conversation-row';

const styles = {
    searchWrap: 'relative',
    searchIcon:
        'absolute top-1/2 -translate-y-1/2 start-3 text-foreground/40 pointer-events-none',
    searchInput:
        'w-full rounded-2xl bg-white/5 border border-white/10 ps-9 pe-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors',
};

export const ConversationsList = ({
    onOpen,
}: {
    onOpen?: (conversationId: string) => void;
}) => {
    const t = useTranslations('Chat');
    const query = useConversations();
    const { profile } = useProfileUser();
    const [search, setSearch] = useState('');

    const items = query.data ?? [];
    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (!needle) return items;
        return items.filter((c) =>
            pickOtherUser(c, profile?.id)
                ?.fullName?.toLowerCase()
                .includes(needle),
        );
    }, [items, search, profile?.id]);

    if (query.isLoading)
        return <ChatLoadingState label={t('loadingConversations')} />;
    if (query.isError) return <ChatErrorState label={t('loadErrorConversations')} />;

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
            <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className={styles.searchInput}
                    aria-label={t('searchPlaceholder')}
                />
            </div>

            {filtered.length === 0 ? (
                <ChatEmptyState
                    icon={<Search size={22} />}
                    label={t('searchNoResults')}
                />
            ) : (
                filtered.map((c) => (
                    <ConversationRow key={c.id} conversation={c} onOpen={onOpen} />
                ))
            )}
        </>
    );
};
