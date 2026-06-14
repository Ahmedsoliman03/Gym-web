'use client';

import { Check, CheckCheck, Clock } from 'lucide-react';
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
    meta: (mine: boolean) =>
        `flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`,
    time: (mine: boolean) => `text-[10px] ${mine ? 'opacity-70' : 'opacity-60'}`,
};

/** Split a message body into text + clickable links. Keeps the regex local
 *  (no shared `lastIndex` state) and tests each part with a non-global pattern
 *  so URLs — including shared map locations — render as anchors. */
const URL_SPLIT_RE = /(https?:\/\/[^\s]+)/g;
const isUrl = (part: string) => /^https?:\/\//.test(part);

const renderBody = (text: string) =>
    text.split(URL_SPLIT_RE).map((part, i) =>
        isUrl(part) ? (
            <a
                key={i}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 break-all hover:opacity-80"
            >
                {part}
            </a>
        ) : (
            <span key={i}>{part}</span>
        ),
    );

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
    read,
}: {
    message: ChatMessage;
    mine: boolean;
    /** Whether the other participant has read this (mine) message. */
    read?: boolean;
}) => {
    const locale = useLocale();
    // Optimistic messages keep a `tmp:` id until the server echo arrives.
    const sending = message.id.startsWith('tmp:');
    return (
        <div className={styles.row(mine)}>
            <div className={styles.bubble(mine)}>
                {message.body && (
                    <div className={styles.body}>{renderBody(message.body)}</div>
                )}
                {message.attachment && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={message.attachment}
                        alt=""
                        className={styles.attachment}
                    />
                )}
                <div className={styles.meta(mine)}>
                    <span className={styles.time(mine)}>
                        {formatTime(message.createdAt, locale)}
                    </span>
                    {mine &&
                        (sending ? (
                            <Clock size={12} className="opacity-60" />
                        ) : read ? (
                            // Coloured double-check once the recipient has read it.
                            <CheckCheck size={14} className="text-sky-300" />
                        ) : (
                            <Check size={14} className="opacity-60" />
                        ))}
                </div>
            </div>
        </div>
    );
};
