"use client";

import { useCallback, useState, useEffect } from "react";

// Simple global event-based state for opening the chat panel
const CHAT_OPEN_EVENT = "gymspot-chat-open";

export type ChatOpenTab = 'conversations' | 'incoming' | 'outgoing';

export interface ChatOpenDetail {
    tab?: ChatOpenTab;
    conversationId?: string;
}

// ChatWidget is loaded via `next/dynamic({ ssr: false })`, so there's a real
// window between page load (or route change) and the moment its `useChat()`
// instance actually subscribes to CHAT_OPEN_EVENT below. If ChatTrigger (or a
// profile page's "message" button) fires triggerChatOpen() during that
// window, the CustomEvent has no listener and is lost — the panel silently
// stays closed until something else (e.g. a reload) mounts the widget before
// the next click. Latching the most recent request here lets the widget
// replay it as soon as it does mount, regardless of timing.
let pendingOpenRequest: ChatOpenDetail | null = null;

export const useChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [requestedTab, setRequestedTab] = useState<ChatOpenTab | undefined>(undefined);
    const [requestedConversationId, setRequestedConversationId] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        const applyOpenRequest = (detail?: ChatOpenDetail) => {
            setIsOpen(true);
            if (detail?.tab) setRequestedTab(detail.tab);
            if (detail?.conversationId) setRequestedConversationId(detail.conversationId);
        };

        const handleOpen = (e: Event) => {
            pendingOpenRequest = null;
            applyOpenRequest((e as CustomEvent<ChatOpenDetail>).detail);
        };
        window.addEventListener(CHAT_OPEN_EVENT, handleOpen);

        // Replay a request that was fired before we were listening.
        if (pendingOpenRequest) {
            const detail = pendingOpenRequest;
            pendingOpenRequest = null;
            applyOpenRequest(detail);
        }

        return () => window.removeEventListener(CHAT_OPEN_EVENT, handleOpen);
    }, []);

    const openChat = (tab?: ChatOpenTab) => {
        const detail: ChatOpenDetail = { tab };
        pendingOpenRequest = detail;
        setIsOpen(true);
        if (tab) setRequestedTab(tab);
        window.dispatchEvent(new CustomEvent<ChatOpenDetail>(CHAT_OPEN_EVENT, { detail }));
    };

    const closeChat = () => setIsOpen(false);

    const clearRequestedTab = useCallback(() => setRequestedTab(undefined), []);

    /** Acknowledge the requested conversation so it doesn't re-open later. */
    const clearRequestedConversation = useCallback(
        () => setRequestedConversationId(undefined),
        [],
    );

    return {
        isOpen,
        openChat,
        closeChat,
        setIsOpen,
        requestedTab,
        clearRequestedTab,
        requestedConversationId,
        clearRequestedConversation,
    };
};

export const triggerChatOpen = (tab?: ChatOpenTab, conversationId?: string) => {
    const detail: ChatOpenDetail = { tab, conversationId };
    pendingOpenRequest = detail;
    window.dispatchEvent(new CustomEvent<ChatOpenDetail>(CHAT_OPEN_EVENT, { detail }));
};
