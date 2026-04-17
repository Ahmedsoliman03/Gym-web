"use client";

import { MessageCircle, X, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useChat } from "@/features/chat/hooks/use-chat";

export const ChatWidget = () => {
    const t = useTranslations('Chat');
    const { isOpen, setIsOpen, openChat } = useChat();
    const locale = useLocale();
    const isRtl = locale === 'ar';

    return (
        <>
            <button
                onClick={openChat}
                className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-[90] w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform`}
            >
                <MessageCircle size={28} />
            </button>

            <div className={`fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} z-[100] w-full sm:w-[400px] bg-background border-${isRtl ? 'r' : 'l'} border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : (isRtl ? '-translate-x-full' : 'translate-x-full')}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold shadow-inner">
                                G
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">{t('support')}</h3>
                                <p className="text-xs text-primary font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    {t('online')}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-foreground/60 hover:text-foreground">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-surface/50 backdrop-blur-md">
                        <div className="flex items-center gap-2 bg-background border border-white/10 rounded-full px-4 py-2 focus-within:border-primary/50 transition-colors shadow-inner">
                            <input
                                type="text"
                                placeholder={t('placeholder')}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground/40"
                            />
                            <button className="text-primary hover:text-primary/80 transition-colors p-1 transform origin-center hover:scale-110 active:scale-95">
                                <Send size={18} className={isRtl ? "rotate-180" : ""} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[95] sm:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
