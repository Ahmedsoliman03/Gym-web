'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { downloadInvoicePdf } from '../utils/invoice-pdf';
import type { Invoice, InvoiceStatus } from '../types';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

const styles = {
  statusRow: 'flex items-center justify-between gap-3 mb-6',
  badge: (status: InvoiceStatus) =>
    `inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
      status === 'PAID'
        ? 'bg-primary/15 text-primary'
        : status === 'PENDING'
          ? 'bg-amber-500/15 text-amber-400'
          : 'bg-red-500/15 text-red-400'
    }`,
  invoiceId: 'text-xs font-bold text-foreground/40',
  metaGrid: 'grid grid-cols-2 gap-4 mb-6',
  metaLabel: 'block text-[10px] font-black uppercase tracking-wider text-foreground/40 mb-1',
  metaValue: 'text-sm font-bold text-foreground break-words',
  lines: 'rounded-2xl bg-white/5 border border-white/10 p-4 mb-6',
  line: 'flex items-center justify-between py-2 text-sm',
  lineLabel: 'text-foreground/60 font-bold',
  lineValue: 'font-black text-foreground',
  discount: 'text-primary',
  divider: 'my-2 border-t border-white/10',
  totalRow: 'flex items-center justify-between pt-2',
  totalLabel: 'text-sm font-black uppercase tracking-wider text-foreground/70',
  totalValue: 'text-xl font-black text-primary',
  currency: 'text-xs font-bold text-foreground/50',
  actions: 'flex gap-3',
  close:
    'flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground/80 font-black uppercase text-xs tracking-wider hover:bg-white/10 transition-all disabled:opacity-40',
  download:
    'flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
};

export function InvoiceDetailModal({
  invoice,
  onClose,
}: InvoiceDetailModalProps) {
  const t = useTranslations('Plans');
  const locale = useLocale();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await downloadInvoicePdf(invoice);
    } catch {
      toast.error(t('invoiceDownloadError'));
    } finally {
      setDownloading(false);
    }
  };

  const fmtDate = (iso: string | null | undefined) =>
    iso
      ? new Date(iso).toLocaleDateString(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const statusKey = invoice ? `invoiceStatus.${invoice.status}` : '';
  const sub = invoice?.subscription_details;
  const hasProrated = invoice && Number(invoice.prorated_discount) > 0;
  const hasReferral = invoice && Number(invoice.referral_discount) > 0;

  return (
    <Modal
      isOpen={Boolean(invoice)}
      onClose={onClose}
      title={t('invoiceDetailTitle')}
    >
      {invoice && sub && (
        <div>
          <div className={styles.statusRow}>
            <span className={styles.badge(invoice.status)}>
              {t.has(statusKey) ? t(statusKey) : invoice.status}
            </span>
            <span className={styles.invoiceId}>#{invoice.id.slice(0, 8)}</span>
          </div>

          <div className={styles.metaGrid}>
            <div>
              <span className={styles.metaLabel}>{t('invoicePlan')}</span>
              <span className={styles.metaValue}>
                {sub.plan?.name ?? t('invoicePlanFallback')}
              </span>
            </div>
            <div>
              <span className={styles.metaLabel}>{t('invoiceIssued')}</span>
              <span className={styles.metaValue}>
                {fmtDate(invoice.created_at)}
              </span>
            </div>
            <div>
              <span className={styles.metaLabel}>{t('invoicePeriod')}</span>
              <span className={styles.metaValue}>
                {fmtDate(sub.start_date)} – {fmtDate(sub.end_date)}
              </span>
            </div>
            <div>
              <span className={styles.metaLabel}>
                {t('invoicePaymentMethod')}
              </span>
              <span className={styles.metaValue}>
                {invoice.payment_method ?? '—'}
              </span>
            </div>
          </div>

          <div className={styles.lines}>
            <div className={styles.line}>
              <span className={styles.lineLabel}>
                {sub.plan?.name ?? t('invoicePlanFallback')}
              </span>
              <span className={styles.lineValue}>
                {invoice.plan_price} {t('currency')}
              </span>
            </div>

            {hasProrated && (
              <div className={styles.line}>
                <span className={styles.lineLabel}>
                  {t('invoiceProratedDiscount')}
                </span>
                <span className={`${styles.lineValue} ${styles.discount}`}>
                  − {invoice.prorated_discount} {t('currency')}
                </span>
              </div>
            )}

            {hasReferral && (
              <div className={styles.line}>
                <span className={styles.lineLabel}>
                  {t('invoiceReferralDiscount')}
                </span>
                <span className={`${styles.lineValue} ${styles.discount}`}>
                  − {invoice.referral_discount} {t('currency')}
                </span>
              </div>
            )}

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>{t('invoiceTotal')}</span>
              <span className={styles.totalValue}>
                {invoice.amount_paid}{' '}
                <span className={styles.currency}>{t('currency')}</span>
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              disabled={downloading}
            >
              {t('close')}
            </button>
            <button
              type="button"
              className={styles.download}
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              {downloading ? t('invoiceDownloading') : t('invoiceDownload')}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
