import type { Dispatch, SetStateAction } from 'react';

export const TYPING_AUTOCLEAR_MS = 6_000;

type TypingState = Record<string, ReadonlySet<string>>;

interface TypingHandlerDeps {
    setTypingByConversation: Dispatch<SetStateAction<TypingState>>;
    // Shared map of per-(conversation,user) auto-clear timers, owned by the
    // provider so it can clear them all on teardown.
    timeouts: Map<string, ReturnType<typeof setTimeout>>;
}

/**
 * Builds the `typing.update` handler. A typing indicator auto-clears after
 * TYPING_AUTOCLEAR_MS in case the matching `stop` frame never arrives.
 */
export function createTypingHandler(deps: TypingHandlerDeps) {
    return function applyTypingUpdate(conversationId: string, userId: string, isTyping: boolean) {
        deps.setTypingByConversation((prev) => {
            const current = new Set(prev[conversationId] ?? []);
            if (isTyping) current.add(userId);
            else current.delete(userId);
            return { ...prev, [conversationId]: current };
        });

        const key = `${conversationId}::${userId}`;
        const existing = deps.timeouts.get(key);
        if (existing) clearTimeout(existing);

        if (isTyping) {
            const timer = setTimeout(() => {
                deps.setTypingByConversation((prev) => {
                    const current = new Set(prev[conversationId] ?? []);
                    current.delete(userId);
                    return { ...prev, [conversationId]: current };
                });
                deps.timeouts.delete(key);
            }, TYPING_AUTOCLEAR_MS);
            deps.timeouts.set(key, timer);
        } else {
            deps.timeouts.delete(key);
        }
    };
}
