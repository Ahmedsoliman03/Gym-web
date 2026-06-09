'use client';

import { Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { useRef, useCallback } from 'react';
import { 
    SpinnerIos20Regular, 
    ArrowRight24Regular, 
    ArrowUpload24Regular, 
    Image24Regular 
} from '@fluentui/react-icons';
import { LocationDetectButton } from '@/components/ui/location-detect-button';
import { useLocationDetect, LocationResult } from '@/hooks/use-location-detect';
import { GymFormInnerProps } from '../types';

const styles = {
    form: "space-y-6",
    gridWrapper: "grid grid-cols-1 md:grid-cols-2 gap-4",
    fieldWrapper: "space-y-2",
    label: "text-[11px] font-bold text-foreground/50 px-1 uppercase",
    input: "w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
    error: "text-red-500 text-[10px] mt-1 px-1",
    uploadContainer: "relative w-full py-6 px-4 bg-[#0D121F] border-2 border-dashed border-foreground/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group min-h-[100px]",
    uploadIcon: "text-foreground/20 group-hover:text-primary transition-colors h-8 w-8",
    uploadText: "text-xs font-medium text-foreground/40 text-center",
    submitWrapper: "flex justify-center pt-2",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-lg shadow-primary/20 enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-base uppercase",
    submitIcon: "group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block"
};

export function GymFormInner({ isSubmitting, values, setFieldValue }: GymFormInnerProps) {
    const t = useTranslations();
    const tLoc = useTranslations('Location');
    const gymLicenseRef = useRef<HTMLInputElement>(null);
    const gymPhotoRef = useRef<HTMLInputElement>(null);

    const handleLocationSuccess = useCallback((result: LocationResult) => {
        if (result.governorate) setFieldValue('governorate', result.governorate);
        if (result.city) setFieldValue('city', result.city);
        if (result.area) setFieldValue('area', result.area);
        const streetParts = [result.building, result.road].filter(Boolean);
        if (streetParts.length > 0) setFieldValue('gymAddress', streetParts.join(' '));
    }, [setFieldValue]);

    const { status: locStatus, error: locError, detect } = useLocationDetect(handleLocationSuccess);

    return (
        <Form className={styles.form}>
            <div className={styles.gridWrapper}>
                {/* Gym Name */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>{t('Auth.gymName')}</label>
                    <Field name="gymName" className={styles.input} placeholder={t('Auth.gymNamePlaceholder')} />
                    <ErrorMessage name="gymName" component="div" className={styles.error} />
                </div>

                {/* Contact Person */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>{t('Auth.contactPerson')}</label>
                    <Field name="contactPerson" className={styles.input} placeholder={t('Auth.contactPersonPlaceholder')} />
                    <ErrorMessage name="contactPerson" component="div" className={styles.error} />
                </div>

                {/* Member Count — digits only via inputMode + type=number. */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>{t('Auth.memberCount')}</label>
                    <Field
                        name="memberCount"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={styles.input}
                        placeholder={t('Auth.memberCountPlaceholder')}
                    />
                    <ErrorMessage name="memberCount" component="div" className={styles.error} />
                </div>

                {/* Phone */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>{t('Auth.phone')}</label>
                    <Field name="phone" className={styles.input} placeholder={t('Auth.phonePlaceholder')} />
                    <ErrorMessage name="phone" component="div" className={styles.error} />
                </div>

                {/* Email */}
                <div className={`${styles.fieldWrapper} md:col-span-2`}>
                    <label className={styles.label}>{t('Auth.email')}</label>
                    <Field name="email" type="email" className={styles.input} placeholder={t('Auth.emailPlaceholder')} />
                    <ErrorMessage name="email" component="div" className={styles.error} />
                </div>

                {/* Optional invitation promocode — sent on the request body when filled. */}
                <div className={`${styles.fieldWrapper} md:col-span-2`}>
                    <label className={styles.label}>
                        {t('Auth.invitationPromocode')} ({t('Auth.optional')})
                    </label>
                    <Field
                        name="invitationPromocode"
                        type="text"
                        className={styles.input}
                        placeholder={t('Auth.invitationPromocodePlaceholder')}
                    />
                    <ErrorMessage name="invitationPromocode" component="div" className={styles.error} />
                </div>
            </div>

            {/* ── Location Section ── */}
            <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider">
                        {tLoc('address')}
                    </p>
                    <LocationDetectButton
                        status={locStatus}
                        error={locError}
                        onClick={detect}
                        className="w-auto flex-shrink-0"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Governorate */}
                    <div className={styles.fieldWrapper}>
                        <label className={styles.label}>{tLoc('governorate')}</label>
                        <input
                            type="text"
                            value={values.governorate ?? ''}
                            onChange={(e) => setFieldValue('governorate', e.target.value)}
                            className={styles.input}
                            placeholder={tLoc('governoratePlaceholder')}
                        />
                        <ErrorMessage name="governorate" component="div" className={styles.error} />
                    </div>

                    {/* City */}
                    <div className={styles.fieldWrapper}>
                        <label className={styles.label}>{tLoc('city')}</label>
                        <input
                            type="text"
                            value={values.city ?? ''}
                            onChange={(e) => setFieldValue('city', e.target.value)}
                            className={styles.input}
                            placeholder={tLoc('cityPlaceholder')}
                        />
                        <ErrorMessage name="city" component="div" className={styles.error} />
                    </div>

                    {/* Area */}
                    <div className={styles.fieldWrapper}>
                        <label className={styles.label}>{tLoc('area')}</label>
                        <input
                            type="text"
                            value={values.area ?? ''}
                            onChange={(e) => setFieldValue('area', e.target.value)}
                            className={styles.input}
                            placeholder={tLoc('areaPlaceholder')}
                        />
                        <ErrorMessage name="area" component="div" className={styles.error} />
                    </div>
                </div>

                {/* Detailed Address */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>{t('Auth.gymAddress')}</label>
                    <Field name="gymAddress" className={styles.input} placeholder={t('Auth.gymAddressPlaceholder')} />
                    <ErrorMessage name="gymAddress" component="div" className={styles.error} />
                </div>
            </div>

            <div className={styles.gridWrapper}>
                {/* Gym License */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>{t('Auth.gymLicense')}</label>
                    <div onClick={() => gymLicenseRef.current?.click()} className={styles.uploadContainer}>
                        <input
                            ref={gymLicenseRef}
                            type="file"
                            name="gymLicense"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => setFieldValue('gymLicense', e.currentTarget.files?.[0])}
                        />
                        {values.gymLicense && values.gymLicense instanceof File ? (
                            <img 
                                src={URL.createObjectURL(values.gymLicense)} 
                                alt="License Preview" 
                                className="w-full h-40 object-contain rounded-lg bg-black/20"
                            />
                        ) : (
                            <>
                                <ArrowUpload24Regular className={styles.uploadIcon} />
                                <span className={styles.uploadText}>{t('Auth.gymLicense')}</span>
                            </>
                        )}
                    </div>
                    <ErrorMessage name="gymLicense" component="div" className={styles.error} />
                </div>

                {/* Gym Photo */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>{t('Auth.gymPhoto')}</label>
                    <div onClick={() => gymPhotoRef.current?.click()} className={styles.uploadContainer}>
                        <input
                            ref={gymPhotoRef}
                            type="file"
                            name="gymPhoto"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => setFieldValue('gymPhoto', e.currentTarget.files?.[0])}
                        />
                        {values.gymPhoto && values.gymPhoto instanceof File ? (
                            <img 
                                src={URL.createObjectURL(values.gymPhoto)} 
                                alt="Gym Preview" 
                                className="w-full h-40 object-contain rounded-lg bg-black/20"
                            />
                        ) : (
                            <>
                                <Image24Regular className={styles.uploadIcon} />
                                <span className={styles.uploadText}>{t('Auth.gymPhoto')}</span>
                            </>
                        )}
                    </div>
                    <ErrorMessage name="gymPhoto" component="div" className={styles.error} />
                </div>
            </div>

            <div className={styles.submitWrapper}>
                <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                    {isSubmitting ? (
                        <SpinnerIos20Regular className="animate-spin" />
                    ) : (
                        <>
                            <span>{t('Auth.submitApplication')}</span>
                            <ArrowRight24Regular className={styles.submitIcon} />
                        </>
                    )}
                </button>
            </div>
        </Form>
    );
}
