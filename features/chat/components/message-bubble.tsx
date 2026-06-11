'use client';

import { useLocale } from 'next-intl';
import type { ChatMessage } from '../types';

const styles = {
    row: (mine: boolean) =>
        `flex ${mine ? 'justify-end' : 'justify-start'}`,
    bubble: (mine: boolean) =>
        `max-w-[80%] rounded-2xl px-3.5 py-2 text-sm break-words ${
            mine
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-white/5 border border-white/10 text-foreground rounded-bl-md'
        }`,
    body: 'whitespace-pre-wrap',
    attachment:
        'mt-1 max-w-full rounded-lg border border-white/10 max-h-60 object-cover',
    time: (mine: boolean) =>
        `text-[10px] mt-1 ${mine ? 'opacity-70 text-right' : 'opacity-60 text-left'}`,
};

const formatTime = (iso: string, locale: string) => {
    try {
        return new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return '';
    }
};

export const MessageBubble = ({
    message,
    mine,
}: {
    message: ChatMessage;
    mine: boolean;
}) => {
    const locale = useLocale();
    return (
        <div className={styles.row(mine)}>
            <div className={styles.bubble(mine)}>
                {message.body && <div className={styles.body}>{message.body}</div>}
                {message.attachment && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={message.attachment}
                        alt=""
                        className={styles.attachment}
                    />
                )}
                <div className={styles.time(mine)}>
                    {formatTime(message.createdAt, locale)}
                </div>
            </div>
        </div>
    );
};
