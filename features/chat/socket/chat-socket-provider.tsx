'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { chatKeys } from '../services/chat.service';
import {
    applyNotificationNew,
    applyNotificationRead,
    applyNotificationDeleted,
    applyNotificationsCleared,
} from '@/features/notification/services/notification.service';
import { playNewMessageSound } from '../utils/notification-sound';
import { playNotificationSound } from '@/features/notification/utils/notification-sound';
import { getWsTicket } from '@/features/auth/services/auth.service';
import { useProfileQuery } from '@/features/profile/services/profile.service';
import type { UserProfile } from '@/features/profile/types';
import type {
    ChatClientEvent,
    ChatConversation,
    ChatMessage,
    ChatServerEvent,
    ChatSettings,
    PresenceStatus,
} from '../types';

export type ChatSocketStatus = 'idle' | 'connecting' | 'open' | 'closed';

export interface ChatSocketActions {
    sendMessage: (conversationId: string, body: string, clientMessageId?: string) => void;
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
    setPresence: (status: PresenceStatus) => void;
    watchPresence: (userIds: string[]) => void;
}

export interface ChatSocketContextValue extends ChatSocketActions {
    status: ChatSocketStatus;
    typingByConversation: Record<string, ReadonlySet<string>>;
    presenceByUser: Record<string, PresenceStatus>;
    /** Locally-tracked unread counts, keyed by conversation id. Survives
     *  `/api/chat/conversations` refetches (which would otherwise clobber the
     *  optimistic increment with a stale/zero server value). Reconcile against
     *  the server's `unreadCount` with `Math.max` at the display site. */
    unreadByConversation: Record<string, number>;
    /** Drop a conversation's local unread tally — call alongside markRead. */
    clearUnread: (conversationId: string) => void;
    /** Tell the provider which conversation thread is currently open on screen.
     *  Used to suppress the new-message sound for a conversation the user is
     *  already looking at. Pass `null` when no thread is open. */
    setActiveConversation: (conversationId: string | null) => void;
    lastError: { code?: number; reason?: string; at: number } | null;
    gaveUp: boolean;
    retry: () => void;
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

const HEARTBEAT_MS = 30_000;
const STALE_INBOUND_MS = 75_000;
const TYPING_AUTOCLEAR_MS = 6_000;
// Exponential backoff between reconnect attempts:
//   delay = min(RECONNECT_BASE_MS * 2^(attempt-1), RECONNECT_MAX_MS)
// Spaced out so a flaky/offline server isn't hammered with rapid retries.
// Schedule: 3s → 6s → 12s → 24s → 48s → 60s → 60s …
const RECONNECT_BASE_MS = 3_000;
const RECONNECT_MAX_MS = 60_000;
const RECONNECT_MAX_ATTEMPTS = 10;
const OUTBOUND_QUEUE_MAX = 50;
const NO_RETRY_CLOSE_CODES = new Set<number>([4001, 4003, 4401, 4403]);

const log = (event: string, extra?: Record<string, unknown>) => {
    if (typeof console !== 'undefined') {
        console.info(`[chat-ws] ${event}`, extra ?? {});
    }
};

const buildWsUrl = (): string | null => {
    const explicit = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL;
    const fallback =
        typeof window !== 'undefined'
            ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000`
            : null;
    const raw = explicit || fallback;
    if (!raw) return null;
    const trimmed = raw
        .replace(/^http:\/\//, 'ws://')
        .replace(/^https:\/\//, 'wss://')
        .replace(/\/api\/?$/, '')
        .replace(/\/+$/, '');
    return trimmed.endsWith('/ws/chat') ? `${trimmed}/` : `${trimmed}/ws/chat/`;
};

export function ChatSocketProvider({ children }: { children: ReactNode }) {
    const qc = useQueryClient();

    const profileQuery = useProfileQuery();
    const isLoggedIn = !!profileQuery.data;

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scheduleReconnectRef = useRef<(() => void) | null>(null);
    const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const aliveCheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const connectGenRef = useRef(0);

    const lastInboundAtRef = useRef<number>(0);
    // Conversation whose thread is open on screen — read in applyMessageNew to
    // skip the alert sound for a chat the user is already viewing. A ref (not
    // state) so the message handler always sees the latest value without
    // re-creating the callback.
    const activeConversationIdRef = useRef<string | null>(null);
    const outboundQueueRef = useRef<ChatClientEvent[]>([]);
    const pendingCatchupRef = useRef(false);
    const isLoggedInRef = useRef(isLoggedIn);

    const [status, setStatus] = useState<ChatSocketStatus>('idle');
    const [typingByConversation, setTypingByConversation] = useState<
        Record<string, ReadonlySet<string>>
    >({});
    const [presenceByUser, setPresenceByUser] = useState<Record<string, PresenceStatus>>({});
    const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({});
    const [lastError, setLastError] = useState<ChatSocketContextValue['lastError']>(null);
    const [gaveUp, setGaveUp] = useState(false);

    useEffect(() => {
        isLoggedInRef.current = isLoggedIn;
    }, [isLoggedIn]);

    const send = useCallback((event: ChatClientEvent) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(event));
            return;
        }
        if (event.type === 'presence.heartbeat') return;
        const q = outboundQueueRef.current;
        if (q.length >= OUTBOUND_QUEUE_MAX) {
            const dropped = q.shift();
            log('outbound queue overflow — dropped oldest', { droppedType: dropped?.type });
        }
        q.push(event);
        log('queued outbound (socket not open)', { type: event.type, queued: q.length });
    }, []);

    const applyMessageNew = useCallback(
        (conversationId: string, message: ChatMessage) => {
            const me = qc.getQueryData<UserProfile>(['profile']);
            const isMine = !!me && message.sender?.id === me.id;

            // Is the user already looking at this exact conversation (its thread
            // is open AND the tab is in the foreground)? Then the message is
            // effectively "seen" — it must not ding or bump any unread count.
            const isViewingThisChat =
                activeConversationIdRef.current === conversationId &&
                typeof document !== 'undefined' &&
                document.visibilityState === 'visible';
            // A message I sent, or one in the chat I'm watching, is never unread.
            const countsAsUnread = !isMine && !isViewingThisChat;

            qc.setQueryData<ChatMessage[]>(chatKeys.messages(conversationId), (prev) => {
                if (!prev) return prev;
                if (message.clientMessageId) {
                    const idx = prev.findIndex(
                        (m) => m.clientMessageId && m.clientMessageId === message.clientMessageId,
                    );
                    if (idx !== -1) {
                        const next = prev.slice();
                        next[idx] = message;
                        return next;
                    }
                }
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
            });

            qc.setQueryData<ChatConversation[]>(chatKeys.conversations, (prev) => {
                if (!prev) return prev;
                const idx = prev.findIndex((c) => c.id === conversationId);
                if (idx === -1) {
                    qc.invalidateQueries({ queryKey: chatKeys.conversations });
                    return prev;
                }
                const conv = prev[idx];
                const updated: ChatConversation = {
                    ...conv,
                    lastMessage: message,
                    updatedAt: message.createdAt,
                    unreadCount: countsAsUnread ? conv.unreadCount + 1 : conv.unreadCount,
                };
                return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
            });

            // Track unread locally too. The cache write above gets clobbered by
            // the next `/api/chat/conversations` refetch (which may return a
            // stale/zero `unreadCount`); this tally does not, so the badge
            // survives until the user actually opens the thread.
            if (countsAsUnread) {
                setUnreadByConversation((prev) => ({
                    ...prev,
                    [conversationId]: (prev[conversationId] ?? 0) + 1,
                }));
                // Audible alert for the incoming message (gym boxing-bell).
                playNewMessageSound();
            }
        },
        [qc],
    );

    const applyMessageDeleted = useCallback(
        (conversationId: string, messageId: string) => {
            qc.setQueryData<ChatMessage[] | undefined>(
                chatKeys.messages(conversationId),
                (prev) => prev?.filter((m) => m.id !== messageId),
            );
            qc.invalidateQueries({ queryKey: chatKeys.conversations });
        },
        [qc],
    );

    const applyMessageUpdated = useCallback(
        (conversationId: string, message: ChatMessage) => {
            qc.setQueryData<ChatMessage[] | undefined>(
                chatKeys.messages(conversationId),
                (prev) => prev?.map((m) => (m.id === message.id ? message : m)),
            );
            qc.setQueryData<ChatConversation[] | undefined>(
                chatKeys.conversations,
                (prev) =>
                    prev?.map((conversation) =>
                        conversation.lastMessage?.id === message.id
                            ? { ...conversation, lastMessage: message }
                            : conversation,
                    ),
            );
        },
        [qc],
    );

    const setActiveConversation = useCallback((conversationId: string | null) => {
        activeConversationIdRef.current = conversationId;
    }, []);

    const clearUnread = useCallback((conversationId: string) => {
        setUnreadByConversation((prev) => {
            if (!(conversationId in prev)) return prev;
            const next = { ...prev };
            delete next[conversationId];
            return next;
        });
    }, []);

    const applyTypingUpdate = useCallback(
        (conversationId: string, userId: string, isTyping: boolean) => {
            setTypingByConversation((prev) => {
                const current = new Set(prev[conversationId] ?? []);
                if (isTyping) current.add(userId);
                else current.delete(userId);
                return { ...prev, [conversationId]: current };
            });

            const key = `${conversationId}::${userId}`;
            const existing = typingTimeoutsRef.current.get(key);
            if (existing) clearTimeout(existing);
            if (isTyping) {
                const t = setTimeout(() => {
                    setTypingByConversation((prev) => {
                        const current = new Set(prev[conversationId] ?? []);
                        current.delete(userId);
                        return { ...prev, [conversationId]: current };
                    });
                    typingTimeoutsRef.current.delete(key);
                }, TYPING_AUTOCLEAR_MS);
                typingTimeoutsRef.current.set(key, t);
            } else {
                typingTimeoutsRef.current.delete(key);
            }
        },
        [],
    );

    const applyPresenceUpdate = useCallback((userId: string, presence: PresenceStatus) => {
        setPresenceByUser((prev) => ({ ...prev, [userId]: presence }));
    }, []);

    const clearHeartbeat = () => {
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
    };

    const clearAliveCheck = () => {
        if (aliveCheckTimerRef.current) {
            clearInterval(aliveCheckTimerRef.current);
            aliveCheckTimerRef.current = null;
        }
    };

    const clearReconnect = () => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    };

    const teardown = useCallback(() => {
        clearHeartbeat();
        clearAliveCheck();
        clearReconnect();
        typingTimeoutsRef.current.forEach(clearTimeout);
        typingTimeoutsRef.current.clear();
        connectGenRef.current += 1;
        const ws = wsRef.current;
        wsRef.current = null;
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            ws.close(1000, 'client disconnect');
        }
        reconnectAttemptRef.current = 0;
        outboundQueueRef.current = [];
        pendingCatchupRef.current = false;
        setStatus('idle');
        setTypingByConversation({});
        setPresenceByUser({});
        setUnreadByConversation({});
        setLastError(null);
        setGaveUp(false);
        log('teardown');
    }, []);

    const connect = useCallback(async () => {
        if (typeof window === 'undefined') return;
        if (!isLoggedInRef.current) return;
        if (wsRef.current) return;

        pendingCatchupRef.current = reconnectAttemptRef.current > 0;

        const baseUrl = buildWsUrl();
        if (!baseUrl) {
            log('WebSocket URL could not be resolved — cannot connect');
            setLastError({ reason: 'missing-ws-url', at: Date.now() });
            setStatus('closed');
            setGaveUp(true);
            return;
        }
        const myGen = ++connectGenRef.current;
        log('connecting', { attempt: reconnectAttemptRef.current });
        setStatus('connecting');

        let ticket: string;
        try {
            ticket = await getWsTicket();
        } catch (err) {
            if (myGen !== connectGenRef.current) return;
            const httpStatus = isAxiosError(err) ? err.response?.status : undefined;
            log('ticket fetch failed', { status: httpStatus, err: String(err) });
            setLastError({ code: httpStatus, reason: 'ticket-failed', at: Date.now() });
            setStatus('closed');
            if (httpStatus === 401 || httpStatus === 403) {
                setGaveUp(true);
                return;
            }
            scheduleReconnectRef.current?.();
            return;
        }

        if (myGen !== connectGenRef.current) return;
        if (!isLoggedInRef.current) {
            setStatus('idle');
            return;
        }

        const url = `${baseUrl}?ticket=${encodeURIComponent(ticket)}&ngrok-skip-browser-warning=true`;
        let ws: WebSocket;
        try {
            ws = new WebSocket(url);
        } catch (err) {
            log('constructor threw', { err: String(err) });
            setLastError({ reason: 'constructor-threw', at: Date.now() });
            setStatus('closed');
            scheduleReconnectRef.current?.();
            return;
        }
        wsRef.current = ws;

        ws.addEventListener('open', () => {
            if (wsRef.current !== ws) {
                log('stale open ignored');
                try { ws.close(1000, 'superseded'); } catch { /* noop */ }
                return;
            }
            log('open', { wasReconnect: pendingCatchupRef.current });
            setStatus('open');
            setLastError(null);
            setGaveUp(false);
            reconnectAttemptRef.current = 0;
            lastInboundAtRef.current = Date.now();

            heartbeatTimerRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'presence.heartbeat' } satisfies ChatClientEvent));
                }
            }, HEARTBEAT_MS);

            const settings = qc.getQueryData<ChatSettings>(chatKeys.settings);
            if (settings?.manualStatus) {
                ws.send(
                    JSON.stringify({
                        type: 'presence.set',
                        status: settings.manualStatus,
                    } satisfies ChatClientEvent),
                );
            }

            aliveCheckTimerRef.current = setInterval(() => {
                if (ws.readyState !== WebSocket.OPEN) return;
                const silence = Date.now() - lastInboundAtRef.current;
                if (silence > STALE_INBOUND_MS) {
                    log('alive-check failed — forcing reconnect', { silenceMs: silence });
                    try { ws.close(4000, 'stale'); } catch { /* noop */ }
                }
            }, HEARTBEAT_MS);

            if (pendingCatchupRef.current) {
                log('catch-up refetch after reconnect');
                qc.invalidateQueries({ queryKey: chatKeys.conversations });
                pendingCatchupRef.current = false;
            }

            const queued = outboundQueueRef.current;
            if (queued.length > 0) {
                log('flushing outbound queue', { count: queued.length });
                outboundQueueRef.current = [];
                for (const ev of queued) {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify(ev));
                    }
                }
            }
        });

        ws.addEventListener('message', (e) => {
            if (wsRef.current !== ws) return;
            lastInboundAtRef.current = Date.now();
            let payload: ChatServerEvent;
            try {
                payload = JSON.parse(typeof e.data === 'string' ? e.data : '');
            } catch {
                log('dropped non-JSON frame');
                return;
            }
            switch (payload.type) {
                case 'message.new':
                    applyMessageNew(payload.conversationId, payload.message);
                    break;
                case 'message.updated':
                    applyMessageUpdated(payload.conversationId, payload.message);
                    break;
                case 'message.deleted':
                    applyMessageDeleted(payload.conversationId, payload.messageId);
                    break;
                case 'typing.update':
                    applyTypingUpdate(payload.conversationId, payload.userId, payload.isTyping);
                    break;
                case 'presence.update':
                    applyPresenceUpdate(payload.userId, payload.status);
                    break;
                case 'notification.new':
                    applyNotificationNew(qc, payload.notification, payload.unreadCount);
                    playNotificationSound();
                    break;
                case 'notification.read':
                    applyNotificationRead(qc, payload.notificationId, payload.unreadCount);
                    break;
                case 'notification.deleted':
                    applyNotificationDeleted(qc, payload.notificationId, payload.unreadCount);
                    break;
                case 'notification.clear':
                    applyNotificationsCleared(qc);
                    break;
                default:
                    break;
            }
        });

        ws.addEventListener('close', (event) => {
            const code = event.code;
            const reason = event.reason || undefined;
            if (wsRef.current !== ws) {
                log('stale close ignored', { code, reason, wasClean: event.wasClean });
                return;
            }
            clearHeartbeat();
            clearAliveCheck();
            wsRef.current = null;
            setStatus('closed');
            log('close', { code, reason, wasClean: event.wasClean });
            if (code === 1000) return;
            setLastError({ code, reason, at: Date.now() });
            if (NO_RETRY_CLOSE_CODES.has(code)) {
                log('close code is no-retry — stopping', { code });
                setGaveUp(true);
                return;
            }
            scheduleReconnectRef.current?.();
        });

        ws.addEventListener('error', () => {
            if (wsRef.current !== ws) return;
            log('error event');
        });
    }, [
        applyMessageDeleted,
        applyMessageNew,
        applyMessageUpdated,
        applyPresenceUpdate,
        applyTypingUpdate,
        qc,
    ]);

    const scheduleReconnect = useCallback(() => {
        if (!isLoggedInRef.current) return;
        if (reconnectAttemptRef.current >= RECONNECT_MAX_ATTEMPTS) {
            log('reconnect cap reached — giving up', {
                attempts: reconnectAttemptRef.current,
            });
            setGaveUp(true);
            return;
        }
        if (reconnectTimerRef.current) return;
        reconnectAttemptRef.current += 1;
        const delay = Math.min(
            RECONNECT_BASE_MS * 2 ** (reconnectAttemptRef.current - 1),
            RECONNECT_MAX_MS,
        );
        log('scheduled reconnect', { attempt: reconnectAttemptRef.current, delayMs: delay });
        reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            void connect();
        }, delay);
    }, [connect]);

    useEffect(() => {
        scheduleReconnectRef.current = scheduleReconnect;
    }, [scheduleReconnect]);

    const retry = useCallback(() => {
        if (!isLoggedInRef.current) return;
        log('manual retry');
        clearReconnect();
        reconnectAttemptRef.current = 0;
        setGaveUp(false);
        connectGenRef.current += 1;
        const ws = wsRef.current;
        wsRef.current = null;
        if (ws && ws.readyState !== WebSocket.CLOSED) {
            try { ws.close(1000, 'retry'); } catch { /* noop */ }
        }
        void connect();
    }, [connect]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isLoggedIn) void connect();
            else teardown();
        }, 0);
        return () => clearTimeout(timer);
    }, [isLoggedIn, connect, teardown]);

    useEffect(() => () => teardown(), [teardown]);

    useEffect(() => {
        const onBeforeUnload = () => {
            const ws = wsRef.current;
            if (ws && ws.readyState === WebSocket.OPEN) ws.close(1000, 'unload');
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, []);

    useEffect(() => {
        const onOnline = () => {
            if (!isLoggedInRef.current) return;
            log('online — forcing retry');
            retry();
        };
        const onOffline = () => {
            log('offline — pausing reconnect');
            clearReconnect();
        };
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, [retry]);

    useEffect(() => {
        const onVisibility = () => {
            if (document.visibilityState !== 'visible') return;
            if (!isLoggedInRef.current) return;
            const ws = wsRef.current;
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                log('visible & socket not open — forcing retry', {
                    readyState: ws?.readyState,
                });
                retry();
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [retry]);

    const sendMessage = useCallback(
        (conversationId: string, body: string, clientMessageId?: string) => {
            send({
                type: 'message.send',
                conversationId,
                body,
                ...(clientMessageId ? { clientMessageId } : {}),
            });
        },
        [send],
    );

    const startTyping = useCallback(
        (conversationId: string) => send({ type: 'typing.start', conversationId }),
        [send],
    );

    const stopTyping = useCallback(
        (conversationId: string) => send({ type: 'typing.stop', conversationId }),
        [send],
    );

    const setPresence = useCallback(
        (presence: PresenceStatus) => send({ type: 'presence.set', status: presence }),
        [send],
    );

    const watchPresence = useCallback(
        (userIds: string[]) => send({ type: 'presence.watch', userIds }),
        [send],
    );

    return (
        <ChatSocketContext.Provider
            value={{
                status,
                typingByConversation,
                presenceByUser,
                unreadByConversation,
                clearUnread,
                setActiveConversation,
                lastError,
                gaveUp,
                retry,
                sendMessage,
                startTyping,
                stopTyping,
                setPresence,
                watchPresence,
            }}
        >
            {children}
        </ChatSocketContext.Provider>
    );
}

export const useChatSocket = (): ChatSocketContextValue => {
    const ctx = useContext(ChatSocketContext);
    if (!ctx) {
        throw new Error('useChatSocket must be used within <ChatSocketProvider>');
    }
    return ctx;
};
