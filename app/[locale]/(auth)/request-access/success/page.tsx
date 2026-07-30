'use client';

import { useTranslations } from 'next-intl';
import { CheckmarkCircle24Regular } from '@fluentui/react-icons';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { useAuthRequest } from '@/features/auth/hooks/useAuthRequest';
import { useResendCooldown } from '@/features/auth/hooks/useResendCooldown';
import toast from 'react-hot-toast';
import { toastApiError } from '@/utils/toast-api-error';
import type { OtpChannel } from '@/features/auth/types';

const METHOD_KEY = 'request-access-otp-method';
const RESEND_UNTIL_KEY = 'request-access-resend-until';

const getStoredRequestId = () => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('request-access-id');
};

const getStoredMethod = (): OtpChannel => {
    if (typeof window === 'undefined') return 'whatsapp';
    const storedMethod = localStorage.getItem(METHOD_KEY);
    return storedMethod === 'email' || storedMethod === 'whatsapp' ? storedMethod : 'whatsapp';
};

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
    const { updateCommunicationPreference, updateCommunicationPreferenceMutation } = useAuthRequest();
    const [requestId] = useState<string | null>(getStoredRequestId);
    const [method, setMethod] = useState<OtpChannel>(getStoredMethod);
    const { secondsLeft, isCoolingDown, start: startCooldown } = useResendCooldown({
        storageKey: RESEND_UNTIL_KEY,
    });

    const isSwitchDisabled = updateCommunicationPreferenceMutation.isPending || isCoolingDown;

    const handleSwitchMethod = async () => {
        if (!requestId || isSwitchDisabled) return;
        const nextMethod: OtpChannel = method === 'whatsapp' ? 'email' : 'whatsapp';
        try {
            await updateCommunicationPreference({
                requestId,
                communication_preference: nextMethod,
            });
            setMethod(nextMethod);
            localStorage.setItem(METHOD_KEY, nextMethod);
            // Start a fresh 15s cooldown, persisted so it survives reload/lang-switch.
            startCooldown();
            toast.success(t('Auth.activationCodeSent'));
        } catch (error) {
            toastApiError(error, t('Validation.error'));
        }
    };

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

            <div className="w-full max-w-md bg-white/2 border border-white/5 rounded-2xl p-5 space-y-4 text-center">
                {/* Always tell the user where the code is going (WhatsApp by default). */}
                <p className="text-center text-[12px] font-semibold text-primary bg-primary/5 border border-primary/15 rounded-xl py-2.5 px-4">
                    {method === 'whatsapp'
                        ? t('Auth.channelHintWhatsapp')
                        : t('Auth.channelHintEmail')}
                </p>
                {requestId && (
                    <button
                        type="button"
                        onClick={handleSwitchMethod}
                        disabled={isSwitchDisabled}
                        className="w-full py-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/45 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/10"
                    >
                        {updateCommunicationPreferenceMutation.isPending ? (
                            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        ) : isCoolingDown ? (
                            t('Auth.resendCountdown', { seconds: secondsLeft })
                        ) : method === 'whatsapp' ? (
                            t('Auth.sendAsEmail')
                        ) : (
                            t('Auth.sendViaWhatsapp')
                        )}
                    </button>
                )}
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
