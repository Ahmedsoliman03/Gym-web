'use client';

import { useState, useRef, useEffect } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getOtpSchema } from '../validations';
import { SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
import { useAuthUser } from '../hooks/useAuthUser';
import { OTP_TIMER_SECONDS, OTP_TIMER_KEY } from '../types';
import type { OtpChannel } from '../types';
import { useRouter, Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { toastApiError } from '@/utils/toast-api-error';
import { formatCountdown } from '@/utils/format';
import { LiveValidate } from '@/components/shared/live-validate';

const styles = {
    container: "space-y-8",
    backButton: "inline-flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors mb-6 group cursor-pointer",
    backIcon: "w-4 h-4 transition-transform group-hover:-translate-x-1",
    backText: "text-xs font-black uppercase tracking-wider",
    header: "space-y-2 text-center",
    title: "text-4xl font-black text-white",
    subtitle: "text-foreground/50 text-[13px] leading-relaxed max-w-[280px] mx-auto",
    channelHint: "text-center text-[12px] font-semibold text-primary/90 bg-primary/5 border border-primary/15 rounded-xl py-2.5 px-4",
    form: "space-y-8",
    otpWrapper: "flex justify-between gap-2",
    otpInput: "w-12 h-16 bg-[#111827] border border-white/5 rounded-xl text-center text-2xl font-bold text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none",
    error: "text-red-500 text-[10px] text-center mt-2",
    timerWrapper: "text-center space-y-2",
    timerText: "text-xs font-bold text-foreground/40",
    expiredText: "text-xs font-bold text-red-500",
    resendButton: "block mx-auto text-foreground/40 hover:text-primary text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-foreground/40 cursor-pointer",
    actions: "space-y-3",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg",
    submitIcon: "w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block",
    switchButton: "w-full py-4 bg-primary/10 text-primary border border-primary/40 rounded-xl font-semibold enabled:hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-base"
};

const SWITCH_COOLDOWN_MS = 15 * 1000;
const OTP_TIMER_MS = OTP_TIMER_SECONDS * 1000;
const OTP_TYPE_KEY = 'otp:channel';
const OTP_COOLDOWN_KEY = 'otp:switchCooldownUntil';

export default function OtpForm() {
    const t = useTranslations();
    const router = useRouter();

    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const { verifyOTP, resendOtp } = useAuthUser();
    const validationSchema = getOtpSchema(t);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(OTP_TIMER_SECONDS);
    const [isExpired, setIsExpired] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [otpType, setOtpType] = useState<OtpChannel>('whatsapp');

    // The switch cooldown is stored as an absolute expiry timestamp (epoch ms)
    // and the visible countdown is derived from a ticking `nowTs`. This makes a
    // page reload continue the remaining time instead of resetting/ending it.
    // `nowTs` stays 0 until mounted so SSR/first paint never shows a stale value.
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const [nowTs, setNowTs] = useState(0);

    const switchCooldown =
        nowTs > 0 && cooldownUntil > nowTs
            ? Math.ceil((cooldownUntil - nowTs) / 1000)
            : 0;

    // Restore the persisted channel, the code timer, and the remaining switch
    // cooldown on mount so a reload or a locale switch continues the running
    // countdowns instead of restarting them.
    useEffect(() => {
        const storedType = localStorage.getItem(OTP_TYPE_KEY);
        if (storedType === 'whatsapp' || storedType === 'email') {
            setOtpType(storedType);
        }

        // 5-minute code timer: continue from the stored expiry, or open a fresh
        // window on the first visit (also the fallback for direct navigation).
        const timerUntil = Number(localStorage.getItem(OTP_TIMER_KEY)) || 0;
        if (timerUntil) {
            const remaining = Math.ceil((timerUntil - Date.now()) / 1000);
            if (remaining > 0) {
                setTimeLeft(remaining);
            } else {
                setTimeLeft(0);
                setIsExpired(true);
            }
        } else {
            localStorage.setItem(OTP_TIMER_KEY, String(Date.now() + OTP_TIMER_MS));
        }

        const until = Number(localStorage.getItem(OTP_COOLDOWN_KEY)) || 0;
        if (until > Date.now()) {
            setCooldownUntil(until);
        } else if (until) {
            localStorage.removeItem(OTP_COOLDOWN_KEY);
        }
        setNowTs(Date.now());
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsExpired(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Tick `nowTs` while a cooldown is pending; clear it once it elapses.
    useEffect(() => {
        if (!cooldownUntil) return;

        const timer = setInterval(() => {
            const now = Date.now();
            setNowTs(now);
            if (now >= cooldownUntil) {
                localStorage.removeItem(OTP_COOLDOWN_KEY);
                setCooldownUntil(0);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldownUntil]);

    const handleVerify = async (code: string, type: OtpChannel): Promise<boolean> => {
        try {
            await verifyOTP({ email, otp: code, type });
            // Code consumed — drop the persisted timer so a later registration
            // starts a fresh window instead of reading this stale one.
            localStorage.removeItem(OTP_TIMER_KEY);
            toast.success(t('Auth.registrationSuccess'));
            router.push('/login');
            return true;
        } catch (error) {
            toastApiError(error, t('Validation.error'));
            return false;
        }
    };

    // Hits the dedicated /resend-otp endpoint to issue a fresh code for the
    // given channel and restarts the 5-minute expiry.
    const sendCode = async (type: OtpChannel): Promise<boolean> => {
        if (!email) {
            toast.error(t('Validation.error'));
            return false;
        }

        setIsResending(true);
        try {
            await resendOtp({ email, verification_method: type });
            toast.success(t('Auth.otpSent'));
            localStorage.setItem(OTP_TIMER_KEY, String(Date.now() + OTP_TIMER_MS));
            setTimeLeft(OTP_TIMER_SECONDS);
            setIsExpired(false);
            return true;
        } catch (error) {
            toastApiError(error, t('Validation.error'));
            return false;
        } finally {
            setIsResending(false);
        }
    };

    // Small button under the timer: resend through the same channel.
    const handleResend = () => sendCode(otpType);

    // Big button: change the delivery channel and send the code through it.
    // Starts the persisted 15s cooldown so the channel can't be flipped rapidly.
    const handleSwitchType = async () => {
        const next: OtpChannel = otpType === 'whatsapp' ? 'email' : 'whatsapp';
        const sent = await sendCode(next);
        if (!sent) return;

        setOtpType(next);
        localStorage.setItem(OTP_TYPE_KEY, next);

        const until = Date.now() + SWITCH_COOLDOWN_MS;
        setCooldownUntil(until);
        setNowTs(Date.now());
        localStorage.setItem(OTP_COOLDOWN_KEY, String(until));
    };

    const handleChange = (
        index: number,
        value: string,
        setFieldValue: (field: string, value: string) => void,
    ) => {
        if (value.length > 1) value = value[value.length - 1];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setFieldValue('code', newOtp.join(''));

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (
        e: React.ClipboardEvent<HTMLInputElement>,
        setFieldValue: (field: string, value: string) => void,
    ) => {
        e.preventDefault();
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, otp.length);
        if (!digits) return;

        const newOtp = Array.from({ length: otp.length }, (_, i) => digits[i] ?? '');
        setOtp(newOtp);
        setFieldValue('code', newOtp.join(''));

        // Focus the box after the last filled digit (or the final box).
        const nextIndex = Math.min(digits.length, otp.length - 1);
        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <div className={styles.container}>
            <Link href="/register" className={styles.backButton}>
                <ArrowLeft className={styles.backIcon} />
                <span className={styles.backText}>{t('Auth.backToLogin')}</span>
            </Link>

            <div className={styles.header}>
                <h1 className={styles.title}>{t('Auth.verifyIdentity')}</h1>
                <p className={styles.subtitle}>
                    {t('Auth.otpSubtitle')}
                </p>
            </div>

            <Formik
                initialValues={{ code: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => {
                    await handleVerify(values.code, otpType);
                }}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form className={styles.form}>
                        <LiveValidate />

                        {/* Statement of where the code is (being) sent — flips
                            when the delivery channel is changed. */}
                        <p className={styles.channelHint}>
                            {otpType === 'whatsapp'
                                ? t('Auth.channelHintWhatsapp')
                                : t('Auth.channelHintEmail')}
                        </p>

                        <div className={styles.otpWrapper}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value, setFieldValue)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={(e) => handlePaste(e, setFieldValue)}
                                    className={styles.otpInput}
                                    disabled={isExpired}
                                />
                            ))}
                        </div>
                        <ErrorMessage name="code" component="div" className={styles.error} />

                        {/* 5-minute code timer + resend (same channel) below it. */}
                        <div className={styles.timerWrapper}>
                            {isExpired ? (
                                <p className={styles.expiredText}>
                                    {t('Auth.otpExpired')}
                                </p>
                            ) : (
                                <p className={styles.timerText}>
                                    {t('Auth.timeRemaining', { time: formatCountdown(timeLeft) })}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={isResending || timeLeft > 0}
                                className={styles.resendButton}
                            >
                                {isResending ? (
                                    <SpinnerIos20Regular className="animate-spin" />
                                ) : otpType === 'whatsapp' ? (
                                    t('Auth.resendViaWhatsapp')
                                ) : (
                                    t('Auth.resendViaEmail')
                                )}
                            </button>
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="submit"
                                disabled={isSubmitting || isExpired}
                                className={styles.submitButton}
                            >
                                {isSubmitting ? (
                                    <SpinnerIos20Regular className="animate-spin" />
                                ) : (
                                    <>
                                        <span>{t('Auth.verifyAndComplete')}</span>
                                        <ArrowRight24Regular className={styles.submitIcon} />
                                    </>
                                )}
                            </button>

                            {/* Big button: change the delivery channel (and send
                                the code through it). Disabled during the 15s
                                cooldown, which survives a page reload. */}
                            <button
                                type="button"
                                onClick={handleSwitchType}
                                disabled={isResending || switchCooldown > 0}
                                className={styles.switchButton}
                            >
                                {isResending ? (
                                    <SpinnerIos20Regular className="animate-spin" />
                                ) : switchCooldown > 0 ? (
                                    t('Auth.timeRemaining', { time: formatCountdown(switchCooldown) })
                                ) : otpType === 'whatsapp' ? (
                                    t('Auth.sendAsEmail')
                                ) : (
                                    t('Auth.sendViaWhatsapp')
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
