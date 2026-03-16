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
            <div className="space-y-1 text-center flex flex-col items-center">
                <h1 className="text-3xl font-black tracking-tight flex items-center justify-center">
                    <span className="animate-typing border-e-4 border-primary pe-1 overflow-hidden whitespace-nowrap">
                        {t('Auth.welcomeTitle')}
                    </span>
                </h1>
                <p className="text-foreground/60 text-[13px]">{t('Auth.welcomeBack')}</p>
            </div>

            <style jsx>{`
                .animate-typing {
                    display: inline-block;
                    width: 0;
                    animation: 
                        typing 2s steps(30, end) forwards,
                        blink-caret .75s step-end infinite;
                }

                @keyframes typing {
                    from { width: 0 }
                    to { width: 100% }
                }

                @keyframes blink-caret {
                    from, to { border-color: transparent }
                    50% { border-color: var(--primary) }
                }

                :global(.dark) .animate-typing {
                    --primary: #22C55E;
                }
            `}</style>

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
                            className="w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg tracking-tight"
                        >
                            {isSubmitting ? (
                                <SpinnerIos20Regular className="animate-spin" />
                            ) : (
                                <>
                                    <span>{t('Auth.submit')}</span>
                                    <ArrowRight24Regular className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block" />
                                </>
                            )}
                        </button>
                    </Form>
                )}
            </Formik>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
                {/* Primary Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/request-access" className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-primary/20 transition-all">
                        <span className="text-primary font-bold text-sm tracking-tight">{t('Auth.requestAccess')}</span>
                        <span className="text-[9px] text-foreground/30 uppercase tracking-[0.1em] font-black group-hover:text-foreground/50 transition-colors">{t('Auth.gymsAndCoaches')}</span>
                    </Link>
                    <Link href="/activate" className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-primary/20 transition-all">
                        <span className="text-primary font-bold text-sm tracking-tight">{t('Auth.activateProfile')}</span>
                        <span className="text-[9px] text-foreground/30 uppercase tracking-[0.15em] font-black group-hover:text-foreground/50 transition-colors">Invite Code</span>
                    </Link>
                </div>

                {/* Secondary Links */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-[13px] font-medium">
                        <span className="text-foreground/40">{t('Auth.noAccount')}</span>
                        <Link href="/register" className="text-white hover:text-primary transition-all font-bold">
                            {t('Auth.registerHere')}
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[13px] font-medium">
                        <span className="text-foreground/40">{t('Auth.needHelp')}</span>
                        <a 
                            href="https://wa.me/201159133110" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-white hover:text-primary transition-all font-bold group flex items-center gap-1"
                        >
                            <span>{t('Auth.contactSupport')}</span>
                            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
