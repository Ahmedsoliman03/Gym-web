'use client';

import { useTranslations } from 'next-intl';
import { CheckmarkCircle24Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import GymRequestForm from './gym-request-form';
import CoachRequestForm from './coach-request-form';

const styles = {
  submitted: {
    container: "text-center space-y-4",
    iconWrapper: "flex justify-center text-green-500",
    icon: "w-16 h-16",
    title: "text-2xl font-bold",
    description: "text-foreground/60",
    link: "block text-primary font-medium hover:underline"
  },
  backButton: "inline-flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors mb-6 group",
  backIcon: "w-4 h-4 transition-transform group-hover:-translate-x-1",
  backText: "text-xs font-black uppercase tracking-wider",
  container: "space-y-8",
  header: "space-y-4 text-center",
  title: "text-2xl font-black text-white",
  subtitle: "text-foreground/40 text-sm mt-1",
  formWrapper: "space-y-6",
  typeWrapper: "space-y-3",
  typeLabel: "text-[10px] font-black uppercase text-foreground/40 px-1",
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

import { useRouter } from '@/i18n/routing';

export default function RequestAccessForm() {
    const t = useTranslations();
    const router = useRouter();
    const [type, setType] = useState<'gym' | 'coach'>('gym');

    const handleSuccess = () => {
        router.push('/request-access/success');
    };

    return (
        <div className={styles.container}>
            <Link href="/login" className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                <span className={styles.backText}>{t('Auth.backToLogin')}</span>
            </Link>

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
                    <GymRequestForm onSuccess={handleSuccess} />
                ) : (
                    <CoachRequestForm onSuccess={handleSuccess} />
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
