'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getLoginSchema } from '../validations';
import { useLoginMutation } from '../services/auth.service';
import { Mail24Regular, LockClosed24Regular, ArrowRight24Regular, SpinnerIos20Regular, Eye24Regular, EyeOff24Regular } from '@fluentui/react-icons';
import { Link } from '@/i18n/routing';
import { useState } from 'react';

export default function LoginForm() {
    const t = useTranslations();
    const login = useLoginMutation();
    const [showPassword, setShowPassword] = useState(false);
    const validationSchema = getLoginSchema(t);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('Auth.login')}</h1>
                <p className="text-foreground/60 text-sm">{t('Auth.welcomeBack')}</p>
            </div>

            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={(values) => login.mutate(values)}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.email')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/30">
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
                            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.password')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/30">
                                    <LockClosed24Regular />
                                </div>
                                <Field
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full pl-10 pr-12 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="••••••••"
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
                                    <ArrowRight24Regular className="group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                                </>
                            )}
                        </button>
                    </Form>
                )}
            </Formik>

            <div className="text-center pt-4 flex flex-col gap-2">
                <Link href="/request-access" className="text-sm font-medium text-primary hover:underline">
                    {t('Auth.requestAccess')}
                </Link>
                <div className="text-xs text-foreground/40 font-medium pt-2">
                    {t('Auth.noAccount')}{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        {t('Auth.registerHere')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
