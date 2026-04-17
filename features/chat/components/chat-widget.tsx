"use client";

import { X, Send, Smile } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useChat } from "@/features/chat/hooks/use-chat";
import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";

// Dynamically import EmojiPicker to avoid SSR issues and improve initial load
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full flex items-center justify-center bg-surface/50 animate-pulse">Loading...</div>
});

const styles = {
    panel: (isRtl: boolean, isOpen: boolean) => `fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} z-[100] w-full sm:w-[400px] bg-background border-${isRtl ? 'r' : 'l'} border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : (isRtl ? '-translate-x-full' : 'translate-x-full')}`,
    header: "p-4 border-b border-white/10 flex items-center justify-between bg-surface/50 backdrop-blur-md",
    headerAvatar: "w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold shadow-inner",
    headerTitle: "font-bold text-foreground",
    statusText: "text-xs text-primary font-medium flex items-center gap-1",
    statusDot: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse",
    closeBtn: "p-2 hover:bg-white/5 rounded-full transition-colors text-foreground/60 hover:text-foreground",
    messagesArea: "flex-1 overflow-y-auto p-4 space-y-4",
    emojiPickerContainer: "absolute bottom-32 left-4 right-4 z-[110] shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-200",
    inputContainer: "p-4 border-t border-white/10 bg-surface/50 backdrop-blur-md relative",
    inputWrapper: "flex items-center gap-2 bg-background border border-white/10 rounded-2xl px-3 py-2.5 focus-within:border-primary/50 transition-all shadow-inner group",
    emojiToggle: (active: boolean) => `text-foreground/40 hover:text-primary transition-colors p-1 ${active ? 'text-primary' : ''}`,
    input: "flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground/40 min-h-[24px]",
    sendBtn: "text-primary hover:text-primary/80 disabled:text-foreground/20 disabled:scale-100 transition-all p-1.5 transform origin-center hover:scale-110 active:scale-95 bg-primary/10 rounded-full group-focus-within:bg-primary/20",
    overlay: "fixed inset-0 bg-black/50 z-[95] sm:hidden backdrop-blur-sm transition-opacity"
};

export const ChatWidget = () => {
    const t = useTranslations('Chat');
    const { isOpen, setIsOpen } = useChat();
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    const onEmojiClick = (emojiData: any) => {
        setMessage(prev => prev + emojiData.emoji);
    };

    const handleSendMessage = () => {
        if (!message.trim()) return;
        console.log("Sending message:", message);
        setMessage("");
        setShowEmojiPicker(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <div className={styles.panel(isRtl, isOpen)}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={styles.header}>
                        <div className="flex items-center gap-3">
                            <div className={styles.headerAvatar}>G</div>
                            <div>
                                <h3 className={styles.headerTitle}>{t('support')}</h3>
                                <p className={styles.statusText}>
                                    <span className={styles.statusDot} />
                                    {t('online')}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className={styles.messagesArea}>
                        {/* Placeholder for messages */}
                    </div>

                    {/* Emoji Picker Container */}
                    {showEmojiPicker && (
                        <div ref={emojiPickerRef} className={styles.emojiPickerContainer}>
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme={Theme.DARK}
                                width="100%"
                                height={350}
                                searchPlaceHolder={t('placeholder')}
                            />
                        </div>
                    )}

                    {/* Input Area */}
                    <div className={styles.inputContainer}>
                        <div className={styles.inputWrapper}>
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={styles.emojiToggle(showEmojiPicker)}
                            >
                                <Smile size={24} />
                            </button>

                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={t('placeholder')}
                                className={styles.input}
                            />

                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className={styles.sendBtn}
                            >
                                <Send size={20} className={isRtl ? "rotate-180" : ""} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};


