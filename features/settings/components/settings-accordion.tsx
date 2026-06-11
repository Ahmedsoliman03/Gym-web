'use client';

import { ChevronDown } from 'lucide-react';

const styles = {
    accordion: 'bg-surface border border-white/5 rounded-2xl overflow-hidden',
    header:
        'flex items-center justify-between w-full px-5 sm:px-6 py-4 sm:py-5 text-left transition-all hover:bg-white/[0.02]',
    headerLeft: 'flex items-center gap-3 sm:gap-4 min-w-0',
    headerIcon:
        'w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0',
    headerTitle:
        'font-black text-sm sm:text-base text-foreground uppercase tracking-wider truncate',
    headerSubtitle:
        'text-xs text-foreground/40 truncate hidden sm:block',
    chevron: 'shrink-0 text-foreground/40 transition-transform duration-300',
    chevronOpen: 'rotate-180 text-primary',
    bodyWrap: 'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
    bodyWrapOpen: 'grid-rows-[1fr] opacity-100',
    bodyWrapClosed: 'grid-rows-[0fr] opacity-0',
    bodyInner: 'overflow-hidden',
    body: 'px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-white/5',
};

interface SettingsAccordionProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export function SettingsAccordion({
    icon,
    title,
    subtitle,
    open,
    onToggle,
    children,
}: SettingsAccordionProps) {
    return (
        <div className={styles.accordion}>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className={styles.header}
            >
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcon}>{icon}</div>
                    <div className="min-w-0">
                        <div className={styles.headerTitle}>{title}</div>
                        {subtitle && <div className={styles.headerSubtitle}>{subtitle}</div>}
                    </div>
                </div>
                <ChevronDown
                    size={20}
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
                />
            </button>
            <div
                className={`${styles.bodyWrap} ${
                    open ? styles.bodyWrapOpen : styles.bodyWrapClosed
                }`}
            >
                <div className={styles.bodyInner}>
                    <div className={styles.body}>{children}</div>
                </div>
            </div>
        </div>
    );
}
