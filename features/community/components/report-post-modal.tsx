'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ReportPostModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
}

const PRESET_REASON_KEYS = ['spam', 'inappropriate', 'harassment', 'misleading'] as const;
const OTHER_KEY = 'other';

type ReasonKey = (typeof PRESET_REASON_KEYS)[number] | typeof OTHER_KEY;

const styles = {
  backdrop: 'fixed inset-0 z-[130] flex items-center justify-center p-4',
  overlay: 'absolute inset-0 bg-black/70 backdrop-blur-sm',
  panel:
    'relative w-full max-w-md bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden',
  header: 'flex items-start justify-between p-5 border-b border-white/5',
  title: 'text-lg font-bold text-foreground',
  subtitle: 'text-xs text-foreground/50 mt-1',
  closeBtn: 'p-2 text-foreground/40 hover:text-foreground transition-colors',
  body: 'p-5 space-y-3',
  sectionLabel: 'text-[11px] uppercase tracking-wider font-bold text-foreground/50 mb-1',
  option:
    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left',
  optionSelected:
    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-primary/15 border border-primary/40 transition-all text-left',
  optionLabel: 'text-sm font-bold text-foreground',
  checkBox: 'w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0',
  checkBoxActive:
    'w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0',
  textarea:
    'w-full min-h-[100px] resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary/50 outline-none transition-colors',
  error: 'text-xs text-red-400 mt-1',
  footer: 'flex items-center justify-end gap-3 px-5 py-4 border-t border-white/5',
  cancelBtn:
    'px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-foreground font-bold text-sm transition-all disabled:opacity-50',
  submitBtn:
    'px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-wait flex items-center gap-2',
  spinner:
    'w-4 h-4 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin',
};

function ReportForm({
  isSubmitting,
  onCancel,
  onSubmit,
}: Omit<ReportPostModalProps, 'isOpen'>) {
  const t = useTranslations('Community');
  const [selected, setSelected] = useState<ReasonKey | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onCancel();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
    };
  }, [isSubmitting, onCancel]);

  const isOther = selected === OTHER_KEY;
  const trimmedCustom = customReason.trim();
  const canSubmit =
    selected !== null && (selected !== OTHER_KEY || trimmedCustom.length > 0);
  const showNoSelection = touched && selected === null;
  const showOtherError = touched && isOther && trimmedCustom.length === 0;

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    const reason =
      selected === OTHER_KEY ? trimmedCustom : t(`reportReasons.${selected}`);
    onSubmit(reason);
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div
        className={styles.overlay}
        onClick={() => {
          if (!isSubmitting) onCancel();
        }}
      />
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{t('reportTitle')}</h3>
            <p className={styles.subtitle}>{t('reportSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.closeBtn}
            aria-label={t('cancel')}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.sectionLabel}>{t('reportSelectReason')}</p>

          {PRESET_REASON_KEYS.map((key) => {
            const isSelected = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={isSelected ? styles.optionSelected : styles.option}
                aria-pressed={isSelected}
              >
                <span className={styles.optionLabel}>
                  {t(`reportReasons.${key}`)}
                </span>
                <span
                  className={isSelected ? styles.checkBoxActive : styles.checkBox}
                >
                  {isSelected && <Check size={12} />}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelected(OTHER_KEY)}
            className={isOther ? styles.optionSelected : styles.option}
            aria-pressed={isOther}
          >
            <span className={styles.optionLabel}>
              {t(`reportReasons.${OTHER_KEY}`)}
            </span>
            <span className={isOther ? styles.checkBoxActive : styles.checkBox}>
              {isOther && <Check size={12} />}
            </span>
          </button>

          {isOther && (
            <div>
              <textarea
                autoFocus
                value={customReason}
                onChange={(e) => setCustomReason(e.currentTarget.value)}
                placeholder={t('reportReasonPlaceholder')}
                className={styles.textarea}
              />
              {showOtherError && (
                <p className={styles.error}>{t('reportReasonRequired')}</p>
              )}
            </div>
          )}

          {showNoSelection && (
            <p className={styles.error}>{t('reportSelectReason')}</p>
          )}
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={styles.submitBtn}
          >
            {isSubmitting && <span className={styles.spinner} />}
            {isSubmitting ? t('reporting') : t('report')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReportPostModal({
  isOpen,
  isSubmitting,
  onCancel,
  onSubmit,
}: ReportPostModalProps) {
  if (!isOpen) return null;
  return (
    <ReportForm
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}
