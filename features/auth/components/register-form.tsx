'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRegisterSchema } from '../validations';
import { useRegisterMutation } from '../services/auth.service';
import {
    SpinnerIos20Regular,
    Eye24Regular,
    EyeOff24Regular,
    Person24Regular,
    Mail24Regular,
    Phone24Regular,
    LockClosed24Regular,
    ArrowRight24Regular
} from '@fluentui/react-icons';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';

export default function RegisterForm() {
    const t = useTranslations();
    const router = useRouter();
    const register = useRegisterMutation();
    const [showPassword, setShowPassword] = useState(false);

    const registerSchema = getRegisterSchema(t);

    return (
        <div className="space-y-4 animate-premium-in max-w-[420px] mx-auto">
            <div className="space-y-0.5 text-center">
                <h1 className="text-4xl font-black tracking-tight text-white">{t('Auth.register')}</h1>
                <p className="text-foreground/50 text-[13px] leading-relaxed">{t('Auth.registerSubtitle')}</p>
            </div>

            {/* Social Logins */}
            <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#111827] border border-white/10 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-white text-sm font-bold">{t('Auth.google')}</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#111827] border border-white/10 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                        <path d="M17.05 20.28c-.96.95-2.04 1.9-3.4 1.9-1.31 0-1.72-.82-3.26-.82-1.54 0-2.02.8-3.26.82-1.31.02-2.41-.98-3.37-1.9-1.98-1.91-3.41-5.38-3.41-8.5 0-4.94 3.11-7.56 6.07-7.56 1.48 0 2.76.92 3.7.92.93 0 2.45-1.07 4.13-1.07 1.48 0 2.89.73 3.79 1.91-3.15 1.5-2.65 6.09.52 7.42-1.02 2.37-2.3 4.95-4.77 7.82zm-3.08-16.14c.73-1.12 1.23-2.68 1.23-4.14 0-.21-.02-.42-.06-.62-1.41.06-3.1 1.01-4.04 2.14-.85.99-1.56 2.58-1.56 4.01 0 .23.03.46.06.63 1.54-.03 3.01-.9 3.86-1.57z" />
                    </svg>
                    <span className="text-white text-sm font-bold">{t('Auth.apple')}</span>
                </button>
            </div>

            <div className="relative py-2 flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-white/5"></div>
                <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{t('Auth.orWithEmail')}</span>
                <div className="flex-1 h-[1px] bg-white/5"></div>
            </div>

            <Formik
                initialValues={{ fullName: '', email: '', phone: '', password: '' }}
                validationSchema={registerSchema}
                onSubmit={async (values) => {
                    await register.mutateAsync(values);
                    router.push('/verify-otp');
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-3">
                        {/* Full Name */}
                        <div className="space-y-0.5">
                            <label className="text-xs font-bold text-foreground/80 px-1">
                                {t('Auth.fullName')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors">
                                    <Person24Regular className="w-5 h-5" />
                                </div>
                                <Field
                                    name="fullName"
                                    className="w-full pl-11 pr-4 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm"
                                    placeholder={t('Auth.fullNamePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="fullName" component="div" className="text-red-500 text-[10px] mt-0.5 px-1" />
                        </div>

                        {/* Email */}
                        <div className="space-y-0.5">
                            <label className="text-xs font-bold text-foreground/80 px-1">
                                {t('Auth.emailAddress')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors">
                                    <Mail24Regular className="w-5 h-5" />
                                </div>
                                <Field
                                    name="email"
                                    type="email"
                                    className="w-full pl-11 pr-4 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm"
                                    placeholder={t('Auth.emailPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="email" component="div" className="text-red-500 text-[10px] mt-0.5 px-1" />
                        </div>

                        {/* Phone */}
                        <div className="space-y-0.5">
                            <label className="text-xs font-bold text-foreground/80 px-1">
                                {t('Auth.phone')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors">
                                    <Phone24Regular className="w-5 h-5" />
                                </div>
                                <Field
                                    name="phone"
                                    className="w-full pl-11 pr-4 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm"
                                    placeholder={t('Auth.phonePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="phone" component="div" className="text-red-500 text-[10px] mt-0.5 px-1" />
                        </div>

                        {/* Password */}
                        <div className="space-y-0.5">
                            <label className="text-xs font-bold text-foreground/80 px-1">
                                {t('Auth.password')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors">
                                    <LockClosed24Regular className="w-5 h-5" />
                                </div>
                                <Field
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full pl-11 pr-12 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm"
                                    placeholder={t('Auth.passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/30 hover:text-foreground/50 transition-colors cursor-pointer"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff24Regular className="w-5 h-5" /> : <Eye24Regular className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-foreground/40 italic px-1 mt-1 font-medium">{t('Auth.passwordHint')}</p>
                            <ErrorMessage name="password" component="div" className="text-red-500 text-[10px] mt-0.5 px-1" />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg tracking-tight"
                            >
                                {isSubmitting ? (
                                    <SpinnerIos20Regular className="animate-spin" />
                                ) : (
                                    <>
                                        <span>{t('Auth.createAccount')}</span>
                                        <ArrowRight24Regular className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block" />
                                    </>
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

            <div className="text-center pt-2 text-sm font-medium">
                <span className="text-foreground/40">{t('Auth.alreadyHaveAccount')} </span>
                <Link href="/login" className="text-[#3b82f6] hover:text-[#3b82f6]/80 transition-colors cursor-pointer font-bold text-xs">
                    {t('Auth.signIn')}
                </Link>
            </div>
        </div>
    );
}
