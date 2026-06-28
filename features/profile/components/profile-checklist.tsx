'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, ChevronRight, ClipboardList, X } from 'lucide-react';
import { useRouter } from '@/i18n/routing';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { buildProfileChecklist, type ChecklistKey } from '../checklist-sections';

const styles = {
    fab:
        'fixed bottom-6 right-6 z-[105] flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 border border-primary/40 transition-all active:scale-95 hover:brightness-110',
    badge:
        'absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center border-2 border-background',
    panel:
        'fixed bottom-24 right-6 z-[105] w-[88vw] max-w-xs rounded-2xl border border-white/10 bg-surface/95 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden',
    header: 'flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-white/5',
    title: 'text-sm font-black text-foreground leading-tight',
    subtitle: 'text-[11px] font-bold text-foreground/50 mt-0.5',
    close: 'shrink-0 p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-colors',
    list: 'p-2 max-h-[60vh] overflow-y-auto',
    row:
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-colors hover:bg-white/5 group',
    tick: (checked: boolean) =>
        `shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${checked
            ? 'bg-primary/15 border-primary/40 text-primary'
            : 'border-white/15 text-transparent'
        }`,
    rowLabel: (checked: boolean) =>
        `flex-1 text-sm font-bold ${checked ? 'text-foreground/45 line-through' : 'text-foreground/85'}`,
    chevron: 'shrink-0 w-4 h-4 text-foreground/25 group-hover:text-primary transition-colors rtl:rotate-180',
};



const AUTO_SHOWN_KEY = 'profile-checklist-autoshown';

export function ProfileChecklist() {
    const t = useTranslations('Profile');
    const router = useRouter();
    const { profile } = useProfileUser();
    const [open, setOpen] = useState(false);


    useEffect(() => {
        if (!profile) return;
        const remaining = buildProfileChecklist(profile).filter((i) => !i.checked).length;
        if (remaining === 0) return;
        try {
            if (sessionStorage.getItem(AUTO_SHOWN_KEY)) return;
            sessionStorage.setItem(AUTO_SHOWN_KEY, '1');
        } catch {
            return;
        }
        const timer = setTimeout(() => setOpen(true), 700);
        return () => clearTimeout(timer);
    }, [profile]);

    const items = buildProfileChecklist(profile);
    if (items.length === 0) return null;

    const done = items.filter((i) => i.checked).length;
    const remaining = items.length - done;

    const goToSection = (key: ChecklistKey) => {
        setOpen(false);
   
        router.push(`/profile?focus=${key}`);
    };

    return (
        <>
            {open && (
                <div role="dialog" aria-label={t('checklistTitle')} className={styles.panel}>
                    <div className={styles.header}>
                        <div>
                            <p className={styles.title}>{t('checklistTitle')}</p>
                            <p className={styles.subtitle}>
                                {remaining === 0
                                    ? t('checklistAllDone')
                                    : t('checklistProgress', { done, total: items.length })}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label={t('checklistClose')}
                            className={styles.close}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className={styles.list}>
                        {items.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => goToSection(item.key)}
                                className={styles.row}
                            >
                                <span className={styles.tick(item.checked)}>
                                    {item.checked && <Check size={13} strokeWidth={3} />}
                                </span>
                                <span className={styles.rowLabel(item.checked)}>
                                    {t(item.labelKey as Parameters<typeof t>[0])}
                                </span>
                                {!item.checked && <ChevronRight className={styles.chevron} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={t('checklistOpen')}
                aria-expanded={open}
                // Animate to attract attention only while there are still empty
                // sections and the panel isn't already open.
                className={`${styles.fab} ${remaining > 0 && !open ? 'checklist-attract' : ''}`}
            >
                <ClipboardList size={22} strokeWidth={2.25} />
                {remaining > 0 && <span className={styles.badge}>{remaining}</span>}
            </button>
        </>
    );
}
