'use client';

import { Check, CheckCheck, Clock, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { formatClockTime } from '@/utils/format';
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
    editInput:
        'min-w-[220px] w-full resize-none rounded-xl border border-black/10 bg-black/10 px-2.5 py-2 text-sm text-current outline-none focus:border-black/20',
    attachment:
        'mt-1 max-w-full rounded-lg border border-white/10 max-h-60 object-cover',
    meta: (mine: boolean) =>
        `flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`,
    time: (mine: boolean) => `text-[10px] ${mine ? 'opacity-70' : 'opacity-60'}`,
    iconBtn:
        'p-0.5 rounded text-current opacity-60 hover:opacity-100 hover:bg-black/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
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

export const MessageBubble = ({
    message,
    mine,
    read,
    canDelete = false,
    canEdit = false,
    deleting = false,
    editing = false,
    deleteLabel,
    editLabel,
    saveEditLabel,
    cancelEditLabel,
    editedLabel,
    onDelete,
    onEdit,
}: {
    message: ChatMessage;
    mine: boolean;
    /** Whether the other participant has read this (mine) message. */
    read?: boolean;
    canDelete?: boolean;
    canEdit?: boolean;
    deleting?: boolean;
    editing?: boolean;
    deleteLabel?: string;
    editLabel?: string;
    saveEditLabel?: string;
    cancelEditLabel?: string;
    editedLabel?: string;
    onDelete?: () => void;
    onEdit?: (body: string) => void;
}) => {
    const locale = useLocale();
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(message.body);
    // Optimistic messages keep a `tmp:` id until the server echo arrives.
    const sending = message.id.startsWith('tmp:');
    const trimmedDraft = draft.trim();
    const canSaveEdit = trimmedDraft.length > 0 && trimmedDraft !== message.body.trim();
    const isEdited =
        !sending &&
        message.updatedAt &&
        new Date(message.updatedAt).getTime() - new Date(message.createdAt).getTime() > 1000;

    const startEdit = () => {
        setDraft(message.body);
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setDraft(message.body);
        setIsEditing(false);
    };

    const saveEdit = () => {
        if (!canSaveEdit || !onEdit) return;
        onEdit(trimmedDraft);
        setIsEditing(false);
    };

    return (
        <div className={styles.row(mine)}>
            <div className={styles.bubble(mine)}>
                {isEditing ? (
                    <textarea
                        rows={3}
                        value={draft}
                        className={styles.editInput}
                        autoFocus
                        disabled={editing}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelEdit();
                            }
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                saveEdit();
                            }
                        }}
                    />
                ) : message.body && (
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
                    {mine && isEditing && (
                        <>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={saveEdit}
                                disabled={!canSaveEdit || editing}
                                aria-label={saveEditLabel}
                                title={saveEditLabel}
                            >
                                {editing ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Check size={12} />
                                )}
                            </button>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={cancelEdit}
                                disabled={editing}
                                aria-label={cancelEditLabel}
                                title={cancelEditLabel}
                            >
                                <X size={12} />
                            </button>
                        </>
                    )}
                    {mine && !isEditing && canEdit && onEdit && (
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={startEdit}
                            disabled={editing || deleting}
                            aria-label={editLabel}
                            title={editLabel}
                        >
                            <Pencil size={12} />
                        </button>
                    )}
                    {mine && canDelete && onDelete && (
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={onDelete}
                            disabled={deleting || editing || isEditing}
                            aria-label={deleteLabel}
                            title={deleteLabel}
                        >
                            {deleting ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <Trash2 size={12} />
                            )}
                        </button>
                    )}
                    <span className={styles.time(mine)}>
                        {formatClockTime(message.createdAt, locale)}
                        {isEdited && editedLabel ? ` ${editedLabel}` : ''}
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
