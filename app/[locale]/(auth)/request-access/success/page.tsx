'use client';

import { useTranslations } from 'next-intl';
import { CheckmarkCircle24Regular } from '@fluentui/react-icons';
import { Link } from '@/i18n/routing';

const styles = {
  container: "flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 py-12 px-4",
  iconWrapper: "relative",
  iconBg: "absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse",
  icon: "w-20 h-20 text-primary relative z-10",
  content: "space-y-4 max-w-md",
  title: "text-3xl font-black text-white leading-tight",
  description: "text-foreground/50 text-[15px] leading-relaxed",
  actionWrapper: "pt-4 w-full max-w-[280px]",
  submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-transform flex items-center justify-center gap-2 group cursor-pointer text-base uppercase",
  secondaryLink: "block text-[13px] text-foreground/30 hover:text-primary transition-colors font-bold uppercase tracking-wider"
};

export default function RequestAccessSuccessPage() {
    const t = useTranslations();

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <div className={styles.iconBg} />
                <CheckmarkCircle24Regular className={styles.icon} />
            </div>

            <div className={styles.content}>
                <h1 className={styles.title}>{t('Auth.requestAccessSuccessTitle')}</h1>
                <p className={styles.description}>
                    {t('Auth.requestAccessSuccessDesc')}
                </p>
            </div>

            <div className={styles.actionWrapper}>
                <Link href="/activate" className={styles.submitButton}>
                    {t('Auth.activateProfile')}
                </Link>
                <div className="mt-6">
                    <Link href="/" className={styles.secondaryLink}>
                        {t('Auth.backToHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
