'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import {
  isPromoValid,
  promoDiscountValue,
  useSubscribeMutation,
  useValidatePromoMutation,
} from '../services/plans.service';
import type { SubscribeModalProps } from '../types';

type PromoStatus = 'idle' | 'valid' | 'invalid';

const styles = {
  summary:
    'flex items-center justify-between gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/15 mb-6',
  planName: 'text-sm font-black uppercase tracking-widest text-primary',
  price: 'text-2xl font-black tracking-tight',
  currency: 'text-sm font-black text-foreground/60',
  label: 'block text-xs font-black uppercase tracking-wider text-foreground/60 mb-2',
  promoRow: 'flex gap-2',
  input:
    'flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  validateBtn:
    'shrink-0 px-4 rounded-xl bg-white/10 border border-white/10 text-foreground font-black uppercase text-xs tracking-wider hover:bg-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
  hint: 'text-[11px] text-foreground/40 mt-2',
  validMsg: 'flex items-center gap-1.5 text-[12px] font-bold text-primary mt-2',
  invalidMsg: 'flex items-center gap-1.5 text-[12px] font-bold text-red-400 mt-2',
  referralRow:
    'flex items-start gap-3 mt-5 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer',
  checkbox: 'mt-0.5 w-4 h-4 accent-primary shrink-0 cursor-pointer',
  referralTitle: 'text-sm font-bold text-foreground',
  referralHint: 'text-xs text-foreground/50 mt-0.5 leading-snug',
  disabledHint: 'text-[11px] text-foreground/40 mt-2',
  actions: 'flex gap-3 mt-7',
  cancel:
    'flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground/80 font-black uppercase text-xs tracking-wider hover:bg-white/10 transition-all',
  submit:
    'flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
};

export function SubscribeModal({ plan, onClose, currency }: SubscribeModalProps) {
  const t = useTranslations('Plans');
  const { mutateAsync, isPending } = useSubscribeMutation();
  const validate = useValidatePromoMutation();

  const [promoCode, setPromoCode] = useState('');
  const [applyReferral, setApplyReferral] = useState(false);
  const [promoStatus, setPromoStatus] = useState<PromoStatus>('idle');
  const [discountText, setDiscountText] = useState<string | null>(null);

  // Reset the form whenever a new plan opens the modal.
  useEffect(() => {
    if (plan) {
      setPromoCode('');
      setApplyReferral(false);
      setPromoStatus('idle');
      setDiscountText(null);
    }
  }, [plan]);

  const hasPromo = promoCode.trim().length > 0;
  // The promo only counts toward the subscription once it's been validated.
  const promoApplied = promoStatus === 'valid' && hasPromo;

  const handlePromoChange = (value: string) => {
    setPromoCode(value);
    // Any edit invalidates a previous validation result.
    setPromoStatus('idle');
    setDiscountText(null);
  };

  const handleValidate = async () => {
    if (!plan || !hasPromo) return;
    try {
      const res = await validate.mutateAsync({
        planId: plan.id,
        promoCode,
      });
      if (isPromoValid(res)) {
        setPromoStatus('valid');
        setDiscountText(promoDiscountValue(res));
      } else {
        setPromoStatus('invalid');
        setDiscountText(null);
      }
    } catch {
      setPromoStatus('invalid');
      setDiscountText(null);
    }
  };

  const handleSubmit = async () => {
    if (!plan) return;
    try {
      await mutateAsync({
        planId: plan.id,
        promoCode: promoApplied ? promoCode : undefined,
        applyReferralDiscount: applyReferral && !promoApplied,
      });
      toast.success(t('subscribeSuccess'));
      onClose();
    } catch {
      toast.error(t('subscribeError'));
    }
  };

  const priceAfter = plan
    ? Number(plan.sale_price) > 0 && Number(plan.sale_price) < Number(plan.price)
      ? Number(plan.sale_price)
      : Number(plan.price)
    : 0;

  const busy = isPending || validate.isPending;

  return (
    <Modal isOpen={Boolean(plan)} onClose={onClose} title={t('subscribeTitle')}>
      {plan && (
        <div>
          <div className={styles.summary}>
            <span className={styles.planName}>{plan.name}</span>
            <span>
              <span className={styles.price}>{priceAfter}</span>{' '}
              <span className={styles.currency}>
                {currency} {t('perMonth')}
              </span>
            </span>
          </div>

          <label htmlFor="promo-code" className={styles.label}>
            {t('promoCodeLabel')}
          </label>
          <div className={styles.promoRow}>
            <input
              id="promo-code"
              type="text"
              value={promoCode}
              onChange={(e) => handlePromoChange(e.target.value)}
              placeholder={t('promoCodePlaceholder')}
              className={styles.input}
              disabled={busy || applyReferral}
              autoComplete="off"
            />
            <button
              type="button"
              className={styles.validateBtn}
              onClick={handleValidate}
              disabled={
                !hasPromo || applyReferral || promoStatus === 'valid' || busy
              }
            >
              {validate.isPending ? t('validating') : t('validate')}
            </button>
          </div>

          {/* Status line under the field. */}
          {promoStatus === 'valid' ? (
            <p className={styles.validMsg}>
              <CheckCircle2 size={14} />
              {discountText
                ? t('promoValidWithDiscount', { discount: discountText })
                : t('promoValid')}
            </p>
          ) : promoStatus === 'invalid' ? (
            <p className={styles.invalidMsg}>
              <XCircle size={14} />
              {t('promoInvalid')}
            </p>
          ) : hasPromo ? (
            <p className={styles.hint}>{t('promoValidateHint')}</p>
          ) : null}

          <label className={styles.referralRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={applyReferral}
              onChange={(e) => setApplyReferral(e.target.checked)}
              disabled={busy || promoApplied}
            />
            <span>
              <span className={styles.referralTitle}>
                {t('applyReferralLabel')}
              </span>
              <span className={styles.referralHint}>
                {t('applyReferralHint')}
              </span>
            </span>
          </label>

          {promoApplied && (
            <p className={styles.disabledHint}>{t('mutuallyExclusiveHint')}</p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onClose}
              disabled={busy}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              className={styles.submit}
              onClick={handleSubmit}
              disabled={busy}
            >
              {isPending ? t('subscribing') : t('confirmSubscribe')}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
