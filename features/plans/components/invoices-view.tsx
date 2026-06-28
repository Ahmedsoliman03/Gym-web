'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle2, ChevronRight, Clock, Receipt, XCircle } from 'lucide-react';
import { GLoaderSection } from '@/components/ui/g-loader';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { useInvoicesQuery } from '../services/plans.service';
import type { Invoice, InvoiceStatus } from '../types';
import { InvoiceDetailModal } from './invoice-detail-modal';

const styles = {
  wrap: 'pb-4',
  header: 'mb-6',
  title: 'text-lg font-black uppercase tracking-tight mb-1',
  subtitle: 'text-foreground/50 text-sm',
  list: 'flex flex-col gap-3',
  row: 'w-full flex items-center gap-4 p-4 rounded-2xl bg-surface/60 border border-white/5 text-left hover:bg-surface hover:border-primary/30 transition-all cursor-pointer',
  icon: 'w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0',
  chevron: 'text-foreground/30 shrink-0',
  main: 'min-w-0 flex-1',
  planName: 'font-black text-sm truncate',
  date: 'text-foreground/50 text-xs mt-0.5',
  right: 'flex flex-col items-end gap-1.5 shrink-0',
  amount: 'font-black text-sm whitespace-nowrap',
  currency: 'text-foreground/50 text-[11px] font-bold',
  badge: (status: InvoiceStatus) =>
    `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
      status === 'PAID'
        ? 'bg-primary/15 text-primary'
        : status === 'PENDING'
          ? 'bg-amber-500/15 text-amber-400'
          : 'bg-red-500/15 text-red-400'
    }`,
  state: 'py-16 text-center text-foreground/50 text-sm font-bold',
  retry:
    'mt-4 mx-auto block w-fit px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all',
};

const statusIcon = (status: InvoiceStatus) =>
  status === 'PAID' ? CheckCircle2 : status === 'PENDING' ? Clock : XCircle;

function InvoiceRow({
  invoice,
  onSelect,
}: {
  invoice: Invoice;
  onSelect: () => void;
}) {
  const t = useTranslations('Plans');
  const locale = useLocale();
  const StatusIcon = statusIcon(invoice.status);

  const date = new Date(invoice.created_at).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const planName = invoice.subscription_details?.plan?.name ?? t('invoicePlanFallback');
  const statusKey = `invoiceStatus.${invoice.status}`;
  const statusLabel = t.has(statusKey) ? t(statusKey) : invoice.status;

  return (
    <button type="button" className={styles.row} onClick={onSelect}>
      <span className={styles.icon}>
        <Receipt size={20} />
      </span>

      <div className={styles.main}>
        <p className={styles.planName}>{planName}</p>
        <p className={styles.date}>{date}</p>
      </div>

      <div className={styles.right}>
        <span className={styles.amount}>
          {invoice.amount_paid}{' '}
          <span className={styles.currency}>{t('currency')}</span>
        </span>
        <span className={styles.badge(invoice.status)}>
          <StatusIcon size={11} />
          {statusLabel}
        </span>
      </div>

      <ChevronRight size={18} className={styles.chevron} />
    </button>
  );
}

export function InvoicesView() {
  const t = useTranslations('Plans');
  const { profile } = useProfileUser();
  const enabled = Boolean(profile);
  const [selected, setSelected] = useState<Invoice | null>(null);

  const {
    data: invoices = [],
    isLoading,
    isError,
    refetch,
  } = useInvoicesQuery(enabled);

  if (isLoading) {
    return <GLoaderSection minHeight={240} label={t('loading')} />;
  }

  if (isError) {
    return (
      <div className={styles.state}>
        <p>{t('invoicesError')}</p>
        <button type="button" className={styles.retry} onClick={() => refetch()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  if (invoices.length === 0) {
    return <p className={styles.state}>{t('invoicesEmpty')}</p>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('invoicesTitle')}</h2>
        <p className={styles.subtitle}>{t('invoicesSubtitle')}</p>
      </div>

      <div className={styles.list}>
        {invoices.map((invoice) => (
          <InvoiceRow
            key={invoice.id}
            invoice={invoice}
            onSelect={() => setSelected(invoice)}
          />
        ))}
      </div>

      <InvoiceDetailModal
        invoice={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
