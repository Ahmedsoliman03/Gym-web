'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getActivateProfileSchema } from '../validations';
import { useAuthRequest } from '../hooks/useAuthRequest';
import {
    SpinnerIos20Regular,
    CheckmarkCircle24Regular,
    Key24Regular,
    Mail24Regular,
    Eye24Regular,
    EyeOff24Regular,
    LockClosed24Regular,
    ArrowRight24Regular,
    ArrowLeft24Regular
} from '@fluentui/react-icons';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import type { OtpChannel } from '../types';
import { LiveValidate } from '@/components/shared/live-validate';
import { FormPersist, clearFormDraft } from '@/components/shared/form-persist';
import { formatCountdown } from '@/utils/format';

const styles = {
    success: {
        container: "text-center space-y-4",
        iconWrapper: "flex justify-center text-green-500",
        icon: "w-16 h-16",
        title: "text-2xl font-bold",
        description: "text-foreground/60",
        link: "block text-primary font-medium hover:underline"
    },
    backButton: "inline-flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors mb-6 group",
    backIcon: "w-5 h-5 transition-transform group-hover:-translate-x-1",
    backText: "text-xs font-black uppercase tracking-wider",
    container: "space-y-8 max-w-[450px] mx-auto",
    header: "space-y-6 text-center",
    badgeWrapper: "flex justify-center",
    badge: "inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full",
    badgeDot: "w-2 h-2 bg-primary rounded-full animate-pulse",
    badgeText: "text-[10px] font-black text-primary uppercase",
    titleWrapper: "space-y-1",
    title: "text-2xl font-bold text-white",
    subtitle: "text-foreground/60 text-[13px] leading-relaxed px-4",
    form: "space-y-6",
    fieldWrapper: "space-y-2",
    label: "text-xs font-bold text-foreground/80 px-1",
    inputWrapper: "relative group",
    inputIcon: "absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors",
    inputIconSize: "w-5 h-5",
    inputInvite: "w-full pl-12 pr-4 py-4 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-lg font-mono",
    inputPassword: "w-full pl-12 pr-12 py-4 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm",
    eyeButton: "absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/30 hover:text-foreground/50 transition-colors cursor-pointer",
    error: "text-red-500 text-[10px] mt-1 px-1",
    channelHint: "text-center text-[12px] font-semibold text-primary/90 bg-primary/5 border border-primary/15 rounded-xl py-2.5 px-4",
    timerWrapper: "text-center space-y-2",
    timerText: "text-xs font-bold text-foreground/40",
    expiredText: "text-xs font-bold text-red-500",
    resendButton: "block mx-auto text-foreground/40 hover:text-primary text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-foreground/40 cursor-pointer",
    switchButton: "w-full py-4 bg-primary/10 text-primary border border-primary/40 rounded-xl font-semibold enabled:hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-base",
    submitWrapper: "pt-4",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg",
    submitIcon: "w-5 h-5 group-hover:translate-x-1 transition-transform",
    footer: "text-center pt-2 text-sm font-medium",
    footerDim: "text-foreground/40",
    footerLink: "text-white hover:text-primary transition-colors cursor-pointer font-bold"
};

import toast from 'react-hot-toast';
import { toastApiError } from '@/utils/toast-api-error';

const OTP_TIMER_SECONDS = 300;
const OTP_TIMER_MS = OTP_TIMER_SECONDS * 1000;
const SWITCH_COOLDOWN_MS = 15 * 1000;
const ACTIVATE_TYPE_KEY = 'activate:channel';
const ACTIVATE_COOLDOWN_KEY = 'activate:switchCooldownUntil';
const ACTIVATE_TIMER_KEY = 'activate:timerUntil';

export default function ActivateProfileForm() {
    const t = useTranslations();
    const { activate, resendActivation } = useAuthRequest();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpType, setOtpType] = useState<OtpChannel>('email');
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(OTP_TIMER_SECONDS);
    const [isExpired, setIsExpired] = useState(false);

    // The switch cooldown is stored as an absolute expiry timestamp so it keeps
    // counting after a page reload; the visible countdown is derived from a
    // ticking `nowTs` (0 until mounted so SSR never shows a stale value).
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const [nowTs, setNowTs] = useState(0);

    const schema = getActivateProfileSchema(t);

    const switchCooldown =
        nowTs > 0 && cooldownUntil > nowTs
            ? Math.ceil((cooldownUntil - nowTs) / 1000)
            : 0;

    // Restore the persisted channel, the code timer, and the remaining switch
    // cooldown on mount so a reload or a locale switch continues the running
    // countdowns instead of restarting them.
    useEffect(() => {
        const storedType = localStorage.getItem(ACTIVATE_TYPE_KEY);
        if (storedType === 'whatsapp' || storedType === 'email') {
            setOtpType(storedType);
        }

        // 5-minute resend timer: continue from the stored expiry, or open a
        // fresh window on the first visit.
        const timerUntil = Number(localStorage.getItem(ACTIVATE_TIMER_KEY)) || 0;
        if (timerUntil) {
            const remaining = Math.ceil((timerUntil - Date.now()) / 1000);
            if (remaining > 0) {
                setTimeLeft(remaining);
            } else {
                setTimeLeft(0);
                setIsExpired(true);
            }
        } else {
            localStorage.setItem(ACTIVATE_TIMER_KEY, String(Date.now() + OTP_TIMER_MS));
        }

        const until = Number(localStorage.getItem(ACTIVATE_COOLDOWN_KEY)) || 0;
        if (until > Date.now()) {
            setCooldownUntil(until);
        } else if (until) {
            localStorage.removeItem(ACTIVATE_COOLDOWN_KEY);
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
                localStorage.removeItem(ACTIVATE_COOLDOWN_KEY);
                setCooldownUntil(0);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldownUntil]);

    // Re-issues the activation (invite) code through /resend-activation for the
    // given channel and restarts the 5-minute timer. Needs the entered email.
    const sendCode = async (type: OtpChannel, email: string): Promise<boolean> => {
        if (!email) {
            toast.error(t('Validation.error'));
            return false;
        }

        setIsResending(true);
        try {
            await resendActivation({ email, verification_method: type });
            toast.success(t('Auth.activationCodeSent'));
            localStorage.setItem(ACTIVATE_TIMER_KEY, String(Date.now() + OTP_TIMER_MS));
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
    const handleResend = (email: string) => sendCode(otpType, email);

    // Big button: change the delivery channel and send the code through it.
    // Starts the persisted 15s cooldown so the channel can't be flipped rapidly.
    const handleSwitchType = async (email: string) => {
        const next: OtpChannel = otpType === 'email' ? 'whatsapp' : 'email';
        const sent = await sendCode(next, email);
        if (!sent) return;

        setOtpType(next);
        localStorage.setItem(ACTIVATE_TYPE_KEY, next);

        const until = Date.now() + SWITCH_COOLDOWN_MS;
        setCooldownUntil(until);
        setNowTs(Date.now());
        localStorage.setItem(ACTIVATE_COOLDOWN_KEY, String(until));
    };

    if (step === 'success') {
        return (
            <div className={styles.success.container}>
                <div className={styles.success.iconWrapper}>
                    <CheckmarkCircle24Regular className={styles.success.icon} />
                </div>
                <h2 className={styles.success.title}>{t('Auth.registrationComplete')}</h2>
                <p className={styles.success.description}>{t('Auth.registrationSuccess')}</p>
                <Link href="/login" className={styles.success.link}>{t('Auth.goToHome')}</Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/login" className={styles.backButton}>
                <ArrowLeft24Regular className={styles.backIcon} />
                <span className={styles.backText}>{t('Auth.backToLogin')}</span>
            </Link>

            <div className={styles.header}>
                <div className={styles.badgeWrapper}>
                    <div className={styles.badge}>
                        <div className={styles.badgeDot} />
                        <span className={styles.badgeText}>
                            {t('Auth.securityCheck')}
                        </span>
                    </div>
                </div>

                <div className={styles.titleWrapper}>
                    <h1 className={styles.title}>{t('Auth.finalStep')}</h1>
                    <p className={styles.subtitle}>
                        {t('Auth.activateSubtitle')}
                    </p>
                </div>
            </div>

            <Formik
                initialValues={{ email: '', inviteCode: '', password: '', confirmPassword: '', agreement: false }}
                validationSchema={schema}
                onSubmit={async (values) => {
                    try {
                        // Email is only used to resend the code — activate takes
                        // just the invite code + password.
                        await activate({
                            inviteCode: values.inviteCode,
                            password: values.password,
                            confirmPassword: values.confirmPassword,
                        });
                        localStorage.removeItem(ACTIVATE_TIMER_KEY);
                        clearFormDraft('draft:activate-profile');
                        toast.success(t('Auth.registrationComplete'));
                        setStep('success');
                    } catch (error) {
                        toastApiError(error, t('Validation.error'));
                    }
                }}
            >
                {({ isSubmitting, values }) => (
                    <Form className={styles.form}>
                        <LiveValidate />
                        <FormPersist
                            storageKey="draft:activate-profile"
                            exclude={['password', 'confirmPassword']}
                        />

                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.emailAddress')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <Mail24Regular className={styles.inputIconSize} />
                                </div>
                                <Field
                                    name="email"
                                    type="email"
                                    className={styles.inputPassword}
                                    placeholder={t('Auth.emailPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="email" component="div" className={styles.error} />
                        </div>

                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.inviteCode')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <Key24Regular className={styles.inputIconSize} />
                                </div>
                                <Field
                                    name="inviteCode"
                                    className={styles.inputInvite}
                                    placeholder={t('Auth.inviteCodePlaceholder')}
                                    maxLength={8}
                                />
                            </div>
                            <ErrorMessage name="inviteCode" component="div" className={styles.error} />
                        </div>

                        {/* Statement of where the code is (being) sent — flips
                            when the delivery channel is changed. */}
                        <p className={styles.channelHint}>
                            {otpType === 'whatsapp'
                                ? t('Auth.channelHintWhatsapp')
                                : t('Auth.channelHintEmail')}
                        </p>

                        {/* 5-minute timer + resend (same channel) below it. */}
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
                                onClick={() => handleResend(values.email)}
                                disabled={isResending || timeLeft > 0 || !values.email}
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

                        {/* Big button: change the delivery channel (and send the
                            code through it). Disabled during the 15s cooldown,
                            which survives a page reload. */}
                        <button
                            type="button"
                            onClick={() => handleSwitchType(values.email)}
                            disabled={isResending || switchCooldown > 0 || !values.email}
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

                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.createSecurePassword')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <LockClosed24Regular className={styles.inputIconSize} />
                                </div>
                                <Field
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.inputPassword}
                                    placeholder={t('Auth.passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.eyeButton}
                                >
                                    {showPassword ? <EyeOff24Regular className={styles.inputIconSize} /> : <Eye24Regular className={styles.inputIconSize} />}
                                </button>
                            </div>
                            <ErrorMessage name="password" component="div" className={styles.error} />
                        </div>

                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Validation.confirmPassword')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <LockClosed24Regular className={styles.inputIconSize} />
                                </div>
                                <Field
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className={styles.inputPassword}
                                    placeholder={t('Auth.passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={styles.eyeButton}
                                >
                                    {showConfirmPassword ? <EyeOff24Regular className={styles.inputIconSize} /> : <Eye24Regular className={styles.inputIconSize} />}
                                </button>
                            </div>
                            <ErrorMessage name="confirmPassword" component="div" className={styles.error} />
                        </div>

                        <div className={styles.submitWrapper}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={styles.submitButton}
                            >
                                {isSubmitting ? (
                                    <SpinnerIos20Regular className="animate-spin" />
                                ) : (
                                    <>
                                        {t('Auth.activateProfile')}
                                        <ArrowRight24Regular className={styles.submitIcon} />
                                    </>
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

            <div className={styles.footer}>
                <span className={styles.footerDim}>{t('Auth.needHelp')} </span>
                <button type="button" className={styles.footerLink}>
                    {t('Auth.contactSupport')}
                </button>
            </div>
        </div>
    );
}
