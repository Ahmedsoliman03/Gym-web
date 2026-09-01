'use client';

import { useQueryClient } from '@tanstack/react-query';
import type {
    EmojiClickData,
    Theme,
    EmojiStyle,
} from 'emoji-picker-react';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), {
    ssr: false,
    loading: () => <div className="w-[320px] h-[400px] bg-surface border border-white/10 rounded-2xl flex items-center justify-center text-foreground/50">Loading Picker...</div>
});
import {
    Camera,
    FileText,
    ImageIcon,
    Loader2,
    MapPin,
    Paperclip,
    Send,
    Smile,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
} from 'react';
import toast from 'react-hot-toast';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { chatKeys } from '../services/chat.service';
import { useChatSocket } from '../socket/chat-socket-provider';
import type { ChatMessage, ChatUser } from '../types';

const styles = {
    wrap: 'relative z-50 border-t border-white/10 bg-surface/50 backdrop-blur-md p-3 flex items-end gap-2',
    input:
        'flex-1 resize-none max-h-32 min-h-[40px] rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors',
    sendBtn:
        'shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100',
    emojiBtn:
        'shrink-0 h-10 w-10 rounded-full bg-white/5 border border-white/10 text-foreground/70 flex items-center justify-center hover:bg-white/10 hover:text-foreground transition-all active:scale-[0.95]',
    emojiPopover:
        'absolute bottom-full mb-2 left-3 z-50 rounded-2xl overflow-hidden shadow-xl shadow-black/40',
    backdrop: 'fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]',
    attachBtn:
        'shrink-0 h-10 w-10 rounded-full bg-white/5 border border-white/10 text-foreground/70 flex items-center justify-center hover:bg-white/10 hover:text-foreground transition-all active:scale-[0.95]',
    attachPopover:
        'absolute bottom-full mb-2 left-0 z-50 w-44 rounded-2xl border border-white/10 bg-surface/95 backdrop-blur-md p-1.5 shadow-xl shadow-black/40',
    attachItem:
        'w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-foreground/90 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
    attachIcon: (tint: string) =>
        `shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${tint}`,
    attachSoon: 'ms-auto text-[9px] uppercase tracking-wide text-foreground/40',
    statusHint:
        'absolute -top-5 left-3 text-[10px] text-foreground/40 uppercase tracking-wide pointer-events-none',
};

const emojiThemeVars = {
    '--epr-bg-color': 'var(--surface)',
    '--epr-dark-bg-color': 'var(--surface)',
    '--epr-category-label-bg-color': 'var(--surface)',
    '--epr-dark-category-label-bg-color': 'var(--surface)',
    '--epr-text-color': 'var(--foreground)',
    '--epr-dark-text-color': 'var(--foreground)',
    '--epr-hover-bg-color': 'rgba(255,255,255,0.08)',
    '--epr-dark-hover-bg-color': 'rgba(255,255,255,0.08)',
    '--epr-focus-bg-color': 'rgba(255,255,255,0.08)',
    '--epr-dark-focus-bg-color': 'rgba(255,255,255,0.08)',
    '--epr-highlight-color': 'var(--primary)',
    '--epr-dark-highlight-color': 'var(--primary)',
    '--epr-category-icon-active-color': 'var(--primary)',
    '--epr-dark-category-icon-active-color': 'var(--primary)',
    '--epr-search-input-bg-color': 'rgba(255,255,255,0.05)',
    '--epr-dark-search-input-bg-color': 'rgba(255,255,255,0.05)',
    '--epr-search-input-bg-color-active': 'rgba(255,255,255,0.08)',
    '--epr-dark-search-input-bg-color-active': 'rgba(255,255,255,0.08)',
    '--epr-search-input-text-color': 'var(--foreground)',
    '--epr-picker-border-color': 'rgba(255,255,255,0.1)',
    '--epr-dark-picker-border-color': 'rgba(255,255,255,0.1)',
    '--epr-search-border-color': 'rgba(255,255,255,0.1)',
    '--epr-category-label-text-color': 'rgba(255,255,255,0.55)',
    '--epr-picker-border-radius': '1rem',
} as CSSProperties;

const newClientMessageId = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `cmid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const meAsChatUser = (
    profile: ReturnType<typeof useProfileUser>['profile'],
): ChatUser | undefined => {
    if (!profile) return undefined;
    const photo =
        (profile.profile as { photo?: string | null } | undefined)?.photo ?? null;
    return {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        userType: profile.userType,
        photo,
    };
};

export const MessageComposer = ({
    conversationId,
    hideQuickReplies = false,
    otherUserType,
}: {
    conversationId: string;
    hideQuickReplies?: boolean;
    otherUserType?: ChatUser['userType'];
}) => {
    const t = useTranslations('Chat');
    const locale = useLocale();
    const queryClient = useQueryClient();
    const { profile } = useProfileUser();
    const { sendMessage, startTyping, stopTyping, status } = useChatSocket();
    const userType = profile?.userType || 'client';
    // Prefer suggestions tailored to who's on the other end of the
    // conversation (e.g. a coach messaging a gym vs. messaging a client);
    // fall back to the generic per-role set when that pairing has no copy.
    const pairedKey = otherUserType ? `reply_${userType}_to_${otherUserType}` : null;
    const replyKeyBase = pairedKey && t.has(`${pairedKey}_1`) ? pairedKey : `reply_${userType}`;
    const quickReplies = [
        t(`${replyKeyBase}_1`),
        t(`${replyKeyBase}_2`),
        t(`${replyKeyBase}_3`),
    ];
    const [value, setValue] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [showAttach, setShowAttach] = useState(false);
    const [locating, setLocating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isTypingRef = useRef(false);
    const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const emitStopTyping = useCallback(() => {
        if (stopTimerRef.current) {
            clearTimeout(stopTimerRef.current);
            stopTimerRef.current = null;
        }
        if (isTypingRef.current) {
            isTypingRef.current = false;
            stopTyping(conversationId);
        }
    }, [conversationId, stopTyping]);

    const handleChange = (next: string) => {
        setValue(next);
        if (status !== 'open') return;
        if (next.trim().length === 0) {
            emitStopTyping();
            return;
        }
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            startTyping(conversationId);
        }
        if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
        stopTimerRef.current = setTimeout(emitStopTyping, 2500);
    };

    // Stop typing when the thread changes or the composer unmounts.
    useEffect(() => emitStopTyping, [conversationId, emitStopTyping]);

    const closePanels = useCallback(() => {
        setShowEmoji(false);
        setShowAttach(false);
    }, []);

    const panelOpen = showEmoji || showAttach;
    useEffect(() => {
        if (!panelOpen) return;
        const onKey = (e: globalThis.KeyboardEvent) => {
            if (e.key === 'Escape') closePanels();
        };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [panelOpen, closePanels]);

    const [prevConversation, setPrevConversation] = useState(conversationId);
    if (prevConversation !== conversationId) {
        setPrevConversation(conversationId);
        setShowEmoji(false);
        setShowAttach(false);
    }

    // Insert the picked emoji at the caret (or append) and keep typing state live.
    const handleEmojiSelect = (data: EmojiClickData) => {
        const el = textareaRef.current;
        const start = el?.selectionStart ?? value.length;
        const end = el?.selectionEnd ?? value.length;
        const next = value.slice(0, start) + data.emoji + value.slice(end);
        handleChange(next);
        requestAnimationFrame(() => {
            const node = textareaRef.current;
            if (!node) return;
            const caret = start + data.emoji.length;
            node.focus();
            node.setSelectionRange(caret, caret);
        });
    };

    const trimmed = value.trim();
    const canSend = trimmed.length > 0 && status === 'open' && !!profile;
    const showSocketStatusHint = status === 'connecting' || status === 'closed';

    const sendBody = useCallback(
        (raw: string): boolean => {
            const body = raw.trim();
            if (!body || status !== 'open') return false;
            const me = meAsChatUser(profile);
            if (!me) return false;

            const clientMessageId = newClientMessageId();
            const now = new Date().toISOString();

            const optimistic: ChatMessage = {
                // Temporary id — replaced by the server-assigned UUID on echo.
                id: `tmp:${clientMessageId}`,
                sender: me,
                body,
                attachment: null,
                clientMessageId,
                createdAt: now,
                updatedAt: now,
            };

            queryClient.setQueryData<ChatMessage[]>(
                chatKeys.messages(conversationId),
                (prev) => (prev ? [...prev, optimistic] : [optimistic]),
            );

            sendMessage(conversationId, body, clientMessageId);
            emitStopTyping();
            return true;
        },
        [conversationId, emitStopTyping, profile, queryClient, sendMessage, status],
    );

    const handleSend = () => {
        if (!canSend) return;
        if (sendBody(trimmed)) setValue('');
    };

    const handleSendLocation = () => {
        setShowAttach(false);
        if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
            toast.error(t('locationUnsupported'));
            return;
        }
        setLocating(true);
        const dismiss = toast.loading(t('locationSharing'));
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
               
                let label = '';
                try {
                    const res = await fetch(
                        `/api/location?lat=${latitude}&lon=${longitude}&lang=${locale}`,
                    );
                    if (res.ok) {
                        const data = (await res.json()) as { display_name?: string };
                        label = data.display_name?.trim() ?? '';
                    }
                } catch {
                    // ignore — fall back to the link alone
                }
                sendBody(label ? `📍 ${label}\n${link}` : `📍 ${link}`);
                setLocating(false);
                toast.dismiss(dismiss);
            },
            () => {
                setLocating(false);
                toast.dismiss(dismiss);
                toast.error(t('locationDenied'));
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative">
            {panelOpen && (
                <div className={styles.backdrop} aria-hidden onClick={closePanels} />
            )}
            {showSocketStatusHint && (
                <div className={styles.statusHint}>{t('socketDisconnected')}</div>
            )}
            {profile && !hideQuickReplies && (
                <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto border-t border-white/5 bg-surface/30 scrollbar-none">
                    {quickReplies.map((reply, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => sendBody(reply)}
                            disabled={status !== 'open'}
                            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-foreground/80 hover:text-foreground border border-white/5 hover:border-primary/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
            )}
            <div className={styles.wrap}>
                <div className="relative shrink-0">
                    {showAttach && (
                        <div className={styles.attachPopover} role="menu">
                            <button
                                type="button"
                                role="menuitem"
                                disabled
                                title={t('comingSoon')}
                                className={styles.attachItem}
                            >
                                <span className={styles.attachIcon('bg-violet-500/20 text-violet-300')}>
                                    <ImageIcon size={18} />
                                </span>
                                {t('attachPhoto')}
                                <span className={styles.attachSoon}>{t('comingSoon')}</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                disabled
                                title={t('comingSoon')}
                                className={styles.attachItem}
                            >
                                <span className={styles.attachIcon('bg-rose-500/20 text-rose-300')}>
                                    <Camera size={18} />
                                </span>
                                {t('attachCamera')}
                                <span className={styles.attachSoon}>{t('comingSoon')}</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                disabled
                                title={t('comingSoon')}
                                className={styles.attachItem}
                            >
                                <span className={styles.attachIcon('bg-sky-500/20 text-sky-300')}>
                                    <FileText size={18} />
                                </span>
                                {t('attachDocument')}
                                <span className={styles.attachSoon}>{t('comingSoon')}</span>
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleSendLocation}
                                disabled={status !== 'open'}
                                className={styles.attachItem}
                            >
                                <span className={styles.attachIcon('bg-emerald-500/20 text-emerald-300')}>
                                    <MapPin size={18} />
                                </span>
                                {t('attachLocation')}
                            </button>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setShowAttach((v) => !v);
                            setShowEmoji(false);
                        }}
                        aria-label={t('attach')}
                        title={t('attach')}
                        aria-expanded={showAttach}
                        className={styles.attachBtn}
                    >
                        {locating ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Paperclip size={20} />
                        )}
                    </button>
                </div>
                <div className="relative shrink-0">
                    {showEmoji && (
                        <div className={styles.emojiPopover} style={emojiThemeVars}>
                            <EmojiPicker
                                onEmojiClick={handleEmojiSelect}
                                theme={'dark' as Theme}
                                emojiStyle={'native' as EmojiStyle}
                                lazyLoadEmojis
                                searchDisabled={false}
                                width={320}
                                height={400}
                            />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setShowEmoji((v) => !v);
                            setShowAttach(false);
                        }}
                        aria-label={t('emoji')}
                        title={t('emoji')}
                        aria-expanded={showEmoji}
                        className={styles.emojiBtn}
                    >
                        <Smile size={20} />
                    </button>
                </div>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    onBlur={emitStopTyping}
                    placeholder={t('placeholder')}
                    className={styles.input}
                />
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    aria-label={t('send')}
                    title={t('send')}
                    className={styles.sendBtn}
                >
                    {status === 'connecting' ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Send size={18} />
                    )}
                </button>
            </div>
        </div>
    );
};
