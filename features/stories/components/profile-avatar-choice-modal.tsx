'use client';

import { useEffect } from 'react';
import { Image as ImageIcon, Eye, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ProfileAvatarChoiceModalProps } from '../types';

const styles = {
    backdrop: "fixed inset-0 z-[100] flex items-center justify-center p-4",
    overlay: "absolute inset-0 bg-black/70 backdrop-blur-sm",
    panel: "relative w-full max-w-sm bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden",
    header: "flex items-center justify-between p-5 border-b border-white/5",
    title: "text-lg font-bold text-foreground",
    closeBtn: "p-2 text-foreground/40 hover:text-foreground transition-colors",
    body: "p-5 space-y-3",
    option: "w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all text-left",
    icon: "w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0",
    label: "text-sm font-bold text-foreground",
};

export function ProfileAvatarChoiceModal({
    isOpen,
    onClose,
    onShowProfile,
    onShowStory,
    isOwner = true,
}: ProfileAvatarChoiceModalProps) {
    const t = useTranslations('Stories');

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.panel}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{t('choiceTitle')}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.closeBtn}
                        aria-label={t('cancel')}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.body}>
                    <button type="button" onClick={onShowProfile} className={styles.option}>
                        <span className={styles.icon}>
                            <ImageIcon size={18} />
                        </span>
                        <span className={styles.label}>{t('showProfileImage')}</span>
                    </button>
                    <button type="button" onClick={onShowStory} className={styles.option}>
                        <span className={styles.icon}>
                            <Eye size={18} />
                        </span>
                        <span className={styles.label}>
                            {isOwner ? t('viewMyStory') : t('viewTheirStory')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
