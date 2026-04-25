'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  wrapper: "mb-4",
  button:  "w-full flex items-center justify-center gap-3 py-5 rounded-2xl border-2 border-dashed border-white/10 text-foreground/40 font-black text-sm uppercase tracking-widest hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:scale-[0.99] transition-all duration-300 group",
  icon:    "w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:rotate-90 transition-transform duration-300",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export function AddJobButton() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Jobs');

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        onClick={() => router.push(`/${locale}/jobs/new`)}
      >
        <span className={styles.icon}>
          <Plus size={16} strokeWidth={3} />
        </span>
        {t('addPost')}
      </button>
    </div>
  );
}
