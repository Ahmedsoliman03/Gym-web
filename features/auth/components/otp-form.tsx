'use client';

import { Formik, Form, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getOtpSchema } from '../validations';
import { SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
import { useRouter } from '@/i18n/routing';
import { useState, useRef } from 'react';

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
        <div className="space-y-8 animate-premium-in">
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-black tracking-tight text-white">{t('Auth.verifyIdentity')}</h1>
                <p className="text-foreground/50 text-[13px] leading-relaxed max-w-[280px] mx-auto">
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
                    <Form className="space-y-8">
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value, setFieldValue)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-16 bg-[#111827] border border-white/5 rounded-xl text-center text-2xl font-bold text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                />
                            ))}
                        </div>
                        <ErrorMessage name="code" component="div" className="text-red-500 text-[10px] text-center mt-2" />

                        <div className="text-center">
                            <button type="button" className="text-[#3b82f6] hover:underline text-xs font-bold decoration-2 underline-offset-4">
                                {t('Auth.resendCode')}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg tracking-tight"
                        >
                            {isSubmitting ? (
                                <SpinnerIos20Regular className="animate-spin" />
                            ) : (
                                <>
                                    {t('Auth.verifyAndComplete')}
                                    <ArrowRight24Regular className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
