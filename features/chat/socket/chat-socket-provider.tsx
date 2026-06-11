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
import { getWsTicket } from '@/features/auth/services/auth.service';
import { useProfileQuery } from '@/features/profile/services/profile.service';
import type { UserProfile } from '@/features/profile/types';
import type {
    ChatClientEvent,
    ChatConversation,
    ChatMessage,
    ChatServerEvent,
    PresenceStatus,
} from '../types';

export type ChatSocketStatus = 'idle' | 'connecting' | 'open' | 'closed';

export interface ChatSocketActions {
    sendMessage: (conversationId: string, body: string, clientMessageId?: string) => void;
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
    setPresence: (status: PresenceStatus) => void;
}

export interface ChatSocketContextValue extends ChatSocketActions {
    status: ChatSocketStatus;
    /** conversationId → set of userIds currently typing (excluding self). */
    typingByConversation: Record<string, ReadonlySet<string>>;
    /** userId → last presence status received over the wire. */
    presenceByUser: Record<string, PresenceStatus>;
    /** Last error tagged with code/reason so UI can surface a banner.
     *  Cleared on the next successful `open`. */
    lastError: { code?: number; reason?: string; at: number } | null;
    /** Whether the reconnect cap has been hit and we've given up. UI should
     *  offer a "Reconnect" button bound to `retry()` in that state. */
    gaveUp: boolean;
    /** Force a reconnect attempt — resets the backoff counter. Safe to call
     *  even when already connected (no-op). */
    retry: () => void;
}

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

// ── Tunables ────────────────────────────────────────────────────────────────
const HEARTBEAT_MS = 30_000;
/** If we receive no inbound traffic for this long while the socket reports
 *  OPEN, assume the connection is half-dead (TCP didn't FIN/RST) and force
 *  a reconnect. Set well above `HEARTBEAT_MS` so a single missed beat
 *  doesn't trigger a churn loop. */
const STALE_INBOUND_MS = 75_000;
/** If the server forgets to send `typing.stop`, drop the indicator anyway. */
const TYPING_AUTOCLEAR_MS = 6_000;
const RECONNECT_BASE_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;
const RECONNECT_MAX_ATTEMPTS = 10;
/** Soft cap on the outbound queue — protects against runaway memory if the
 *  user keeps typing into a long-disconnected socket. Oldest events are
 *  dropped first when the cap is hit. */
const OUTBOUND_QUEUE_MAX = 50;
/** Close codes that mean "do not reconnect" — typically auth failures the
 *  backend signals on the upgrade or first frame. Anything else (1006
 *  abnormal close, 1011 server error, network drops, …) is retried. */
const NO_RETRY_CLOSE_CODES = new Set<number>([4001, 4003, 4401, 4403]);

const log = (event: string, extra?: Record<string, unknown>) => {
    // Tagged so devtools can filter on `[chat-ws]`. We keep this on by
    // default because connection issues are otherwise invisible to the user
    // until a send silently fails.
    if (typeof console !== 'undefined') {
        console.info(`[chat-ws] ${event}`, extra ?? {});
    }
};

/** Resolve the chat WebSocket URL from the dedicated env var. Kept separate
 *  from `NEXT_PUBLIC_API_URL` on purpose: the WS endpoint can live on a
 *  different host/port (and uses a different scheme), so coupling the two
 *  was masking misconfigurations as connection failures. Returns `null`
 *  when the env var is missing so the caller can surface a clear error
 *  instead of silently dialing a wrong URL. */
const buildWsUrl = (): string | null => {
    const explicit = process.env.NEXT_PUBLIC_WS_URL;
    if (!explicit) return null;
    const trimmed = explicit.replace(/\/+$/, '');
    return trimmed.endsWith('/ws/chat') ? `${trimmed}/` : `${trimmed}/ws/chat/`;
};

export function ChatSocketProvider({ children }: { children: ReactNode }) {
    const qc = useQueryClient();

    const profileQuery = useProfileQuery();
    const isLoggedIn = !!profileQuery.data;

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const aliveCheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    // Generation counter for connect attempts. Bumped on every connect() call,
    // teardown(), and retry(). The ticket fetch awaits an HTTP round-trip, so
    // we use this to detect when the in-flight attempt has been superseded by
    // a newer one (e.g. retry() during ticket fetch, or auth-state change).
    const connectGenRef = useRef(0);
 
    const lastInboundAtRef = useRef<number>(0);
    /** Events queued because the socket wasn't OPEN. Flushed on the next
     *  successful `open`. Capped at `OUTBOUND_QUEUE_MAX`. */
    const outboundQueueRef = useRef<ChatClientEvent[]>([]);
    /** True the next time `open` fires if this is a reconnect (not the
     *  initial connect). Lets us trigger a catch-up refetch only when it
     *  actually matters. */
    const pendingCatchupRef = useRef(false);
    // Mirror auth state into a ref so timer callbacks see the latest value
    // without re-creating the connect closure.
    const isLoggedInRef = useRef(isLoggedIn);
    isLoggedInRef.current = isLoggedIn;

    const [status, setStatus] = useState<ChatSocketStatus>('idle');
    const [typingByConversation, setTypingByConversation] = useState<
        Record<string, ReadonlySet<string>>
    >({});
    const [presenceByUser, setPresenceByUser] = useState<Record<string, PresenceStatus>>({});
    const [lastError, setLastError] = useState<ChatSocketContextValue['lastError']>(null);
    const [gaveUp, setGaveUp] = useState(false);

    // ── Send helper ─────────────────────────────────────────────────────────
    const send = useCallback((event: ChatClientEvent) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(event));
            return;
        }
        // Don't queue heartbeats — they're only useful at "now" and would
        // pile up uselessly behind a long outage.
        if (event.type === 'presence.heartbeat') return;
        // Queue with FIFO drop so a disconnected tab can't grow memory
        // without bound.
        const q = outboundQueueRef.current;
        if (q.length >= OUTBOUND_QUEUE_MAX) {
            const dropped = q.shift();
            log('outbound queue overflow — dropped oldest', { droppedType: dropped?.type });
        }
        q.push(event);
        log('queued outbound (socket not open)', { type: event.type, queued: q.length });
    }, []);

    // ── Incoming event → cache / state ──────────────────────────────────────

    const applyMessageNew = useCallback(
        (conversationId: string, message: ChatMessage) => {
  
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

            // 2. Bump the conversation list: move the conv to the top, refresh
            //    lastMessage / updatedAt, increment unread for everyone except
            //    the sender (which may be the current user echoing back).
            qc.setQueryData<ChatConversation[]>(chatKeys.conversations, (prev) => {
                if (!prev) return prev;
                const idx = prev.findIndex((c) => c.id === conversationId);
                if (idx === -1) {
                    // Conv not in our list yet (e.g. brand-new convo from
                    // someone we hadn't talked to). Refetch to discover it.
                    qc.invalidateQueries({ queryKey: chatKeys.conversations });
                    return prev;
                }
                const me = qc.getQueryData<UserProfile>(['profile']);
                const isMine = !!me && message.sender?.id === me.id;
                const conv = prev[idx];
                const updated: ChatConversation = {
                    ...conv,
                    lastMessage: message,
                    updatedAt: message.createdAt,
                    unreadCount: isMine ? conv.unreadCount : conv.unreadCount + 1,
                };
                return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
            });
        },
        [qc],
    );

    const applyTypingUpdate = useCallback(
        (conversationId: string, userId: string, isTyping: boolean) => {
            setTypingByConversation((prev) => {
                const current = new Set(prev[conversationId] ?? []);
                if (isTyping) current.add(userId);
                else current.delete(userId);
                return { ...prev, [conversationId]: current };
            });

            // Drop-the-typing-bubble safety net: if `typing.stop` never arrives
            // (closed tab, network drop), auto-clear after a few seconds.
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

    // ── Connection lifecycle ────────────────────────────────────────────────

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
        // Invalidate any in-flight ticket fetch so it doesn't resurrect a
        // socket after we've torn down.
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
        setLastError(null);
        setGaveUp(false);
        log('teardown');
    }, []);

    const connect = useCallback(async () => {
        if (typeof window === 'undefined') return;
        if (!isLoggedInRef.current) return;
        if (wsRef.current) return;

        // Tag this attempt as a reconnect *before* the open handler fires so
        // the catch-up branch can decide whether to refetch.
        pendingCatchupRef.current = reconnectAttemptRef.current > 0;

        const baseUrl = buildWsUrl();
        if (!baseUrl) {
            log('NEXT_PUBLIC_WS_URL is not set — cannot connect');
            setLastError({ reason: 'missing-ws-url', at: Date.now() });
            setStatus('closed');
            setGaveUp(true);
            return;
        }
        const myGen = ++connectGenRef.current;
        log('connecting', { attempt: reconnectAttemptRef.current });
        setStatus('connecting');

        // Trade the HTTP session for a 60-second WS ticket. The HttpOnly
        // access_token cookie can't be relied on at the WS host because
        // Chrome partitions cookies across the Next proxy origin (:3000)
        // and Daphne (:8001), so the backend hands us a short-lived JWT
        // to put on the upgrade URL. A fresh ticket per (re)connect keeps
        // us well inside the 60s exp window.
        let ticket: string;
        try {
            ticket = await getWsTicket();
        } catch (err) {
            // Superseded by a newer attempt — let it own status/state.
            if (myGen !== connectGenRef.current) return;
            const httpStatus = isAxiosError(err) ? err.response?.status : undefined;
            log('ticket fetch failed', { status: httpStatus, err: String(err) });
            setLastError({ code: httpStatus, reason: 'ticket-failed', at: Date.now() });
            setStatus('closed');
            // 401/403 means we're not authenticated. The axios interceptor
            // already redirects to /login on 401, and the auth-state effect
            // will tear us down once the profile query reflects the logout.
            // Don't burn reconnect attempts in the meantime.
            if (httpStatus === 401 || httpStatus === 403) {
                setGaveUp(true);
                return;
            }
            scheduleReconnect();
            return;
        }

        // Bail if auth state flipped or a newer connect superseded us
        // during the await.
        if (myGen !== connectGenRef.current) return;
        if (!isLoggedInRef.current) {
            setStatus('idle');
            return;
        }

        const url = `${baseUrl}?ticket=${encodeURIComponent(ticket)}`;
        let ws: WebSocket;
        try {
            ws = new WebSocket(url);
        } catch (err) {
            log('constructor threw', { err: String(err) });
            setLastError({ reason: 'constructor-threw', at: Date.now() });
            setStatus('closed');
            scheduleReconnect();
            return;
        }
        wsRef.current = ws;

        ws.addEventListener('open', () => {
            // Ignore late `open` from a socket that's already been replaced
            // (e.g. teardown → connect raced ahead in Strict Mode).
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

            // App-level heartbeat (server-driven keepalive).
            heartbeatTimerRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'presence.heartbeat' } satisfies ChatClientEvent));
                }
            }, HEARTBEAT_MS);

            // Independent alive-check: if no INBOUND frame for STALE_INBOUND_MS
            // while readyState says OPEN, the connection is half-dead — force
            // close so the close handler triggers a reconnect.
            aliveCheckTimerRef.current = setInterval(() => {
                if (ws.readyState !== WebSocket.OPEN) return;
                const silence = Date.now() - lastInboundAtRef.current;
                if (silence > STALE_INBOUND_MS) {
                    log('alive-check failed — forcing reconnect', { silenceMs: silence });
                    try { ws.close(4000, 'stale'); } catch { /* noop */ }
                }
            }, HEARTBEAT_MS);

            // Catch-up after a reconnect: invalidate the whole `['chat',
            // 'conversations']` prefix so the conversations list AND any open
            // `[..., id, 'messages']` query refetch. Anything pushed while we
            // were offline is recovered on the next paint.
            if (pendingCatchupRef.current) {
                log('catch-up refetch after reconnect');
                qc.invalidateQueries({ queryKey: chatKeys.conversations });
                pendingCatchupRef.current = false;
            }

            // Flush queued outbound (messages typed while disconnected).
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
                case 'typing.update':
                    applyTypingUpdate(payload.conversationId, payload.userId, payload.isTyping);
                    break;
                case 'presence.update':
                    applyPresenceUpdate(payload.userId, payload.status);
                    break;
                // notification.* events ride this same channel — handled by
                // features/notification, not here.
                default:
                    break;
            }
        });

        ws.addEventListener('close', (event) => {
            const code = event.code;
            const reason = event.reason || undefined;
            // Late close from a socket that's already been replaced by a
            // newer connect() (Strict Mode double-invoke, retry()/online/
            // visibility races). Do NOT clobber wsRef or status — the live
            // socket is a different instance.
            if (wsRef.current !== ws) {
                log('stale close ignored', { code, reason, wasClean: event.wasClean });
                return;
            }
            clearHeartbeat();
            clearAliveCheck();
            wsRef.current = null;
            setStatus('closed');
            log('close', { code, reason, wasClean: event.wasClean });
            // 1000 = normal closure (we called close ourselves). Don't surface
            // as an error, don't reconnect — the lifecycle effect will reopen
            // if the user is still logged in.
            if (code === 1000) return;
            setLastError({ code, reason, at: Date.now() });
            if (NO_RETRY_CLOSE_CODES.has(code)) {
                log('close code is no-retry — stopping', { code });
                setGaveUp(true);
                return;
            }
            scheduleReconnect();
        });

        ws.addEventListener('error', () => {
            if (wsRef.current !== ws) return;
            // Browsers intentionally hide the error reason for security. The
            // following `close` event has the real diagnostic info.
            log('error event');
        });
    }, [applyMessageNew, applyPresenceUpdate, applyTypingUpdate, qc]);

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

    /** User-facing manual reconnect: clear the cap, drop any current socket,
     *  and try again immediately. */
    const retry = useCallback(() => {
        if (!isLoggedInRef.current) return;
        log('manual retry');
        clearReconnect();
        reconnectAttemptRef.current = 0;
        setGaveUp(false);
        // Supersede any in-flight ticket fetch from the previous attempt.
        connectGenRef.current += 1;
        const ws = wsRef.current;
        wsRef.current = null;
        if (ws && ws.readyState !== WebSocket.CLOSED) {
            try { ws.close(1000, 'retry'); } catch { /* noop */ }
        }
        void connect();
    }, [connect]);

    // Gate connection on auth state.
    useEffect(() => {
        if (isLoggedIn) void connect();
        else teardown();
    }, [isLoggedIn, connect, teardown]);

    // Tear down on full provider unmount.
    useEffect(() => () => teardown(), [teardown]);

    // Best-effort graceful close when the tab is closing.
    useEffect(() => {
        const onBeforeUnload = () => {
            const ws = wsRef.current;
            if (ws && ws.readyState === WebSocket.OPEN) ws.close(1000, 'unload');
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, []);

    // Reconnect promptly when the network comes back, and stop burning
    // attempts while it's down. Without this we wait for the exponential
    // timer even after the OS reports the link is up again.
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

    // When a backgrounded tab becomes visible again, the socket may be
    // silently dead (mobile browsers suspend WS without firing close). On
    // visibility return, verify the readyState and force a reconnect if
    // we're not actually OPEN.
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

    // ── Public actions ──────────────────────────────────────────────────────

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

    return (
        <ChatSocketContext.Provider
            value={{
                status,
                typingByConversation,
                presenceByUser,
                lastError,
                gaveUp,
                retry,
                sendMessage,
                startTyping,
                stopTyping,
                setPresence,
            }}
        >
            {children}
        </ChatSocketContext.Provider>
    );
}

/** Read the live chat socket from anywhere in the tree. Throws if used
 *  outside `<ChatSocketProvider>` — that's almost always a bug worth
 *  surfacing rather than silently no-op'ing. */
export const useChatSocket = (): ChatSocketContextValue => {
    const ctx = useContext(ChatSocketContext);
    if (!ctx) {
        throw new Error('useChatSocket must be used within <ChatSocketProvider>');
    }
    return ctx;
};
