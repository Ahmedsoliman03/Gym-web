'use client';

import { useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useStoryViewers } from '../services/stories.service';

interface StoryViewersSheetProps {
    isOpen: boolean;
    storyId: string | null;
    onClose: () => void;
}

const styles = {
    backdrop: "fixed inset-0 z-[120] flex items-end justify-center",
    overlay: "absolute inset-0 bg-black/60",
    sheet: "relative w-full max-w-md bg-[#0D121F] border-t border-white/10 rounded-t-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300",
    grabber: "w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3",
    header: "flex items-center justify-between px-5 py-4 border-b border-white/5",
    headerLeft: "flex items-center gap-3",
    eyeBox: "w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center",
    title: "text-base font-bold text-foreground",
    count: "text-xs text-foreground/60",
    closeBtn: "p-2 text-foreground/40 hover:text-foreground transition-colors",
    body: "max-h-[60vh] overflow-y-auto",
    state: "px-6 py-10 text-center text-sm text-foreground/60",
    row: "flex items-center gap-3 px-5 py-3 border-b border-white/5 last:border-b-0",
    avatar: "w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-primary text-sm font-bold shrink-0",
    avatarImg: "w-full h-full object-cover",
    info: "flex-1 min-w-0",
    name: "text-sm font-bold text-foreground truncate",
    sub: "text-[11px] text-foreground/50 uppercase",
};

function formatViewedAt(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
}

export function StoryViewersSheet({ isOpen, storyId, onClose }: StoryViewersSheetProps) {
    const t = useTranslations('Stories');
    const { data, isLoading, isError } = useStoryViewers(storyId, isOpen);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', onKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const viewers = data?.viewers ?? [];
    const count = data?.viewersCount ?? viewers.length;

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.sheet}>
                <div className={styles.grabber} />
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <span className={styles.eyeBox}>
                            <Eye size={18} />
                        </span>
                        <div>
                            <p className={styles.title}>{t('viewers')}</p>
                            <p className={styles.count}>{count}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeBtn}
                        aria-label={t('closeViewer')}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    {isLoading ? (
                        <p className={styles.state}>{t('loadingViewers')}</p>
                    ) : isError ? (
                        <p className={styles.state}>{t('viewersError')}</p>
                    ) : viewers.length === 0 ? (
                        <p className={styles.state}>{t('noViewers')}</p>
                    ) : (
                        viewers.map((v, i) => {
                            const initial = (v.fullName?.trim()?.[0] ?? '?').toUpperCase();
                            return (
                                <div key={v.id ?? `${v.fullName}-${i}`} className={styles.row}>
                                    <div className={styles.avatar}>
                                        {v.profileImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={v.profileImage}
                                                alt={v.fullName ?? ''}
                                                className={styles.avatarImg}
                                            />
                                        ) : (
                                            <span>{initial}</span>
                                        )}
                                    </div>
                                    <div className={styles.info}>
                                        <p className={styles.name}>
                                            {v.fullName ?? '—'}
                                        </p>
                                        <p className={styles.sub}>
                                            {v.userType ?? ''}
                                            {v.viewedAt ? ` · ${formatViewedAt(v.viewedAt)}` : ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
