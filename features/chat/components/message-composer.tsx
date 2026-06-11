'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type KeyboardEvent } from 'react';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { chatKeys } from '../services/chat.service';
import { useChatSocket } from '../socket/chat-socket-provider';
import type { ChatMessage, ChatUser } from '../types';

const styles = {
    wrap: 'border-t border-white/10 bg-surface/50 backdrop-blur-md p-3 flex items-end gap-2',
    input:
        'flex-1 resize-none max-h-32 min-h-[40px] rounded-2xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors',
    sendBtn:
        'shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100',
    statusHint:
        'absolute -top-5 left-3 text-[10px] text-foreground/40 uppercase tracking-wide pointer-events-none',
};

/** Browser-safe UUID — falls back to a timestamp-based id for older runtimes
 *  that don't expose `crypto.randomUUID`. Only the socket echo cares about
 *  this matching, so uniqueness within the tab is enough. */
const newClientMessageId = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `cmid-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Build a `ChatUser` shape from `/api/me` so the optimistic message bubble
 *  has a real sender object — `MessageBubble` already only needs `id`, but
 *  this future-proofs us when we add sender avatars in threads. */
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
}: {
    conversationId: string;
}) => {
    const t = useTranslations('Chat');
    const queryClient = useQueryClient();
    const { profile } = useProfileUser();
    const { sendMessage, status } = useChatSocket();
    const [value, setValue] = useState('');

    const trimmed = value.trim();
    const canSend = trimmed.length > 0 && status === 'open' && !!profile;

    const handleSend = () => {
        if (!canSend) return;
        const me = meAsChatUser(profile);
        if (!me) return;

        const clientMessageId = newClientMessageId();
        const body = trimmed;

        // Optimistic insert. The socket provider's `applyMessageNew` will
        // reconcile this same entry by `clientMessageId` when the server
        // echoes the message back (see chat-socket-provider.tsx:118-138).
        const optimistic: ChatMessage = {
            // Temporary id — replaced by the server-assigned UUID on echo.
            id: `tmp:${clientMessageId}`,
            sender: me,
            body,
            attachment: null,
            clientMessageId,
            createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData<ChatMessage[]>(
            chatKeys.messages(conversationId),
            (prev) => (prev ? [...prev, optimistic] : [optimistic]),
        );

        sendMessage(conversationId, body, clientMessageId);
        setValue('');
    };

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter sends; Shift+Enter inserts a newline. Matches the standard
        // pattern across major chat UIs (Slack, Discord, etc.).
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative">
            {status !== 'open' && (
                <div className={styles.statusHint}>{t('socketDisconnected')}</div>
            )}
            <div className={styles.wrap}>
                <textarea
                    rows={1}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
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
