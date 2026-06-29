'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
    /** Controlled value in `YYYY-MM-DD` format (empty string = no selection). */
    value: string;
    onChange: (value: string) => void;
    isRtl?: boolean;
    placeholder?: string;
    /** Latest selectable day in `YYYY-MM-DD` (inclusive). */
    max?: string;
    /** Earliest selectable day in `YYYY-MM-DD` (inclusive). */
    min?: string;
    className?: string;
    disabled?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Parse a `YYYY-MM-DD` string as a *local* date (avoids UTC off-by-one). */
function parseISO(value: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function CustomDatePicker({
    value,
    onChange,
    isRtl = false,
    placeholder,
    max,
    min,
    className = '',
    disabled,
}: CustomDatePickerProps) {
    const locale = isRtl ? 'ar-EG' : 'en-US';
    const selected = parseISO(value);

    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState<Date>(() => selected ?? new Date());
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; openUp: boolean }>({
        top: 0,
        left: 0,
        width: 0,
        openUp: false,
    });

    const [activeDate, setActiveDate] = useState<Date | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const dayRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const maxDate = parseISO(max ?? '');
    const minDate = parseISO(min ?? '');
    const today = new Date();

    const reposition = useCallback(() => {
        const el = triggerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const POPUP_H = 360;
        const spaceBelow = window.innerHeight - r.bottom;
        const openUp = spaceBelow < POPUP_H && r.top > spaceBelow;
        setCoords({
            top: openUp ? r.top - 8 : r.bottom + 8,
            left: r.left,
            width: r.width,
            openUp,
        });
    }, []);

    // Keep the popup glued to the trigger while open.
    useLayoutEffect(() => {
        if (!isOpen) return;
        reposition();
    }, [isOpen, reposition]);

    useEffect(() => {
        if (!isOpen) return;

        const onDocMouseDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target) || popupRef.current?.contains(target)) return;
            setIsOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', reposition);
        window.addEventListener('scroll', reposition, true);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', reposition);
            window.removeEventListener('scroll', reposition, true);
        };
    }, [isOpen, reposition]);

    useEffect(() => {
        if (!isOpen || !activeDate) return;
        dayRefs.current.get(toISO(activeDate))?.focus();
    }, [isOpen, activeDate]);

    const openPicker = () => {
        if (disabled) return;
        const base = selected ?? new Date();
        setViewDate(base);
        setActiveDate(base);
        setIsOpen(true);
    };

    const isDisabledDay = (d: Date) => {
        if (maxDate && d > maxDate) return true;
        if (minDate && d < minDate) return true;
        return false;
    };

    const selectDay = (d: Date) => {
        if (isDisabledDay(d)) return;
        onChange(toISO(d));
        setIsOpen(false);
        // Return focus to the trigger after selection (keyboard users).
        triggerRef.current?.focus();
    };

    // Move the keyboard-focused day by N days, hopping months as needed.
    const moveActive = (deltaDays: number) => {
        if (!activeDate) return;
        const d = new Date(activeDate.getFullYear(), activeDate.getMonth(), activeDate.getDate() + deltaDays);
        if (maxDate && d > maxDate) return;
        if (minDate && d < minDate) return;
        setActiveDate(d);
        if (d.getMonth() !== activeDate.getMonth() || d.getFullYear() !== activeDate.getFullYear()) {
            setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
        }
    };

    const moveActiveMonth = (deltaMonths: number) => {
        if (!activeDate) return;
        const d = new Date(activeDate.getFullYear(), activeDate.getMonth() + deltaMonths, activeDate.getDate());
        if (maxDate && d > maxDate) return;
        if (minDate && d < minDate) return;
        setActiveDate(d);
        setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    };

    const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!(e.target instanceof HTMLElement) || !e.target.dataset.day) return;
        switch (e.key) {
            case 'ArrowRight': e.preventDefault(); moveActive(isRtl ? -1 : 1); break;
            case 'ArrowLeft': e.preventDefault(); moveActive(isRtl ? 1 : -1); break;
            case 'ArrowDown': e.preventDefault(); moveActive(7); break;
            case 'ArrowUp': e.preventDefault(); moveActive(-7); break;
            case 'Home': e.preventDefault(); if (activeDate) moveActive(-activeDate.getDay()); break;
            case 'End': e.preventDefault(); if (activeDate) moveActive(6 - activeDate.getDay()); break;
            case 'PageUp': e.preventDefault(); moveActiveMonth(-1); break;
            case 'PageDown': e.preventDefault(); moveActiveMonth(1); break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (activeDate) selectDay(activeDate);
                break;
        }
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Aug 1 2021 is a Sunday — gives localized short weekday labels.
    const weekdays = Array.from({ length: 7 }, (_, i) =>
        new Date(2021, 7, 1 + i).toLocaleDateString(locale, { weekday: 'short' }),
    );

    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));

    const monthLabel = viewDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const displayValue = selected
        ? selected.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

    const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
    const NextIcon = isRtl ? ChevronLeft : ChevronRight;

    return (
        <>
            <button
                type="button"
                ref={triggerRef}
                onClick={() => (isOpen ? setIsOpen(false) : openPicker())}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={placeholder || (isRtl ? 'اختر التاريخ' : 'Select date')}
                className={`relative w-full bg-white/[0.02] border rounded-2xl py-3.5 ${
                    isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                } text-sm text-start outline-none transition-all flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isOpen
                        ? 'border-primary/30 ring-2 ring-primary/20'
                        : 'border-white/5 hover:border-white/10'
                } ${className}`}
            >
                <Calendar
                    size={14}
                    className={`absolute ${isRtl ? 'right-4' : 'left-4'} ${
                        isOpen ? 'text-primary' : 'text-foreground/30'
                    } pointer-events-none transition-colors`}
                />
                <span className={displayValue ? 'text-white font-medium' : 'text-foreground/40'}>
                    {displayValue || placeholder || (isRtl ? 'اختر التاريخ' : 'Select date')}
                </span>
            </button>

            {isOpen && typeof document !== 'undefined' &&
                createPortal(
                    <div
                        ref={popupRef}
                        dir={isRtl ? 'rtl' : 'ltr'}
                        role="dialog"
                        aria-label={isRtl ? 'اختر التاريخ' : 'Choose date'}
                        onKeyDown={onGridKeyDown}
                        style={{
                            position: 'fixed',
                            top: coords.openUp ? undefined : coords.top,
                            bottom: coords.openUp ? window.innerHeight - coords.top : undefined,
                            left: coords.left,
                            width: Math.max(coords.width, 288),
                        }}
                        className="z-[100] bg-[#161B2B] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl p-4 animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                        {/* Month navigation */}
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                                aria-label={isRtl ? 'الشهر السابق' : 'Previous month'}
                            >
                                <PrevIcon size={18} />
                            </button>
                            <span className="text-sm font-black text-white capitalize" aria-live="polite">{monthLabel}</span>
                            <button
                                type="button"
                                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                                aria-label={isRtl ? 'الشهر التالي' : 'Next month'}
                            >
                                <NextIcon size={18} />
                            </button>
                        </div>

                        {/* Weekday headers (decorative — day buttons carry full labels) */}
                        <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden="true">
                            {weekdays.map((w) => (
                                <div
                                    key={w}
                                    className="h-7 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-foreground/30"
                                >
                                    {w}
                                </div>
                            ))}
                        </div>

                        {/* Day grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {cells.map((d, i) => {
                                if (!d) return <div key={`empty-${i}`} className="h-9" />;
                                const isSelected = selected && sameDay(d, selected);
                                const isToday = sameDay(d, today);
                                const isActive = activeDate && sameDay(d, activeDate);
                                const disabledDay = isDisabledDay(d);
                                const iso = toISO(d);
                                return (
                                    <button
                                        key={iso}
                                        type="button"
                                        data-day={iso}
                                        ref={(el) => {
                                            if (el) dayRefs.current.set(iso, el);
                                            else dayRefs.current.delete(iso);
                                        }}
                                        disabled={disabledDay}
                                        onClick={() => selectDay(d)}
                                        tabIndex={isActive ? 0 : -1}
                                        aria-label={d.toLocaleDateString(locale, {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                        aria-current={isToday ? 'date' : undefined}
                                        aria-selected={isSelected || undefined}
                                        className={`h-9 rounded-xl text-sm font-bold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                            isSelected
                                                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                                : disabledDay
                                                  ? 'text-foreground/15 cursor-not-allowed'
                                                  : isToday
                                                    ? 'text-primary ring-1 ring-primary/40 hover:bg-primary/10'
                                                    : 'text-foreground/70 hover:bg-primary/10 hover:text-white active:scale-95'
                                        }`}
                                    >
                                        {d.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Today shortcut */}
                        <button
                            type="button"
                            onClick={() => selectDay(new Date())}
                            disabled={isDisabledDay(today)}
                            className="w-full mt-3 py-2 rounded-xl bg-white/[0.03] hover:bg-primary/10 border border-white/5 text-xs font-bold uppercase tracking-wider text-foreground/60 hover:text-primary transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isRtl ? 'اليوم' : 'Today'}
                        </button>
                    </div>,
                    document.body,
                )}
        </>
    );
}
