'use client';

import { useEffect, useRef, useState } from 'react';
import { Info24Regular } from '@fluentui/react-icons';

interface WhyWeAskProps {
    /** Explanation text shown in the popover. */
    text: string;
    /** Accessible label / trigger text for the icon button. */
    label: string;
}

export function WhyWeAsk({ text, label }: WhyWeAskProps) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLSpanElement>(null);

    // Close when tapping/clicking outside (mobile, where there's no hover-out).
    useEffect(() => {
        if (!open) return;
        const onDocClick = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [open]);

    return (
        <span ref={wrapperRef} className="relative inline-flex items-center">
            <button
                type="button"
                aria-label={label}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className="inline-flex items-center text-foreground/30 hover:text-primary transition-colors"
            >
                <Info24Regular className="w-3.5 h-3.5" />
            </button>
            {open && (
                <span
                    role="tooltip"
                    className="absolute bottom-full mb-2 z-30 w-60 ltr:left-0 rtl:right-0 rounded-xl border border-white/10 bg-[#0D121F] p-3 text-[11px] font-medium leading-relaxed text-foreground/70 shadow-xl shadow-black/40"
                >
                    {text}
                </span>
            )}
        </span>
    );
}
