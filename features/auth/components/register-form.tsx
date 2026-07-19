'use client';

import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import { useTranslations } from 'next-intl';
import { getRegisterSchema } from '../validations';
import { useAuthUser } from '../hooks/useAuthUser';
import {
    RegisterFormValues,
    OTP_TIMER_SECONDS,
    OTP_TIMER_KEY,
    OTP_CHANNEL_KEY,
    OTP_SWITCH_COOLDOWN_KEY,
    OTP_EMAIL_KEY,
    DEFAULT_OTP_CHANNEL,
} from '../types';
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
import { LiveValidate } from '@/components/shared/live-validate';
import { FormPersist, clearFormDraft } from '@/components/shared/form-persist';
import { GoogleAuthButton } from './google-auth-button';

const styles = {
    container: "space-y-4 max-w-[420px] mx-auto",
    header: "space-y-0.5 text-center",
    title: "text-4xl font-black text-white",
    subtitle: "text-foreground/50 text-[13px] leading-relaxed",
    socialWrapper: "flex gap-3",
    socialButton: "flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#111827] border border-white/10 rounded-xl hover:bg-white/5 transition-all group cursor-pointer",
    socialIcon: "w-5 h-5",
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
                <GoogleAuthButton
                    className={styles.socialButton}
                    label={t('Auth.continueWithGoogle')}
                />
              
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
                        const payload = {
                            fullName,
                            ...rest,
                            city: city.trim(),
                            area: area.trim(),
                            // Registration always delivers the first code via WhatsApp.
                            verification_method: DEFAULT_OTP_CHANNEL,
                        };
                        await register(payload);
                        // Open a fresh 5-minute OTP window; the verify-otp page
                        // reads this timestamp so its countdown is accurate and
                        // survives reloads / locale switches.
                        localStorage.setItem(
                            OTP_TIMER_KEY,
                            String(Date.now() + OTP_TIMER_SECONDS * 1000),
                        );
                        // Reset the persisted channel to WhatsApp and drop any
                        // stale switch cooldown so the verify-otp screen shows the
                        // WhatsApp text/button for this fresh registration.
                        localStorage.setItem(OTP_CHANNEL_KEY, DEFAULT_OTP_CHANNEL);
                        localStorage.removeItem(OTP_SWITCH_COOLDOWN_KEY);
                       
                        localStorage.setItem(OTP_EMAIL_KEY, values.email);
                        clearFormDraft('draft:register');
                        toast.success(t('Auth.otpSent'));
                        router.push('/verify-otp');
                    } catch (error) {
                        toastApiError(error, t('Validation.error'));
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className={styles.form}>
                        <LiveValidate />
                        <FormPersist
                            storageKey="draft:register"
                            exclude={['password', 'confirmPassword']}
                        />
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
                                    aria-label={showPassword ? t('Auth.hidePassword') : t('Auth.showPassword')}
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
                                    aria-label={showConfirmPassword ? t('Auth.hidePassword') : t('Auth.showPassword')}
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
