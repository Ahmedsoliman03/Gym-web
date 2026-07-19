'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StoryPreviewModalProps {
    isOpen: boolean;
    previewUrl: string | null;
    isPublishing: boolean;
    /** Direct-to-R2 upload progress (0-100). While < 100 the button shows the percentage. */
    uploadProgress?: number | null;
    onCancel: () => void;
    onPublish: () => void;
}

const styles = {
    backdrop: "fixed inset-0 z-[100] flex items-center justify-center p-4",
    overlay: "absolute inset-0 bg-black/70 backdrop-blur-sm",
    panel: "relative w-full max-w-lg bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden",
    header: "flex items-center justify-between p-5 border-b border-white/5",
    title: "text-lg font-bold text-foreground",
    subtitle: "text-xs text-foreground/50 mt-1",
    closeBtn: "p-2 text-foreground/40 hover:text-foreground transition-colors",
    body: "p-5",
    imageFrame: "w-full max-h-[60vh] flex items-center justify-center bg-black/40 rounded-xl overflow-hidden",
    image: "max-h-[60vh] w-auto h-auto object-contain",
    footer: "flex items-center justify-end gap-3 px-5 py-4 border-t border-white/5",
    cancelBtn: "px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold text-sm transition-all disabled:opacity-50",
    publishBtn: "px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-wait flex items-center gap-2",
    spinner: "w-4 h-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin",
};

export function StoryPreviewModal({
    isOpen,
    previewUrl,
    isPublishing,
    uploadProgress,
    onCancel,
    onPublish,
}: StoryPreviewModalProps) {
    const t = useTranslations('Stories');

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isPublishing) onCancel();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isPublishing, onCancel]);

    if (!isOpen || !previewUrl) return null;

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div
                className={styles.overlay}
                onClick={() => {
                    if (!isPublishing) onCancel();
                }}
            />
            <div className={styles.panel}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.title}>{t('previewTitle')}</h3>
                        <p className={styles.subtitle}>{t('previewSubtitle')}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isPublishing}
                        className={styles.closeBtn}
                        aria-label={t('cancel')}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.imageFrame}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="" className={styles.image} />
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isPublishing}
                        className={styles.cancelBtn}
                    >
                        {t('cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={onPublish}
                        disabled={isPublishing}
                        className={styles.publishBtn}
                    >
                        {isPublishing && <span className={styles.spinner} />}
                        {isPublishing
                            ? (uploadProgress != null && uploadProgress < 100
                                ? `Uploading ${uploadProgress}%`
                                : t('publishing'))
                            : t('publish')}
                    </button>
                </div>
            </div>
        </div>
    );
}
