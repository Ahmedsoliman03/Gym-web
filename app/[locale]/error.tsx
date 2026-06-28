'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const styles = {
    wrap: 'min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-24',
    card: 'w-full max-w-md text-center',
    iconWrap:
        'mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400',
    title: 'text-2xl font-black tracking-tight',
    message: 'mt-2 text-sm font-medium text-foreground/55 leading-relaxed',
    digest: 'mt-3 text-[10px] font-mono uppercase tracking-wider text-foreground/30',
    actions: 'mt-8 flex flex-col sm:flex-row items-center justify-center gap-3',
    retry:
        'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider hover:brightness-110 active:scale-[0.98] transition-all',
    home:
        'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-black uppercase text-xs tracking-wider transition-all',
};

export default function LocaleError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations('Errors');

    useEffect(() => {
        console.error('Route error boundary caught:', error);
    }, [error]);

    return (
        <div className={styles.wrap}>
            <div className={styles.card}>
                <div className={styles.iconWrap}>
                    <AlertTriangle size={28} />
                </div>
                <h1 className={styles.title}>{t('title')}</h1>
                <p className={styles.message}>{t('description')}</p>
                {error.digest && (
                    <p className={styles.digest}>
                        {t('reference')}: {error.digest}
                    </p>
                )}

                <div className={styles.actions}>
                    <button type="button" onClick={() => reset()} className={styles.retry}>
                        <RotateCcw size={15} strokeWidth={2.5} />
                        {t('retry')}
                    </button>
                    <Link href="/" className={styles.home}>
                        <Home size={15} strokeWidth={2.5} />
                        {t('goHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
