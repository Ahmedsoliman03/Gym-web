'use client';

import { Inbox, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/features/chat/hooks/use-chat';
import { usePendingIncomingCount } from '@/features/chat/hooks/use-pending-incoming-count';
import { ChatTabs, type WidgetTab } from './chat-tabs';
import { ConversationsList } from './conversations-list';
import { ConversationThread } from './conversation-thread';
import { RequestsList } from './requests-list';

const styles = {
    panel: (isRtl: boolean, isOpen: boolean) =>
        `fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} z-[100] w-full sm:w-[400px] bg-background border-${
            isRtl ? 'r' : 'l'
        } border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : isRtl ? '-translate-x-full' : 'translate-x-full'
        }`,
    header:
        'p-4 border-b border-white/10 flex items-center justify-between bg-surface/50 backdrop-blur-md',
    headerIcon:
        'w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold shadow-inner',
    headerTitle: 'font-bold text-foreground',
    headerSubtitle: 'text-xs text-foreground/50',
    closeBtn:
        'p-2 hover:bg-white/5 rounded-full transition-colors text-foreground/60 hover:text-foreground',
    body: 'flex-1 overflow-y-auto p-4 space-y-3',
    overlay:
        'fixed inset-0 bg-black/50 z-[95] sm:hidden backdrop-blur-sm transition-opacity',
};

const subtitleKey: Record<WidgetTab, string> = {
    conversations: 'tabConversations',
    incoming: 'tabIncoming',
    outgoing: 'tabOutgoing',
};

export const ChatWidget = () => {
    const t = useTranslations('Chat');
    const { isOpen, setIsOpen, requestedTab, clearRequestedTab } = useChat();
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const [tab, setTab] = useState<WidgetTab>('conversations');
    const [selectedConversationId, setSelectedConversationId] = useState<
        string | null
    >(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const pendingIncoming = usePendingIncomingCount();

    // Drop the open thread when the panel closes so reopening starts on the
    // list. We don't clear on tab change — switching to Incoming and back to
    // Conversations should NOT auto-reopen the thread either.
    useEffect(() => {
        if (!isOpen) setSelectedConversationId(null);
    }, [isOpen]);

    // Lock page scrolling while the panel is open so only the chat content
    // (message list / conversation list) scrolls — the page behind stays put.
    // Inner scroll containers keep working because the lock is on <body>, not
    // on the panel.
    useEffect(() => {
        if (!isOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen]);

    // Honor an externally-requested tab (e.g. from a profile "Chat" button
    // that wants the panel to land on a specific tab). When no tab was
    // requested but there are pending incoming requests, default to Incoming
    // so the recipient sees the actionable items first.
    useEffect(() => {
        if (!isOpen) return;
        if (requestedTab) {
            if (requestedTab !== tab) setTab(requestedTab);
            clearRequestedTab();
            return;
        }
        if (pendingIncoming > 0 && tab === 'conversations') {
            setTab('incoming');
        }
        // Intentionally only re-evaluate when the panel opens or the requested
        // tab changes — we don't want to force the user back to Incoming after
        // they manually switch tabs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, requestedTab]);

    // Close when clicking outside the panel. The mobile overlay handles this
    // case via its onClick, but on desktop (sm:hidden) there's no element
    // catching the click — so we listen at the document level instead.
    useEffect(() => {
        if (!isOpen) return;
        const onDocumentPointerDown = (event: MouseEvent) => {
            const panel = panelRef.current;
            if (!panel) return;
            if (panel.contains(event.target as Node)) return;
            setIsOpen(false);
        };
        // `mousedown` (not `click`) so we close before any nested click handler
        // (e.g. the "Chat" button that just opened us) re-toggles state.
        document.addEventListener('mousedown', onDocumentPointerDown);
        return () =>
            document.removeEventListener('mousedown', onDocumentPointerDown);
    }, [isOpen, setIsOpen]);

    return (
        <>
            <div ref={panelRef} className={styles.panel(isRtl, isOpen)}>
                <div className="flex flex-col h-full">
                    {selectedConversationId ? (
                        <ConversationThread
                            conversationId={selectedConversationId}
                            onBack={() => setSelectedConversationId(null)}
                        />
                    ) : (
                        <>
                            <div className={styles.header}>
                                <div className="flex items-center gap-3">
                                    <div className={styles.headerIcon}>
                                        <Inbox size={18} />
                                    </div>
                                    <div>
                                        <h3 className={styles.headerTitle}>
                                            {t('requestsTitle')}
                                        </h3>
                                        <p className={styles.headerSubtitle}>
                                            {t(subtitleKey[tab] as any)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className={styles.closeBtn}
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <ChatTabs tab={tab} onChange={setTab} />

                            <div className={styles.body}>
                                {tab === 'conversations' ? (
                                    <ConversationsList
                                        onOpen={setSelectedConversationId}
                                    />
                                ) : (
                                    <RequestsList box={tab} />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className={styles.overlay} onClick={() => setIsOpen(false)} />
            )}
        </>
    );
};
