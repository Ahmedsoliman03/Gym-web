"use client";

import { useState, useEffect } from "react";

// Simple global event-based state for opening the chat panel
const CHAT_OPEN_EVENT = "gymspot-chat-open";

export const useChat = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener(CHAT_OPEN_EVENT, handleOpen);
        return () => window.removeEventListener(CHAT_OPEN_EVENT, handleOpen);
    }, []);

    const openChat = () => {
        setIsOpen(true);
        window.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT));
    };

    const closeChat = () => setIsOpen(false);

    return { isOpen, openChat, closeChat, setIsOpen };
};

export const triggerChatOpen = () => {
    window.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT));
};
