'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

const styles = {
    chip:
        'inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-3 py-1.5',
    label: 'text-[10px] font-black uppercase tracking-wider text-primary/70',
    code: 'text-sm font-bold text-primary tracking-wider tabular-nums',
    copyBtn:
        'p-1 rounded-full text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer disabled:cursor-default',
};

export function PromocodeChip({ code }: { code: string }) {
    const t = useTranslations('Profile');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const text = code.trim();
        if (!text) return;
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else if (typeof document !== 'undefined') {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            setCopied(true);
            toast.success(t('promocodeCopied'));
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error(t('promocodeCopyFailed'));
        }
    };

    return (
        <div className={styles.chip}>
            <span className={styles.label}>{t('promocode')}</span>
            <span className={styles.code}>{code}</span>
            <button
                type="button"
                onClick={handleCopy}
                className={styles.copyBtn}
                aria-label={t('copyPromocode')}
                title={t('copyPromocode')}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
        </div>
    );
}
