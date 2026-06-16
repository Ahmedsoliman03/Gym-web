'use client';

import { Check, CheckCheck, Clock, Loader2, Pencil, Trash2, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Check, CheckCheck, Clock, Copy, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { formatClockTime } from '@/utils/format';
import type { ChatMessage } from '../types';

const styles = {
    row: (mine: boolean) =>
        `flex ${mine ? 'justify-end' : 'justify-start'}`,
    // The wrapper owns the width cap + relative positioning so the action menu
    // can anchor to the bubble without changing the row layout.
    wrap: 'relative max-w-[80%]',
    bubble: (mine: boolean) =>
        `rounded-2xl px-3.5 py-2 text-sm break-words cursor-pointer select-none ${
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
    // Direction is chosen at open time: upward for messages near the bottom of
    // the thread, downward for ones near the top (so the first message's menu
    // isn't hidden under the sticky header). Aligns to the bubble's own side.
    menu: (mine: boolean, openUp: boolean) =>
        `absolute z-30 min-w-[150px] bg-[#161B22] border border-white/10 rounded-lg shadow-2xl overflow-hidden py-1 ${
            openUp ? 'bottom-full mb-1' : 'top-full mt-1'
        } ${mine ? 'end-0' : 'start-0'}`,
    menuItem:
        'flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-foreground/70 hover:text-white hover:bg-white/5 transition-colors text-left',
    menuItemDanger:
        'flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-500 hover:text-red-400 hover:bg-white/5 transition-colors text-left',
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
                // Stop the click from bubbling to the bubble's menu toggle so a
                // link tap opens the link instead of the action menu.
                onClick={(e) => e.stopPropagation()}
                className="underline underline-offset-2 break-all hover:opacity-80"
            >
                {part}
            </a>
        ) : (
            <span key={i}>{part}</span>
        ),
    );

const LONG_PRESS_MS = 450;

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
    const t = useTranslations('Chat');
    // Optimistic messages keep a `tmp:` id until the server echo arrives.
    const sending = message.id.startsWith('tmp:');

    const [menuOpen, setMenuOpen] = useState(false);
    // Whether the menu opens above (true) or below (false) the bubble.
    const [openUp, setOpenUp] = useState(true);
    const wrapRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Set when a long-press opened the menu, so the synthetic click that fires
    // on touch-end after the press is swallowed instead of toggling it shut.
    const longPressFired = useRef(false);

    // Close the menu on any outside interaction, Escape, or scroll.
    useEffect(() => {
        if (!menuOpen) return;
        const onOutside = (e: Event) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        // Dismiss when the thread scrolls — the menu is anchored to the bubble
        // and would otherwise drift away from the finger/cursor.
        const onScroll = () => setMenuOpen(false);
        document.addEventListener('mousedown', onOutside);
        document.addEventListener('touchstart', onOutside);
        document.addEventListener('keydown', onKey);
        // Capture so the listener fires for the scrolling thread body too.
        window.addEventListener('scroll', onScroll, true);
        return () => {
            document.removeEventListener('mousedown', onOutside);
            document.removeEventListener('touchstart', onOutside);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [menuOpen]);

    const cancelLongPress = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    // Find the nearest scrollable ancestor (the thread body) so we can decide
    // the menu direction against the *visible* thread area, not the whole
    // window — keeps the menu clear of the sticky header above the scroll box.
    const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
        let node = el?.parentElement ?? null;
        while (node) {
            const oy = getComputedStyle(node).overflowY;
            if (oy === 'auto' || oy === 'scroll') return node;
            node = node.parentElement;
        }
        return null;
    };

    // Open upward when there's more room above the bubble than below, downward
    // otherwise. Top messages → downward (clears the header); bottom messages
    // → upward (clears the composer).
    const openMenu = () => {
        const el = wrapRef.current;
        if (el) {
            const rect = el.getBoundingClientRect();
            const scroller = getScrollParent(el);
            const top = scroller ? scroller.getBoundingClientRect().top : 0;
            const bottom = scroller
                ? scroller.getBoundingClientRect().bottom
                : window.innerHeight;
            setOpenUp(rect.top - top > bottom - rect.bottom);
        }
        setMenuOpen(true);
    };

    const handleClick = (e: React.MouseEvent) => {
        // Never hijack a tap on an inner link.
        if ((e.target as HTMLElement).closest('a')) return;
        // Swallow the click that trails a long-press (which already opened it).
        if (longPressFired.current) {
            longPressFired.current = false;
            return;
        }
        if (menuOpen) setMenuOpen(false);
        else openMenu();
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        // Replace the native right-click / mobile callout with our own menu.
        e.preventDefault();
        openMenu();
    };

    const handleTouchStart = () => {
        longPressFired.current = false;
        cancelLongPress();
        longPressTimer.current = setTimeout(() => {
            longPressFired.current = true;
            openMenu();
        }, LONG_PRESS_MS);
    };

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
        try {
            await navigator.clipboard.writeText(message.body);
            toast.success(t('messageCopied'));
        } catch {
            // Clipboard can reject (permissions / insecure context) — fail quietly.
        }
    };

    // UI-only for now: surfaces the action in the menu without wiring deletion.
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(false);
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
            <div className={styles.wrap} ref={wrapRef}>
                <div
                    className={styles.bubble(mine)}
                    onClick={handleClick}
                    onContextMenu={handleContextMenu}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={cancelLongPress}
                    onTouchMove={cancelLongPress}
                    onTouchCancel={cancelLongPress}
                >
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
                            {formatClockTime(message.createdAt, locale)}
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

                {menuOpen && (
                    <div className={styles.menu(mine, openUp)} role="menu">
                        {message.body && (
                            <button
                                type="button"
                                role="menuitem"
                                onClick={handleCopy}
                                className={styles.menuItem}
                            >
                                <Copy size={14} />
                                {t('copy')}
                            </button>
                        )}
                        <button
                            type="button"
                            role="menuitem"
                            onClick={handleDelete}
                            className={styles.menuItemDanger}
                        >
                            <Trash2 size={14} />
                            {t('deleteMessage')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
