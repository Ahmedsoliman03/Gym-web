'use client';

import { Check, CheckCheck, Clock, Copy, Loader2, Pencil, Phone, Trash2, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatClockTime } from '@/utils/format';
import type { ChatMessage } from '../types';

const styles = {
    row: (mine: boolean) =>
        `flex ${mine ? 'justify-end' : 'justify-start'}`,
    bubble: (mine: boolean) =>
        `max-w-[80%] rounded-2xl px-3.5 py-2 text-sm break-words ${mine
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

const extractPhoneNumbers = (text: string): string[] => {
    const candidateRegex = /(\+?[\d\s-()]{9,20})/g;
    const candidates = text.match(candidateRegex) ?? [];
    const phoneNumbers: string[] = [];

    for (const cand of candidates) {
        const cleaned = cand.replace(/[^\d+]/g, '');
        const isEgyptian = /^01[0125]\d{8}$/.test(cleaned) || /^\+?201[0125]\d{8}$/.test(cleaned);
        const isInternational = /^\+\d{9,15}$/.test(cleaned);

        if (isEgyptian || isInternational) {
            phoneNumbers.push(cleaned);
        }
    }
    return Array.from(new Set(phoneNumbers));
};

const getCallLink = (phone: string): string => {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
};

const getWhatsAppLink = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('01')) {
        cleaned = '20' + cleaned.slice(1);
    } else if (cleaned.startsWith('+')) {
        cleaned = cleaned.slice(1);
    }
    return `https://wa.me/${cleaned}`;
};

export const MessageBubble = ({
    message,
    mine,
    read,
    canDelete = false,
    canEdit = false,
    deleting = false,
    editing = false,
    copyLabel,
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
    copyLabel?: string;
    deleteLabel?: string;
    editLabel?: string;
    saveEditLabel?: string;
    cancelEditLabel?: string;
    editedLabel?: string;
    onDelete?: () => void;
    onEdit?: (body: string) => void;
}) => {
    const locale = useLocale();
    const t = useTranslations('Chat');

    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(message.body);
    const phoneNumbers = message.body ? extractPhoneNumbers(message.body) : [];
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            const length = textareaRef.current.value.length;
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(length, length);
        }
    }, [isEditing]);

    // Optimistic messages keep a `tmp:` id until the server echo arrives.
    const sending = message.id.startsWith('tmp:');
    const trimmedDraft = draft.trim();
    const canSaveEdit = trimmedDraft.length > 0 && trimmedDraft !== message.body.trim();
    const isEdited =
        !sending &&
        message.updatedAt &&
        new Date(message.updatedAt).getTime() - new Date(message.createdAt).getTime() > 1000;

    // Copy is available on any message that has text — including the other
    // person's — and sits inline next to edit/delete (mine-only).
    const canCopy = !!message.body && !isEditing;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.body);
            toast.success(t('messageCopied'));
        } catch {
            // Clipboard can reject (permissions / insecure context) — fail quietly.
        }
    };

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
                        ref={textareaRef}
                        rows={3}
                        value={draft}
                        className={styles.editInput}
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
                ) : (
                    message.body && (
                        <>
                            <div className={styles.body}>{renderBody(message.body)}</div>
                            {phoneNumbers.length > 0 && (
                                <div className="mt-2 flex flex-col gap-1.5">
                                    {phoneNumbers.map((phone, idx) => (
                                        <div key={idx} className="flex flex-wrap gap-1.5 w-full">
                                            <a
                                                href={getCallLink(phone)}
                                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all duration-200 ${mine
                                                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                                    : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/10'
                                                    }`}
                                            >
                                                <Phone size={12} className={`${locale === 'ar' ? 'ml-1.5' : 'mr-1.5'} shrink-0`} />
                                                {t('callNumber', { number: phone })}
                                            </a>
                                            <a
                                                href={getWhatsAppLink(phone)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all duration-200 ${mine
                                                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'
                                                    }`}
                                            >
                                                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className={`${locale === 'ar' ? 'ml-1.5' : 'mr-1.5'} shrink-0`}>
                                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.412 1.451 5.453 0 9.894-4.38 9.897-9.761.002-2.605-1.01-5.056-2.85-6.902C17.266 2.096 14.82 1.082 12.2 1.082c-5.462 0-9.903 4.38-9.906 9.762-.001 2.012.528 3.98 1.53 5.733l-.999 3.651 3.822-.974zm10.963-3.41c-.266-.134-1.577-.773-1.821-.862-.244-.09-.422-.134-.599.134-.177.266-.688.862-.843 1.03-.155.177-.31.197-.577.062-.266-.134-1.127-.414-2.148-1.319-.793-.702-1.33-1.57-1.486-1.835-.155-.266-.017-.409.117-.542.12-.12.266-.31.4-.464.133-.155.177-.266.266-.443.09-.177.044-.332-.022-.464-.067-.134-.599-1.429-.821-1.954-.216-.516-.453-.446-.62-.454-.16-.007-.344-.008-.528-.008-.184 0-.485.068-.739.344-.253.277-.967.937-.967 2.285 0 1.348.991 2.648 1.13 2.827.138.177 1.95 2.949 4.722 4.127.659.28 1.173.447 1.574.573.662.208 1.265.179 1.741.11.53-.078 1.577-.638 1.8-.1.222-.538.222-.999.001-1.077z" fillRule="evenodd" />
                                                </svg>
                                                {t('whatsapp')}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )
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
                    {canCopy && (
                        <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={handleCopy}
                            aria-label={copyLabel ?? t('copy')}
                            title={copyLabel ?? t('copy')}
                        >
                            <Copy size={12} />
                        </button>
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
                        !isEditing &&
                        (sending ? (
                            <Clock size={12} className="opacity-60" />
                        ) : read ? (
                            // Coloured double-check once the recipient has read it.
                            <CheckCheck size={14} className="text-black" />
                        ) : (
                            <Check size={14} className="opacity-60" />
                        ))}
                </div>
            </div>
        </div>
    );
};
