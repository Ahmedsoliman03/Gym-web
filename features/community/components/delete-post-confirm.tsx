'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface DeletePostConfirmProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const styles = {
  backdrop: 'fixed inset-0 z-[130] flex items-center justify-center p-4',
  overlay: 'absolute inset-0 bg-black/70 backdrop-blur-sm',
  panel:
    'relative w-full max-w-sm bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden',
  body: 'p-6 text-center',
  title: 'text-lg font-bold text-foreground',
  subtitle: 'text-sm text-foreground/60 mt-2',
  footer: 'flex items-center justify-end gap-3 px-5 py-4 border-t border-white/5',
  cancelBtn:
    'px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold text-sm transition-all disabled:opacity-50',
  confirmBtn:
    'px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-500/90 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20 disabled:opacity-60 disabled:cursor-wait flex items-center gap-2',
  spinner: 'w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin',
};

export function DeletePostConfirm({
  isOpen,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeletePostConfirmProps) {
  const t = useTranslations('Community');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onCancel();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div
        className={styles.overlay}
        onClick={() => {
          if (!isSubmitting) onCancel();
        }}
      />
      <div className={styles.panel}>
        <div className={styles.body}>
          <h3 className={styles.title}>{t('deleteConfirmTitle')}</h3>
          <p className={styles.subtitle}>{t('deleteConfirmBody')}</p>
        </div>
        <div className={styles.footer}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelBtn}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={styles.confirmBtn}
          >
            {isSubmitting && <span className={styles.spinner} />}
            {isSubmitting ? t('deleting') : t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
