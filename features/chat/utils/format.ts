import type { ChatConversation, ChatUser } from '../types';

export const initials = (name: string) =>
    name
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

export const pickOtherUser = (
    conversation: ChatConversation,
    meId: string | undefined,
): ChatUser | undefined => {
    const parts = conversation.participants ?? [];
    if (!parts.length) return undefined;
    if (!meId) return parts[0]?.user;
    const other = parts.find((p) => p.user?.id !== meId);
    return (other ?? parts[0])?.user;
};
