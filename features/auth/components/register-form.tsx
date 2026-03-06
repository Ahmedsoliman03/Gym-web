'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRegisterSchema, getOtpSchema } from '../validations';
import { useRegisterMutation, useVerifyOTPMutation } from '../services/auth.service';
import { LockClosed24Regular, ArrowRight24Regular, SpinnerIos20Regular, CheckmarkCircle24Regular, Key24Regular, Person24Regular, Mail24Regular, Eye24Regular, EyeOff24Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { Link } from '@/i18n/routing';

export default function RegisterForm() {
    const t = useTranslations();
    const register = useRegisterMutation();
    const verify = useVerifyOTPMutation();
    const [step, setStep] = useState<'register' | 'otp' | 'success'>('register');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const registerSchema = getRegisterSchema(t);
    const otpSchema = getOtpSchema(t);

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

    if (step === 'otp') {
        return (
            <div className="space-y-6 animate-premium-in">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">{t('Auth.verifyEmail')}</h1>
                    <p className="text-foreground/60 text-sm">{t('Auth.otpSent')}</p>
                </div>

                <Formik
                    initialValues={{ code: '' }}
                    validationSchema={otpSchema}
                    onSubmit={async (values) => {
                        await verify.mutateAsync(values);
                        setStep('success');
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <div className="space-y-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30">
                                        <Key24Regular />
                                    </div>
                                    <Field
                                        name="code"
                                        className="w-full pl-10 pr-4 py-4 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-center text-2xl tracking-[1em] font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                                <ErrorMessage name="code" component="div" className="text-red-500 text-xs mt-1 px-1" />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                {isSubmitting ? <SpinnerIos20Regular className="animate-spin" /> : t('Auth.verifyAndComplete')}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('Auth.register')}</h1>
                <p className="text-foreground/60 text-sm">{t('Auth.registerSubtitle')}</p>
            </div>

            <Formik
                initialValues={{ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={registerSchema}
                onSubmit={async (values) => {
                    await register.mutateAsync(values);
                    setStep('otp');
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30">
                                        <Person24Regular />
                                    </div>
                                    <Field
                                        name="firstName"
                                        className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        placeholder={t('Validation.firstName')}
                                    />
                                </div>
                                <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-1 px-1" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30">
                                        <Person24Regular />
                                    </div>
                                    <Field
                                        name="lastName"
                                        className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        placeholder={t('Validation.lastName')}
                                    />
                                </div>
                                <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-1 px-1" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30">
                                    <Mail24Regular />
                                </div>
                                <Field
                                    name="email"
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.emailPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        <div className="space-y-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30">
                                    <LockClosed24Regular />
                                </div>
                                <Field
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full pl-10 pr-12 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/30 hover:text-foreground/50 transition-colors cursor-pointer"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff24Regular /> : <Eye24Regular />}
                                </button>
                            </div>
                            <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        <div className="space-y-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30">
                                    <LockClosed24Regular />
                                </div>
                                <Field
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full pl-10 pr-12 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Validation.confirmPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/30 hover:text-foreground/50 transition-colors cursor-pointer"
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOff24Regular /> : <Eye24Regular />}
                                </button>
                            </div>
                            <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            {isSubmitting ? (
                                <SpinnerIos20Regular className="animate-spin" />
                            ) : (
                                <>
                                    {t('Auth.submit')}
                                    <ArrowRight24Regular className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                                </>
                            )}
                        </button>
                    </Form>
                )}
            </Formik>

            <div className="text-center pt-4 text-sm font-medium">
                <Link href="/login" className="text-foreground/40 hover:text-primary transition-colors cursor-pointer">
                    {t('Auth.alreadyHaveAccount')}
                </Link>
            </div>
        </div>
    );
}
