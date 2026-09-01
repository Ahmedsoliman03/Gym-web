'use client';

import { useEffect } from 'react';

export type ConfirmTone = 'danger' | 'primary';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  body?: string;
  cancelLabel: string;
  confirmLabel: string;
  /** Label shown on the confirm button while `isSubmitting` is true. */
  submittingLabel?: string;
  /** Visual treatment for the confirm button. Defaults to `danger`. */
  tone?: ConfirmTone;
  isSubmitting?: boolean;
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
  footer:
    'flex items-center  gap-3 px-5 py-4 border-t border-white/5',
  cancelBtn:
    'px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold text-sm transition-all disabled:opacity-50',
  dangerBtn:
    'px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-500/90 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20 disabled:opacity-60 disabled:cursor-wait flex items-center gap-2',
  primaryBtn:
    'px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-wait flex items-center gap-2',
  spinner:
    'w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin',
};

export function ConfirmDialog({
  isOpen,
  title,
  body,
  cancelLabel,
  confirmLabel,
  submittingLabel,
  tone = 'danger',
  isSubmitting = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
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

  const confirmBtnClass = tone === 'primary' ? styles.primaryBtn : styles.dangerBtn;

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
          <h3 className={styles.title}>{title}</h3>
          {body && <p className={styles.subtitle}>{body}</p>}
        </div>
        <div className={styles.footer}>
            <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={confirmBtnClass}
          >
            {isSubmitting && <span className={styles.spinner} />}
            {isSubmitting && submittingLabel ? submittingLabel : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelBtn}
          >
            {cancelLabel}
          </button>
        
        </div>
      </div>
    </div>
  );
}
