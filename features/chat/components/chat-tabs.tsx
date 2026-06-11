'use client';

import { Inbox, MessageSquare, Send as SendIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ChatRequestBox } from '../types';

export type WidgetTab = ChatRequestBox | 'conversations';

const styles = {
    tabs: 'flex border-b border-white/10 bg-surface/30',
    tab: (active: boolean) =>
        `flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wide transition-all relative ${
            active ? 'text-primary' : 'text-foreground/40 hover:text-foreground/70'
        }`,
    tabIndicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-primary',
};

export const ChatTabs = ({
    tab,
    onChange,
}: {
    tab: WidgetTab;
    onChange: (tab: WidgetTab) => void;
}) => {
    const t = useTranslations('Chat');
    return (
        <div className={styles.tabs}>
            <button
                type="button"
                className={styles.tab(tab === 'conversations')}
                onClick={() => onChange('conversations')}
            >
                <MessageSquare size={14} />
                {t('tabConversations')}
                {tab === 'conversations' && <div className={styles.tabIndicator} />}
            </button>
            <button
                type="button"
                className={styles.tab(tab === 'incoming')}
                onClick={() => onChange('incoming')}
            >
                <Inbox size={14} />
                {t('tabIncoming')}
                {tab === 'incoming' && <div className={styles.tabIndicator} />}
            </button>
            <button
                type="button"
                className={styles.tab(tab === 'outgoing')}
                onClick={() => onChange('outgoing')}
            >
                <SendIcon size={14} />
                {t('tabOutgoing')}
                {tab === 'outgoing' && <div className={styles.tabIndicator} />}
            </button>
        </div>
    );
};
