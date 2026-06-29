"use client";

import { useCallback, useState, useEffect } from "react";

// Simple global event-based state for opening the chat panel
const CHAT_OPEN_EVENT = "gymspot-chat-open";

export type ChatOpenTab = 'conversations' | 'incoming' | 'outgoing';

export interface ChatOpenDetail {
    tab?: ChatOpenTab;
    conversationId?: string;
}

export const useChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [requestedTab, setRequestedTab] = useState<ChatOpenTab | undefined>(undefined);
    const [requestedConversationId, setRequestedConversationId] = useState<string | undefined>(
        undefined,
    );

    useEffect(() => {
        const handleOpen = (e: Event) => {
            setIsOpen(true);
            const detail = (e as CustomEvent<ChatOpenDetail>).detail;
            if (detail?.tab) setRequestedTab(detail.tab);
            if (detail?.conversationId) setRequestedConversationId(detail.conversationId);
        };
        window.addEventListener(CHAT_OPEN_EVENT, handleOpen);
        return () => window.removeEventListener(CHAT_OPEN_EVENT, handleOpen);
    }, []);

    const openChat = (tab?: ChatOpenTab) => {
        setIsOpen(true);
        if (tab) setRequestedTab(tab);
        window.dispatchEvent(
            new CustomEvent<ChatOpenDetail>(CHAT_OPEN_EVENT, { detail: { tab } }),
        );
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
    window.dispatchEvent(
        new CustomEvent<ChatOpenDetail>(CHAT_OPEN_EVENT, { detail: { tab, conversationId } }),
    );
};
