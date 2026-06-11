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

export const formatWhen = (iso: string, locale: string) => {
    try {
        return new Intl.DateTimeFormat(locale, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return '';
    }
};

/** Pick the participant who is not the current user. Falls back to the first
 *  entry when `meId` is missing or there's only one participant — that lets
 *  the row still render with *some* user instead of crashing. */
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
