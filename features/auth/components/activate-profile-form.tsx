'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getActivateProfileSchema } from '../validations';
import { useAuthRequest } from '../hooks/useAuthRequest';
import {
    SpinnerIos20Regular,
    CheckmarkCircle24Regular,
    Key24Regular,
    Eye24Regular,
    EyeOff24Regular,
    LockClosed24Regular,
    ArrowRight24Regular,
    ArrowLeft24Regular
} from '@fluentui/react-icons';
import { useState } from 'react';
import { Link } from '@/i18n/routing';

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
    submitWrapper: "pt-4",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg",
    submitIcon: "w-5 h-5 group-hover:translate-x-1 transition-transform",
    footer: "text-center pt-2 text-sm font-medium",
    footerDim: "text-foreground/40",
    footerLink: "text-white hover:text-primary transition-colors cursor-pointer font-bold"
};

import toast from 'react-hot-toast';

export default function ActivateProfileForm() {
    const t = useTranslations();
    const { activate } = useAuthRequest();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const schema = getActivateProfileSchema(t);

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
                initialValues={{ inviteCode: '', password: '', confirmPassword: '', agreement: false }}
                validationSchema={schema}
                onSubmit={async (values) => {
                    try {
                        await activate(values);
                        toast.success(t('Auth.registrationComplete'));
                        setStep('success');
                    } catch (error: any) {
                        toast.error(error?.response?.data?.message || t('Validation.error'));
                    }
                }}
            >
                {({ isSubmitting, isValid, dirty }) => (
                    console.log(isValid),
                    <Form className={styles.form}>


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
                                disabled={isSubmitting || !isValid || !dirty}
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
