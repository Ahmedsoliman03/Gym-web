'use client';

import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { useTranslations } from 'next-intl';
import { getRegisterSchema } from '../validations';
import { useAuthUser } from '../hooks/useAuthUser';
import { RegisterFormValues } from '../types';
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
import { useCallback, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { LocationDetectButton } from '@/components/ui/location-detect-button';
import { useLocationDetect, LocationResult } from '@/hooks/use-location-detect';

const styles = {
    container: "space-y-4 max-w-[420px] mx-auto",
    header: "space-y-0.5 text-center",
    title: "text-4xl font-black text-white",
    subtitle: "text-foreground/50 text-[13px] leading-relaxed",
    socialWrapper: "flex gap-3",
    socialButton: "flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#111827] border border-white/10 rounded-xl hover:bg-white/5 transition-all group cursor-pointer",
    socialIcon: "w-5 h-5",
    socialIconApple: "w-5 h-5 fill-white",
    socialText: "text-white text-sm font-bold",
    dividerWrapper: "relative py-2 flex items-center gap-4",
    dividerLine: "flex-1 h-[1px] bg-white/5",
    dividerText: "text-[10px] font-black text-foreground/30 uppercase",
    form: "space-y-3",
    fieldWrapper: "space-y-0.5",
    label: "text-xs font-bold text-foreground/80 px-1",
    inputWrapper: "relative group",
    inputIcon: "absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors",
    inputIconSize: "w-5 h-5",
    input: "w-full pl-11 pr-4 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm",
    inputPlain: "w-full px-4 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm",
    inputPassword: "w-full pl-11 pr-12 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm",
    locationSection: "space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-3",
    locationHeader: "flex items-center justify-between gap-2 flex-wrap",
    locationHeaderLabel: "text-[10px] font-black text-foreground/40 uppercase tracking-wider px-1",
    locationGrid: "grid grid-cols-2 gap-3",
    eyeButton: "absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/30 hover:text-foreground/50 transition-colors cursor-pointer",
    error: "text-red-500 text-[10px] mt-0.5 px-1",
    passwordHint: "text-[10px] text-foreground/40 px-1 mt-1 font-medium",
    submitWrapper: "pt-2",
    submitButton: "w-full py-3.5 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg",
    submitIcon: "w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block",
    footer: "text-center pt-2 text-sm font-medium",
    footerDim: "text-foreground/40",
    footerLink: "text-[#3b82f6] hover:text-[#3b82f6]/80 transition-colors cursor-pointer font-bold text-xs"
};

import toast from 'react-hot-toast';
import { toastApiError } from '@/utils/toast-api-error';

export default function RegisterForm() {
    const t = useTranslations();
    const tLoc = useTranslations('Location');
    const router = useRouter();
    const { register } = useAuthUser();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const formikRef = useRef<FormikProps<RegisterFormValues>>(null);

    const registerSchema = getRegisterSchema(t);

    const handleLocationSuccess = useCallback((result: LocationResult) => {
        // Mirrors the convention in gyms-view.tsx: governorate -> city, sub-city -> area.
        let city = '';
        if (result.governorate) {
            city = result.governorate;
        } else if (result.city && (result.city.toLowerCase() === 'cairo' || result.city.toLowerCase() === 'giza')) {
            city = result.city;
        }

        let area = '';
        if (result.city && result.city.toLowerCase() !== 'cairo' && result.city.toLowerCase() !== 'giza') {
            area = result.city;
        } else if (result.area) {
            area = result.area;
        }

        if (city) formikRef.current?.setFieldValue('city', city);
        if (area) formikRef.current?.setFieldValue('area', area);
    }, []);

    const { status: locStatus, error: locError, detect } = useLocationDetect(handleLocationSuccess);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('Auth.register')}</h1>
                <p className={styles.subtitle}>{t('Auth.registerSubtitle')}</p>
            </div>

            {/* Social Logins */}
            <div className={styles.socialWrapper}>
                <button className={styles.socialButton}>
                    <svg viewBox="0 0 24 24" className={styles.socialIcon}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className={styles.socialText}>{t('Auth.google')}</span>
                </button>
                <button className={styles.socialButton}>
                    <svg viewBox="0 0 24 24" className={styles.socialIconApple}>
                        <path d="M17.05 20.28c-.96.95-2.04 1.9-3.4 1.9-1.31 0-1.72-.82-3.26-.82-1.54 0-2.02.8-3.26.82-1.31.02-2.41-.98-3.37-1.9-1.98-1.91-3.41-5.38-3.41-8.5 0-4.94 3.11-7.56 6.07-7.56 1.48 0 2.76.92 3.7.92.93 0 2.45-1.07 4.13-1.07 1.48 0 2.89.73 3.79 1.91-3.15 1.5-2.65 6.09.52 7.42-1.02 2.37-2.3 4.95-4.77 7.82zm-3.08-16.14c.73-1.12 1.23-2.68 1.23-4.14 0-.21-.02-.42-.06-.62-1.41.06-3.1 1.01-4.04 2.14-.85.99-1.56 2.58-1.56 4.01 0 .23.03.46.06.63 1.54-.03 3.01-.9 3.86-1.57z" />
                    </svg>
                    <span className={styles.socialText}>{t('Auth.apple')}</span>
                </button>
            </div>

            <div className={styles.dividerWrapper}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>{t('Auth.orWithEmail')}</span>
                <div className={styles.dividerLine} />
            </div>

            <Formik<RegisterFormValues>
                innerRef={formikRef}
                initialValues={{ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', city: '', area: '' }}
                validationSchema={registerSchema}
                onSubmit={async (values) => {
                    try {
                        const { firstName, lastName, city, area, ...rest } = values;
                        const fullName = `${firstName.trim()} ${lastName.trim()}`;
                        await register({
                            fullName,
                            ...rest,
                            city: city.trim(),
                            area: area.trim(),
                        });
                        toast.success(t('Auth.otpSent'));
                        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}`);
                    } catch (error: any) {
                        toastApiError(error, t('Validation.error'));
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className={styles.form}>
                        {/* Name Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* First Name */}
                            <div className={styles.fieldWrapper}>
                                <label className={styles.label}>
                                    {t('Validation.firstName')}
                                </label>
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputIcon}>
                                        <Person24Regular className={styles.inputIconSize} />
                                    </div>
                                    <Field
                                        name="firstName"
                                        className={styles.input}
                                        placeholder={t('Validation.firstName')}
                                    />
                                </div>
                                <ErrorMessage name="firstName" component="div" className={styles.error} />
                            </div>

                            {/* Last Name */}
                            <div className={styles.fieldWrapper}>
                                <label className={styles.label}>
                                    {t('Validation.lastName')}
                                </label>
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputIcon}>
                                        <Person24Regular className={styles.inputIconSize} />
                                    </div>
                                    <Field
                                        name="lastName"
                                        className={styles.input}
                                        placeholder={t('Validation.lastName')}
                                    />
                                </div>
                                <ErrorMessage name="lastName" component="div" className={styles.error} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.emailAddress')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <Mail24Regular className={styles.inputIconSize} />
                                </div>
                                <Field
                                    name="email"
                                    type="email"
                                    className={styles.input}
                                    placeholder={t('Auth.emailPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="email" component="div" className={styles.error} />
                        </div>

                        {/* Phone */}
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.phone')}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <Phone24Regular className={styles.inputIconSize} />
                                </div>
                                <Field
                                    name="phone"
                                    className={styles.input}
                                    placeholder={t('Auth.phonePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="phone" component="div" className={styles.error} />
                        </div>

                        {/* Location: detect + city/area */}
                        <div className={styles.locationSection}>
                            <div className={styles.locationHeader}>
                                <span className={styles.locationHeaderLabel}>{tLoc('address')}</span>
                                <LocationDetectButton
                                    status={locStatus}
                                    error={locError}
                                    onClick={detect}
                                    className="w-auto flex-shrink-0"
                                />
                            </div>
                            <div className={styles.locationGrid}>
                                <div className={styles.fieldWrapper}>
                                    <label className={styles.label}>{tLoc('city')}</label>
                                    <Field
                                        name="city"
                                        className={styles.inputPlain}
                                        placeholder={tLoc('cityPlaceholder')}
                                    />
                                </div>
                                <div className={styles.fieldWrapper}>
                                    <label className={styles.label}>{tLoc('area')}</label>
                                    <Field
                                        name="area"
                                        className={styles.inputPlain}
                                        placeholder={tLoc('areaPlaceholder')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.password')}
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
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff24Regular className={styles.inputIconSize} /> : <Eye24Regular className={styles.inputIconSize} />}
                                </button>
                            </div>
                            <p className={styles.passwordHint}>{t('Auth.passwordHint')}</p>
                            <ErrorMessage name="password" component="div" className={styles.error} />
                        </div>

                        {/* Confirm Password */}
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
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? <EyeOff24Regular className={styles.inputIconSize} /> : <Eye24Regular className={styles.inputIconSize} />}
                                </button>
                            </div>
                            <ErrorMessage name="confirmPassword" component="div" className={styles.error} />
                        </div>

                        <div className={styles.submitWrapper}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={styles.submitButton}
                            >
                                {isSubmitting ? (
                                    <SpinnerIos20Regular className="animate-spin" />
                                ) : (
                                    <>
                                        <span>{t('Auth.createAccount')}</span>
                                        <ArrowRight24Regular className={styles.submitIcon} />
                                    </>
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

            <div className={styles.footer}>
                <span className={styles.footerDim}>{t('Auth.alreadyHaveAccount')} </span>
                <Link href="/login" className={styles.footerLink}>
                    {t('Auth.signIn')}
                </Link>
            </div>
        </div>
    );
}
