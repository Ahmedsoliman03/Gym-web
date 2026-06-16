'use client';

import { ErrorMessage, Field, Form, Formik, FormikProps } from 'formik';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    ArrowRight24Regular,
    Mail24Regular,
    Person24Regular,
    Phone24Regular,
    SpinnerIos20Regular,
} from '@fluentui/react-icons';
import { useRouter } from '@/i18n/routing';
import { LocationDetectButton } from '@/components/ui/location-detect-button';
import { LiveValidate } from '@/components/shared/live-validate';
import { useLocationDetect, type LocationResult } from '@/hooks/use-location-detect';
import { toastApiError } from '@/utils/toast-api-error';
import { useGoogleSignupCompleteMutation } from '../services/auth.service';
import { getGoogleSignupCompleteSchema } from '../validations';
import {
    clearGoogleSignupProfile,
    readGoogleSignupProfile,
} from './google-auth-button';
import { normalizeAuthNextPath } from '../utils/next-path';

interface GoogleSignupValues {
    fullName: string;
    phone: string;
    city: string;
    area: string;
}

const styles = {
    container: 'space-y-5 max-w-[420px] mx-auto',
    header: 'space-y-1 text-center',
    title: 'text-3xl font-black text-white',
    subtitle: 'text-foreground/60 text-[13px] leading-relaxed',
    emailPill:
        'mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-foreground/60',
    form: 'space-y-3',
    fieldWrapper: 'space-y-0.5',
    label: 'text-xs font-bold text-foreground/80 px-1',
    inputWrapper: 'relative group',
    inputIcon:
        'absolute inset-y-0 left-0 pl-4 flex items-center text-foreground/30 group-focus-within:text-primary transition-colors',
    inputIconSize: 'w-5 h-5',
    input: 'w-full pl-11 pr-4 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm',
    inputPlain:
        'w-full px-4 py-2.5 bg-[#111827] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-white text-sm',
    locationSection: 'space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-3',
    locationHeader: 'flex items-center justify-between gap-2 flex-wrap',
    locationHeaderLabel: 'text-[10px] font-black text-foreground/40 uppercase tracking-wider px-1',
    locationGrid: 'grid grid-cols-2 gap-3',
    error: 'text-red-500 text-[10px] mt-0.5 px-1',
    submitWrapper: 'pt-2',
    submitButton:
        'w-full py-3.5 bg-primary text-black rounded-xl font-semibold shadow-[0_8px_30px_rgb(34,197,94,0.3)] enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-lg',
    submitIcon:
        'w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block',
};

export default function GoogleSignupCompleteForm() {
    const t = useTranslations();
    const tLoc = useTranslations('Location');
    const router = useRouter();
    const searchParams = useSearchParams();
    const completeMutation = useGoogleSignupCompleteMutation();
    const formikRef = useRef<FormikProps<GoogleSignupValues>>(null);
    const [profile] = useState(() => readGoogleSignupProfile());
    const schema = getGoogleSignupCompleteSchema(t);

    const safeNext = normalizeAuthNextPath(searchParams.get('next'));

    useEffect(() => {
        if (!profile) router.replace('/login' as never);
    }, [profile, router]);

    const handleLocationSuccess = useCallback((result: LocationResult) => {
        const city =
            result.governorate ||
            (result.city && ['cairo', 'giza'].includes(result.city.toLowerCase())
                ? result.city
                : '');
        const area =
            result.city && !['cairo', 'giza'].includes(result.city.toLowerCase())
                ? result.city
                : result.area || '';

        if (city) formikRef.current?.setFieldValue('city', city);
        if (area) formikRef.current?.setFieldValue('area', area);
    }, []);

    const { status: locStatus, error: locError, detect } = useLocationDetect(handleLocationSuccess);

    if (!profile) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('Auth.completeGoogleTitle')}</h1>
                <p className={styles.subtitle}>{t('Auth.completeGoogleSubtitle')}</p>
                <div className={styles.emailPill}>
                    <Mail24Regular />
                    {profile.email}
                </div>
            </div>

            <Formik<GoogleSignupValues>
                innerRef={formikRef}
                enableReinitialize
                initialValues={{
                    fullName: profile.fullName ?? '',
                    phone: '',
                    city: '',
                    area: '',
                }}
                validationSchema={schema}
                onSubmit={async (values) => {
                    try {
                        await completeMutation.mutateAsync({
                            fullName: values.fullName.trim(),
                            phone: values.phone.trim(),
                            city: values.city.trim(),
                            area: values.area.trim(),
                        });
                        clearGoogleSignupProfile();
                        toast.success(t('Auth.googleSignupComplete'));
                        router.push(safeNext as never);
                    } catch (error) {
                        toastApiError(error, t('Auth.googleFailed'));
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className={styles.form}>
                        <LiveValidate />
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>{t('Auth.fullName')}</label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.inputIcon}>
                                    <Person24Regular className={styles.inputIconSize} />
                                </div>
                                <Field
                                    name="fullName"
                                    className={styles.input}
                                    placeholder={t('Auth.fullNamePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="fullName" component="div" className={styles.error} />
                        </div>

                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>{t('Auth.phone')}</label>
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
                                    <ErrorMessage name="city" component="div" className={styles.error} />
                                </div>
                                <div className={styles.fieldWrapper}>
                                    <label className={styles.label}>{tLoc('area')}</label>
                                    <Field
                                        name="area"
                                        className={styles.inputPlain}
                                        placeholder={tLoc('areaPlaceholder')}
                                    />
                                    <ErrorMessage name="area" component="div" className={styles.error} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.submitWrapper}>
                            <button
                                type="submit"
                                disabled={isSubmitting || completeMutation.isPending}
                                className={styles.submitButton}
                            >
                                {isSubmitting || completeMutation.isPending ? (
                                    <SpinnerIos20Regular className="animate-spin" />
                                ) : (
                                    <>
                                        <span>{t('Auth.completeGoogleSignup')}</span>
                                        <ArrowRight24Regular className={styles.submitIcon} />
                                    </>
                                )}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
