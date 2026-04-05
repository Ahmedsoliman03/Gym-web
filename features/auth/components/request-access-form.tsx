'use client';

import { useTranslations } from 'next-intl';
import { CheckmarkCircle24Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import GymRequestForm from './gym-request-form';
import CoachRequestForm from './coach-request-form';

const styles = {
  submitted: {
    container: "text-center space-y-4 animate-premium-in",
    iconWrapper: "flex justify-center text-green-500",
    icon: "w-16 h-16",
    title: "text-2xl font-bold",
    description: "text-foreground/60",
    link: "block text-primary font-medium hover:underline"
  },
  container: "space-y-8 animate-premium-in",
  header: "space-y-4 text-center",
  title: "text-2xl font-black tracking-tight text-white",
  subtitle: "text-foreground/50 text-[13px] leading-relaxed max-w-sm mx-auto",
  formWrapper: "space-y-6",
  typeWrapper: "space-y-3",
  typeLabel: "text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 px-1",
  typeSelector: "flex gap-2 p-1.5 bg-[#0D121F] rounded-xl",
  typeButton: (isActive: boolean) => `
    flex-1 py-3 rounded-lg cursor-pointer transition-all font-bold text-sm 
    ${isActive ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground/60'}
  `,
  footerNote: "text-center pt-2",
  footerNoteText: "text-[11px] text-foreground/30 font-medium",
  footerLinkWrapper: "text-center pt-4 text-sm font-medium border-t border-foreground/5 mt-4",
  footerLink: "text-foreground/40 hover:text-primary transition-colors cursor-pointer"
};

export default function RequestAccessForm() {
    const t = useTranslations();
    const [submitted, setSubmitted] = useState(false);
    const [type, setType] = useState<'gym' | 'coach'>('gym');

    if (submitted) {
        return (
            <div className={styles.submitted.container}>
                <div className={styles.submitted.iconWrapper}>
                    <CheckmarkCircle24Regular className={styles.submitted.icon} />
                </div>
                <h2 className={styles.submitted.title}>{t('Auth.requestSent')}</h2>
                <p className={styles.submitted.description}>{t('Auth.requestPending')}</p>
                <Link href="/login" className={styles.submitted.link}>{t('Auth.returnToLogin')}</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('Auth.requestAccess')}</h1>
                <p className={styles.subtitle}>
                    {t('Auth.requestSubtitle')}
                </p>
            </div>

            <div className={styles.formWrapper}>
                <div className={styles.typeWrapper}>
                    <label className={styles.typeLabel}>
                        {t('Auth.accountType')}
                    </label>
                    <div className={styles.typeSelector}>
                        <button
                            type="button"
                            onClick={() => setType('gym')}
                            className={styles.typeButton(type === 'gym')}
                        >
                            {t('Auth.gym')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('coach')}
                            className={styles.typeButton(type === 'coach')}
                        >
                            {t('Auth.coach')}
                        </button>
                    </div>
                </div>

                {type === 'gym' ? (
                    <GymRequestForm onSuccess={() => setSubmitted(true)} />
                ) : (
                    <CoachRequestForm onSuccess={() => setSubmitted(true)} />
                )}
            </div>

            <div className={styles.footerNote}>
                <p className={styles.footerNoteText}>
                    {t('Auth.reviewTime')}
                </p>
            </div>

            <div className={styles.footerLinkWrapper}>
                <Link href="/login" className={styles.footerLink}>{t('Auth.alreadyHaveAccount')}</Link>
            </div>
        </div>
    );
}
