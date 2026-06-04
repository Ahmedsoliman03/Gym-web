'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ProfileImageLightboxProps } from '../types';

const styles = {
    backdrop: "fixed inset-0 z-[100] flex items-center justify-center p-4",
    overlay: "absolute inset-0 bg-black/90",
    closeBtn: "absolute top-5 right-5 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-foreground transition-colors",
    image: "relative max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl",
};

export function ProfileImageLightbox({ isOpen, src, alt, onClose }: ProfileImageLightboxProps) {
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
            <button
                type="button"
                onClick={onClose}
                className={styles.closeBtn}
                aria-label={t('closeViewer')}
            >
                <X size={22} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className={styles.image} />
        </div>
    );
}
