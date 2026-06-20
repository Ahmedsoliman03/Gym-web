'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getLoginSchema } from '../validations';
import { useAuthUser } from '../hooks/useAuthUser';
import { Mail24Regular, LockClosed24Regular, ArrowRight24Regular, SpinnerIos20Regular, Eye24Regular, EyeOff24Regular } from '@fluentui/react-icons';
import { Link, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { toastApiError } from '@/utils/toast-api-error';
import { LiveValidate } from '@/components/shared/live-validate';
import { GoogleAuthButton } from './google-auth-button';
import { normalizeAuthNextPath } from '../utils/next-path';

const styles = {
    container: "space-y-6",
    logoWrapper: "flex justify-center mb-8",
    logo: "flex items-center gap-2 group",
    logoIcon: "w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-primary-foreground transform group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20",
    logoTextWrapper: "flex flex-col text-left",
    logoTitle: "font-black text-xl leading-none",
    logoSubtitle: "text-[10px] text-primary font-bold uppercase leading-none",
    header: "space-y-1 text-center flex flex-col items-center",
    title: "text-3xl font-black flex items-center justify-center",
    typingEffect: "animate-typing border-e-4 border-primary pe-1 overflow-hidden whitespace-nowrap",
    subtitle: "text-foreground/60 text-[13px]",
    form: "space-y-4",
    socialButton: "w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#111827] border border-white/10 rounded-xl hover:bg-white/5 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold",
    dividerWrapper: "relative py-1 flex items-center gap-4",
    dividerLine: "flex-1 h-[1px] bg-white/5",
    dividerText: "text-[10px] font-black text-foreground/30 uppercase",
    fieldWrapper: "space-y-1",
    label: "text-xs font-semibold uppercase text-foreground/50 px-1",
    inputWrapper: "relative",
    inputIcon: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/30",
    input: "w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none",
    inputPassword: "w-full pl-10 pr-12 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none",
    eyeButton: "absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/30 hover:text-foreground/50 transition-colors cursor-pointer",
    error: "text-red-500 text-xs mt-1 px-1",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-lg shadow-primary/20 enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-base uppercase",
    footer: "mt-8 pt-6 border-t border-white/5 space-y-6",
    actionGrid: "grid grid-cols-2 gap-3",
    actionLink: "group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-primary/20 transition-all",
    actionLinkTitle: "text-primary font-bold text-sm",
    actionLinkSubtitle: "text-[9px] text-foreground/30 uppercase font-black group-hover:text-foreground/50 transition-colors",
    secondaryWrapper: "flex flex-col items-center gap-3",
    secondaryText: "flex items-center gap-2 text-[13px] font-medium",
    dimText: "text-foreground/40",
    boldLink: "text-white hover:text-primary transition-all font-bold",
    supportLink: "text-white hover:text-primary transition-all font-bold group flex items-center gap-1",
    supportIcon: "w-3 h-3 group-hover:translate-x-0.5 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
};

export default function LoginForm() {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuthUser();
    const [showPassword, setShowPassword] = useState(false);
    const validationSchema = getLoginSchema(t);

    return (
        <div className={styles.container}>


            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.typingEffect}>
                        {t('Auth.welcomeTitle')}
                    </span>
                </h1>
                <p className={styles.subtitle}>{t('Auth.welcomeBack')}</p>
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

            <GoogleAuthButton
                className={styles.socialButton}
                label={t('Auth.continueWithGoogle')}
            />

            <div className={styles.dividerWrapper}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>{t('Auth.orWithEmail')}</span>
                <div className={styles.dividerLine} />
            </div>

            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => {
                    try {
                        await login(values);
                        toast.success(t('Auth.loginSuccess') || 'Logged in successfully!');

                        const safeNext = normalizeAuthNextPath(searchParams.get('next'));
                        router.push(safeNext as never);
                    } catch (error) {
                        toastApiError(error, t('Auth.loginFailed'));
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className={styles.form}>
                        <LiveValidate />
                        <div className={styles.fieldWrapper}>
                            <label htmlFor="login-email" className={styles.label}>
                                {t('Auth.email')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <Mail24Regular />
                                </div>
                                <Field
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    className={styles.input}
                                    placeholder={t('Auth.emailPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="email" component="div" className={styles.error} />
                        </div>

                        <div className={styles.fieldWrapper}>
                            <label htmlFor="login-password" className={styles.label}>
                                {t('Auth.password')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <LockClosed24Regular />
                                </div>
                                <Field
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className={styles.inputPassword}
                                    placeholder={t('Auth.passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.eyeButton}
                                    aria-label={showPassword ? t('Auth.hidePassword') : t('Auth.showPassword')}
                                >
                                    {showPassword ? <EyeOff24Regular /> : <Eye24Regular />}
                                </button>
                            </div>
                            <ErrorMessage name="password" component="div" className={styles.error} />
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
                                    <span>{t('Auth.submit')}</span>
                                    <ArrowRight24Regular className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block" />
                                </>
                            )}
                        </button>
                    </Form>
                )}
            </Formik>

            <div className={styles.footer}>
                <div className={styles.actionGrid}>
                    <Link href="/request-access" className={styles.actionLink}>
                        <span className={styles.actionLinkTitle}>{t('Auth.requestAccess')}</span>
                        <span className={styles.actionLinkSubtitle}>{t('Auth.gymsAndCoaches')}</span>
                    </Link>
                    <Link href="/activate" className={styles.actionLink}>
                        <span className={styles.actionLinkTitle}>{t('Auth.activateProfile')}</span>
                        <span className={styles.actionLinkSubtitle}>{t('Auth.inviteCodeLabel')}</span>
                    </Link>
                </div>

                <div className={styles.secondaryWrapper}>
                    <div className={styles.secondaryText}>
                        <span className={styles.dimText}>{t('Auth.noAccount')}</span>
                        <Link href="/register" className={styles.boldLink}>
                            {t('Auth.registerHere')}
                        </Link>
                    </div>

                    <div className={styles.secondaryText}>
                        <span className={styles.dimText}>{t('Auth.needHelp')}</span>
                        <a
                            href="https://wa.me/201159133110"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.supportLink}
                        >
                            <span>{t('Auth.contactSupport')}</span>
                            <svg className={styles.supportIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
