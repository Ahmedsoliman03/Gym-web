'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { chatKeys } from '../services/chat.service';
import { useProfileQuery } from '@/features/profile/services/profile.service';
import { buildWsUrl, getWsTicket, log, NO_RETRY_CLOSE_CODES } from './socket';
import { createReconnector } from './reconnect';
import { createHeartbeat } from './heartbeat';
import { OutboundQueue } from './queue';
import { createMessageHandlers } from './handlers/message';
import { createTypingHandler } from './handlers/typing';
import { createPresenceHandler } from './handlers/presence';
import { createNotificationHandlers } from './handlers/notification';
import type { ChatClientEvent, ChatServerEvent, ChatSettings, PresenceStatus } from '../types';

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
    unreadByConversation: Record<string, number>;
    /** Drop a conversation's local unread tally — call alongside markRead. */
    clearUnread: (conversationId: string) => void;
    setActiveConversation: (conversationId: string | null) => void;
    lastError: { code?: number; reason?: string; at: number } | null;
    gaveUp: boolean;
    retry: () => void;
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

export function ChatSocketProvider({ children }: { children: ReactNode }) {
    const qc = useQueryClient();

    const profileQuery = useProfileQuery();
    const isLoggedIn = !!profileQuery.data;

    const wsRef = useRef<WebSocket | null>(null);
    const connectGenRef = useRef(0);
    const lastInboundAtRef = useRef<number>(0);
    const activeConversationIdRef = useRef<string | null>(null);
    const pendingCatchupRef = useRef(false);
    const isLoggedInRef = useRef(isLoggedIn);
    const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const queueRef = useRef<OutboundQueue>(new OutboundQueue());
    const connectRef = useRef<() => void>(() => {});

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

    // ── Event handlers (transport-agnostic) ────────────────────────────────────
    const messageHandlers = useMemo(
        () =>
            createMessageHandlers(qc, {
                isViewingConversation: (id) =>
                    activeConversationIdRef.current === id &&
                    typeof document !== 'undefined' &&
                    document.visibilityState === 'visible',
                bumpUnread: (id) =>
                    setUnreadByConversation((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 })),
            }),
        [qc],
    );
    const applyTypingUpdate = useMemo(
        () => createTypingHandler({ setTypingByConversation, timeouts: typingTimeoutsRef.current }),
        [],
    );
    const applyPresenceUpdate = useMemo(() => createPresenceHandler(setPresenceByUser), []);
    const notify = useMemo(() => createNotificationHandlers(qc), [qc]);

    // ── Outbound send (queues while disconnected) ───────────────────────────────
    const send = useCallback((event: ChatClientEvent) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(event));
            return;
        }
        if (event.type === 'presence.heartbeat') return;
        queueRef.current.enqueue(event);
    }, []);

    // ── Heartbeat + reconnection controllers (created once) ──────────────────────
    const heartbeat = useMemo(
        () =>
            createHeartbeat({
                sendHeartbeat: () => {
                    const ws = wsRef.current;
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'presence.heartbeat' } satisfies ChatClientEvent));
                    }
                },
                isConnected: () => wsRef.current?.readyState === WebSocket.OPEN,
                getLastInboundAt: () => lastInboundAtRef.current,
                onStale: () => {
                    const ws = wsRef.current;
                    try {
                        ws?.close(4000, 'stale');
                    } catch {
                        /* noop */
                    }
                },
            }),
        [],
    );

    const reconnector = useRef(
        createReconnector({
            isLoggedIn: () => isLoggedInRef.current,
            reconnect: () => connectRef.current(),
            onGiveUp: () => setGaveUp(true),
        }),
    ).current;

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

    const teardown = useCallback(() => {
        heartbeat.stop();
        reconnector.clear();
        reconnector.reset();
        typingTimeoutsRef.current.forEach(clearTimeout);
        typingTimeoutsRef.current.clear();
        connectGenRef.current += 1;

        const ws = wsRef.current;
        wsRef.current = null;
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            ws.close(1000, 'client disconnect');
        }

        queueRef.current.clear();
        pendingCatchupRef.current = false;
        setStatus('idle');
        setTypingByConversation({});
        setPresenceByUser({});
        setUnreadByConversation({});
        setLastError(null);
        setGaveUp(false);
        log('teardown');
    }, [heartbeat, reconnector]);

    const connect = useCallback(async () => {
        if (typeof window === 'undefined') return;
        if (!isLoggedInRef.current) return;
        if (wsRef.current) return;

        pendingCatchupRef.current = reconnector.attempt > 0;

        const baseUrl = buildWsUrl();
        if (!baseUrl) {
            log('WebSocket URL could not be resolved — cannot connect');
            setLastError({ reason: 'missing-ws-url', at: Date.now() });
            setStatus('closed');
            setGaveUp(true);
            return;
        }
        const myGen = ++connectGenRef.current;
        log('connecting', { attempt: reconnector.attempt });
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
            reconnector.schedule();
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
            reconnector.schedule();
            return;
        }
        wsRef.current = ws;

        ws.addEventListener('open', () => {
            if (wsRef.current !== ws) {
                log('stale open ignored');
                try {
                    ws.close(1000, 'superseded');
                } catch {
                    /* noop */
                }
                return;
            }
            log('open', { wasReconnect: pendingCatchupRef.current });
            setStatus('open');
            setLastError(null);
            setGaveUp(false);
            reconnector.reset();
            lastInboundAtRef.current = Date.now();
            heartbeat.start();

            const settings = qc.getQueryData<ChatSettings>(chatKeys.settings);
            if (settings?.manualStatus) {
                ws.send(
                    JSON.stringify({
                        type: 'presence.set',
                        status: settings.manualStatus,
                    } satisfies ChatClientEvent),
                );
            }

            if (pendingCatchupRef.current) {
                log('catch-up refetch after reconnect');
                qc.invalidateQueries({ queryKey: chatKeys.conversations });
                pendingCatchupRef.current = false;
            }

            queueRef.current.flush((event) => {
                if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(event));
            });
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
                    messageHandlers.applyMessageNew(payload.conversationId, payload.message);
                    break;
                case 'message.updated':
                    messageHandlers.applyMessageUpdated(payload.conversationId, payload.message);
                    break;
                case 'message.deleted':
                    messageHandlers.applyMessageDeleted(payload.conversationId, payload.messageId);
                    break;
                case 'typing.update':
                    applyTypingUpdate(payload.conversationId, payload.userId, payload.isTyping);
                    break;
                case 'presence.update':
                    applyPresenceUpdate(payload.userId, payload.status);
                    break;
                case 'notification.new':
                    notify.onNew(payload.notification, payload.unreadCount);
                    break;
                case 'notification.read':
                    notify.onRead(payload.notificationId, payload.unreadCount);
                    break;
                case 'notification.deleted':
                    notify.onDeleted(payload.notificationId, payload.unreadCount);
                    break;
                case 'notification.clear':
                    notify.onClear();
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
            heartbeat.stop();
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
            reconnector.schedule();
        });

        ws.addEventListener('error', () => {
            if (wsRef.current !== ws) return;
            log('error event');
        });
    }, [qc, messageHandlers, applyTypingUpdate, applyPresenceUpdate, notify, heartbeat, reconnector]);

    // Keep the reconnector's callback pointed at the latest `connect`.
    connectRef.current = () => {
        void connect();
    };

    const retry = useCallback(() => {
        if (!isLoggedInRef.current) return;
        log('manual retry');
        reconnector.clear();
        reconnector.reset();
        setGaveUp(false);
        connectGenRef.current += 1;
        const ws = wsRef.current;
        wsRef.current = null;
        if (ws && ws.readyState !== WebSocket.CLOSED) {
            try {
                ws.close(1000, 'retry');
            } catch {
                /* noop */
            }
        }
        void connect();
    }, [connect, reconnector]);

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
            reconnector.clear();
        };
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, [retry, reconnector]);

    useEffect(() => {
        const onVisibility = () => {
            if (document.visibilityState !== 'visible') return;
            if (!isLoggedInRef.current) return;
            const ws = wsRef.current;
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                log('visible & socket not open — forcing retry', { readyState: ws?.readyState });
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
