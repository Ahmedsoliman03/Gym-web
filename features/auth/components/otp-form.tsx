'use client';

import { Formik, Form, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getOtpSchema } from '../validations';
import { SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
import { useRouter } from '@/i18n/routing';
import { useState, useRef } from 'react';

const styles = {
  container: "space-y-8 animate-premium-in",
  header: "space-y-2 text-center",
  title: "text-4xl font-black text-white",
  subtitle: "text-foreground/50 text-[13px] leading-relaxed max-w-[280px] mx-auto",
  form: "space-y-8",
  otpWrapper: "flex justify-between gap-2",
  otpInput: "w-12 h-16 bg-[#111827] border border-white/5 rounded-xl text-center text-2xl font-bold text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none",
  error: "text-red-500 text-[10px] text-center mt-2",
  resendWrapper: "text-center",
  resendButton: "text-[#3b82f6] hover:underline text-xs font-bold decoration-2 underline-offset-4",
  submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg",
  submitIcon: "w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block"
};

export default function OtpForm() {
    const t = useTranslations();
    const router = useRouter();
    const validationSchema = getOtpSchema(t);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);

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

    return (
        <div className={styles.container}>
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
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    console.log('Verifying OTP:', values.code);
                    router.push('/login');
                }}
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form className={styles.form}>
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
                                    className={styles.otpInput}
                                />
                            ))}
                        </div>
                        <ErrorMessage name="code" component="div" className={styles.error} />

                        <div className={styles.resendWrapper}>
                            <button type="button" className={styles.resendButton}>
                                {t('Auth.resendCode')}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
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
