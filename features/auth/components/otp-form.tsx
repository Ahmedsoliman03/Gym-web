'use client';

import { useState, useRef, useEffect } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getOtpSchema } from '../validations';
import { SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
import { useAuthUser } from '../hooks/useAuthUser';
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
    form: "space-y-8",
    otpWrapper: "flex justify-between gap-2",
    otpInput: "w-12 h-16 bg-[#111827] border border-white/5 rounded-xl text-center text-2xl font-bold text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none",
    error: "text-red-500 text-[10px] text-center mt-2",
    timerWrapper: "text-center space-y-2",
    timerText: "text-xs font-bold text-foreground/40",
    expiredText: "text-xs font-bold text-red-500",
    resendButton: "text-primary hover:underline text-xs font-bold decoration-2 underline-offset-4 disabled:opacity-30 disabled:no-underline",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg",
    submitIcon: "w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block"
};

export default function OtpForm() {
    const t = useTranslations();
    const router = useRouter();

    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const { verifyOTP } = useAuthUser();
    const validationSchema = getOtpSchema(t);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(300);
    const [isExpired, setIsExpired] = useState(false);
    const [isResending, setIsResending] = useState(false);

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

    const handleResend = async () => {
        setIsResending(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(t('Auth.otpSent'));
            setTimeLeft(300);
            setIsExpired(false);
        } catch (error) {
            toast.error(t('Validation.error'));
        } finally {
            setIsResending(false);
        }
    };

    const handleChange = (index: number, value: string, setFieldValue: any) => {
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
                    try {
                        await verifyOTP({ email, otp: values.code });
                        toast.success(t('Auth.registrationSuccess'));
                        router.push('/login');
                    } catch (error: any) {
                        toastApiError(error, t('Validation.error'));
                    }
                }}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form className={styles.form}>
                        <LiveValidate />
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
                                disabled={isResending || (!isExpired && timeLeft > 0)}
                                className={styles.resendButton}
                            >
                                {isResending ? <SpinnerIos20Regular className="animate-spin" /> : t('Auth.resendCode')}
                            </button>
                        </div>

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
                    </Form>
                )}
            </Formik>
        </div>
    );
}
