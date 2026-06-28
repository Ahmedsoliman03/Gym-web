'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName?: string;
  isPending?: boolean;
}

const styles = {
  body: 'flex items-start gap-4',
  icon: 'w-11 h-11 rounded-2xl bg-red-500/15 flex items-center justify-center text-red-400 shrink-0',
  message: 'text-sm text-foreground/80 leading-relaxed',
  warning: 'text-[12px] text-foreground/50 mt-2 leading-relaxed',
  actions: 'flex gap-3 mt-7',
  keep: 'flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground/80 font-black uppercase text-xs tracking-wider hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
  confirm:
    'flex-1 py-3 rounded-xl bg-red-500 text-white font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
};

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  planName,
  isPending = false,
}: CancelSubscriptionModalProps) {
  const t = useTranslations('Plans');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('cancelTitle')}>
      <div className={styles.body}>
        <div className={styles.icon}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <p className={styles.message}>
            {planName
              ? t('cancelConfirmNamed', { plan: planName })
              : t('cancelConfirm')}
          </p>
          <p className={styles.warning}>{t('cancelWarning')}</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.keep}
          onClick={onClose}
          disabled={isPending}
        >
          {t('keepSubscription')}
        </button>
        <button
          type="button"
          className={styles.confirm}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? t('canceling') : t('confirmCancel')}
        </button>
      </div>
    </Modal>
  );
}
