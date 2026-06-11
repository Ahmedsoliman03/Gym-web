'use client';

import { useState } from 'react';
import { Inbox, Send as SendIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ChatRequestBox } from '../types';
import { RequestsList } from './requests-list';
import { usePendingIncomingCount } from '../hooks/use-pending-incoming-count';

const styles = {
    page: 'pt-20 sm:pt-24 pb-16 px-3 sm:px-6 md:px-12 min-h-screen',
    inner: 'max-w-3xl mx-auto',
    pageTitle:
        'text-3xl sm:text-4xl font-headline font-bold mb-2 text-foreground',
    pageSubtitle: 'text-sm text-foreground/40 mb-8',
    tabBar:
        'flex items-center gap-1 p-1 rounded-2xl bg-surface border border-white/5 mb-6 max-w-md',
    tab: (active: boolean) =>
        `flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            active
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-foreground/50 hover:text-foreground border border-transparent'
        }`,
    badge:
        'min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black tabular-nums',
    list: 'flex flex-col gap-3',
};

export function RequestsPageView() {
    const t = useTranslations('Chat');
    const [box, setBox] = useState<ChatRequestBox>('incoming');
    const pendingIncoming = usePendingIncomingCount();

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <h1 className={styles.pageTitle}>{t('requestsTitle')}</h1>
                <p className={styles.pageSubtitle}>{t('requestsPageSubtitle')}</p>

                <div className={styles.tabBar}>
                    <button
                        type="button"
                        className={styles.tab(box === 'incoming')}
                        onClick={() => setBox('incoming')}
                    >
                        <Inbox size={14} />
                        {t('tabIncoming')}
                        {pendingIncoming > 0 && (
                            <span className={styles.badge}>
                                {pendingIncoming > 9 ? '9+' : pendingIncoming}
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={styles.tab(box === 'outgoing')}
                        onClick={() => setBox('outgoing')}
                    >
                        <SendIcon size={14} />
                        {t('tabOutgoing')}
                    </button>
                </div>

                <div className={styles.list}>
                    <RequestsList box={box} />
                </div>
            </div>
        </div>
    );
}
