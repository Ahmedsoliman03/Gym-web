'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getActivateProfileSchema } from '../validations';
import {
    SpinnerIos20Regular,
    CheckmarkCircle24Regular,
    Key24Regular,
    Eye24Regular,
    EyeOff24Regular,
    LockClosed24Regular,
    ArrowRight24Regular
} from '@fluentui/react-icons';
import { useState } from 'react';
import { Link } from '@/i18n/routing';

export default function ActivateProfileForm() {
    const t = useTranslations();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [showPassword, setShowPassword] = useState(false);

    const schema = getActivateProfileSchema(t);

    if (step === 'success') {
        return (
            <div className="text-center space-y-4 animate-premium-in">
                <div className="flex justify-center text-green-500">
                    <CheckmarkCircle24Regular className="w-16 h-16" />
                </div>
                <h2 className="text-2xl font-bold">{t('Auth.registrationComplete')}</h2>
                <p className="text-foreground/60">{t('Auth.registrationSuccess')}</p>
                <Link href="/login" className="block text-primary font-medium hover:underline">{t('Auth.goToLogin')}</Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-premium-in max-w-[450px] mx-auto">
            {/* Header section with Badge */}
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black tracking-widest text-primary uppercase">
                            {t('Auth.securityCheck')}
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-white">{t('Auth.finalStep')}</h1>
                    <p className="text-foreground/60 text-[13px] leading-relaxed px-4">
                        {t('Auth.activateSubtitle')}
                    </p>
                </div>
            </div>

            <Formik
                initialValues={{ inviteCode: '', password: '', agreement: false }}
                validationSchema={schema}
                onSubmit={async (values) => {
                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    console.log('Activating profile:', values);
                    setStep('success');
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        {/* Invite Code */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/80 px-1">
                                {t('Auth.inviteCode')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors">
                                    <Key24Regular className="w-5 h-5" />
                                </div>
                                <Field
                                    name="inviteCode"
                                    className="w-full pl-12 pr-4 py-4 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-lg tracking-[0.2em] font-mono"
                                    placeholder={t('Auth.inviteCodePlaceholder')}
                                    maxLength={8}
                                />
                            </div>
                            <ErrorMessage name="inviteCode" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-foreground/80 px-1">
                                {t('Auth.createSecurePassword')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors">
                                    <LockClosed24Regular className="w-5 h-5" />
                                </div>
                                <Field
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full pl-12 pr-12 py-4 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm"
                                    placeholder={t('Auth.passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/30 hover:text-foreground/50 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff24Regular className="w-5 h-5" /> : <Eye24Regular className="w-5 h-5" />}
                                </button>
                            </div>
                            <ErrorMessage name="password" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>


                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg tracking-tight"
                            >
                                {isSubmitting ? (
                                    <SpinnerIos20Regular className="animate-spin" />
                                ) : (
                                    <>
                                        {t('Auth.activateProfile')}
                                        <ArrowRight24Regular className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

            <div className="text-center pt-2 text-sm font-medium">
                <span className="text-foreground/40">{t('Auth.needHelp')} </span>
                <button type="button" className="text-white hover:text-primary transition-colors cursor-pointer font-bold">
                    {t('Auth.contactSupport')}
                </button>
            </div>
        </div>
    );
}
