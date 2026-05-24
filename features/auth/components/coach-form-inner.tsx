'use client';

import { Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { useRef, useCallback } from 'react';
import { 
    SpinnerIos20Regular, 
    ArrowRight24Regular, 
    ArrowUpload24Regular, 
    Dismiss20Regular 
} from '@fluentui/react-icons';
import { CustomMultiSelect } from '@/components/shared/custom-multi-select';
import { SPECIALIZATIONS } from '@/constants/specializations';
import { LocationDetectButton } from '@/components/ui/location-detect-button';
import { useLocationDetect, LocationResult } from '@/hooks/use-location-detect';
import { CoachFormInnerProps } from '../types';

const styles = {
    form: "space-y-6",
    gridWrapper: "grid grid-cols-1 md:grid-cols-2 gap-4",
    fieldWrapper: "space-y-2",
    fieldWrapperRelative: "space-y-2 relative",
    label: "text-[11px] font-bold text-foreground/50 px-1",
    input: "w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
    textarea: "w-full px-4 py-3 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm resize-none",
    error: "text-red-500 text-[10px] mt-1 px-1",
    uploadContainer: "relative w-full py-8 px-4 bg-[#0D121F] border-2 border-dashed border-foreground/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group",
    uploadIconSize: "text-foreground/20 group-hover:text-primary transition-colors h-8 w-8",
    uploadTitle: "text-sm font-bold text-primary",
    uploadSubtitle: "text-[10px] text-foreground/30 font-medium mt-1 uppercase",
    submitWrapper: "flex justify-center pt-2",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-lg shadow-primary/20 enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-base uppercase",
    submitIcon: "group-hover:translate-x-1 transition-transform rtl:rotate-180"
};

export function CoachFormInner({ isSubmitting, values, setFieldValue, isValid, dirty }: CoachFormInnerProps) {
    const t = useTranslations();
    const tLoc = useTranslations('Location');
    const certificationsRef = useRef<HTMLInputElement>(null);

    const handleLocationSuccess = useCallback((result: LocationResult) => {
        if (result.governorate) setFieldValue('governorate', result.governorate);
        if (result.city) setFieldValue('city', result.city);
        if (result.area) setFieldValue('area', result.area);
    }, [setFieldValue]);

    const { status: locStatus, error: locError, detect } = useLocationDetect(handleLocationSuccess);

    return (
        <Form className={styles.form}>
            <div className={styles.gridWrapper}>
                {/* Full Name */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.legalFullName')}
                    </label>
                    <Field
                        name="name"
                        className={styles.input}
                        placeholder="John Doe"
                    />
                    <ErrorMessage name="name" component="div" className={styles.error} />
                </div>

                {/* Experience */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.yearsOfExperience')}
                    </label>
                    <Field
                        name="experience"
                        type="number"
                        className={styles.input}
                        placeholder={t('Auth.experiencePlaceholder')}
                    />
                    <ErrorMessage name="experience" component="div" className={styles.error} />
                </div>
            </div>

            <div className={styles.fieldWrapperRelative}>
                <label className={styles.label}>
                    {t('Auth.primarySpecialization')}
                </label>
                <CustomMultiSelect
                    value={values.specialization}
                    onChange={(vals) => setFieldValue('specialization', vals)}
                    options={SPECIALIZATIONS.map(spec => ({
                        label: t(spec.label as any) || spec.fallback,
                        value: spec.value
                    }))}
                    placeholder={t('Auth.primarySpecialization')}
                />
                <ErrorMessage name="specialization" component="div" className={styles.error} />
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
                            name="governorate"
                            value={values.governorate ?? ''}
                            onChange={(e) => setFieldValue('governorate', e.target.value)}
                            className={styles.input}
                            placeholder={tLoc('governoratePlaceholder')}
                        />
                    </div>
                    {/* City */}
                    <div className={styles.fieldWrapper}>
                        <label className={styles.label}>{tLoc('city')}</label>
                        <input
                            type="text"
                            name="city"
                            value={values.city ?? ''}
                            onChange={(e) => setFieldValue('city', e.target.value)}
                            className={styles.input}
                            placeholder={tLoc('cityPlaceholder')}
                        />
                    </div>
                    {/* Area */}
                    <div className={styles.fieldWrapper}>
                        <label className={styles.label}>{tLoc('area')}</label>
                        <input
                            type="text"
                            name="area"
                            value={values.area ?? ''}
                            onChange={(e) => setFieldValue('area', e.target.value)}
                            className={styles.input}
                            placeholder={tLoc('areaPlaceholder')}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.gridWrapper}>
                {/* Email */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.email')}
                    </label>
                    <Field
                        name="email"
                        type="email"
                        className={styles.input}
                        placeholder={t('Auth.emailPlaceholder')}
                    />
                    <ErrorMessage name="email" component="div" className={styles.error} />
                </div>

                {/* Phone */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.phone')}
                    </label>
                    <Field
                        name="phone"
                        className={styles.input}
                        placeholder={t('Auth.phonePlaceholder')}
                    />
                    <ErrorMessage name="phone" component="div" className={styles.error} />
                </div>
            </div>

            {/* Certifications (Upload) */}
            <div className={styles.fieldWrapper}>
                <label className={styles.label}>
                    {t('Auth.certificateUpload')}
                </label>
                <div
                    onClick={() => certificationsRef.current?.click()}
                    className={styles.uploadContainer}
                >
                    <input
                        ref={certificationsRef}
                        type="file"
                        name="certifications"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                            const newFiles = Array.from(e.currentTarget.files || []);
                            setFieldValue('certifications', [...values.certifications, ...newFiles]);
                        }}
                    />
                    <ArrowUpload24Regular className={styles.uploadIconSize} />
                    <div className="text-center">
                        <p className={styles.uploadTitle}>{t('Auth.dragAndDrop')}</p>
                        <p className={styles.uploadSubtitle}>{t('Auth.uploadHint')}</p>
                    </div>
                </div>

                {/* Files List */}
                {values.certifications.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {values.certifications.map((file: File, index: number) => (
                            <div
                                key={index}
                                className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-lg group/file"
                            >
                                {file.type.startsWith('image/') && (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        className="w-20 h-20 object-contain rounded-md mb-1 bg-black/20"
                                        alt={file.name}
                                    />
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-foreground/60 truncate max-w-[100px]">
                                        {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedFiles = values.certifications.filter((_: File, i: number) => i !== index);
                                            setFieldValue('certifications', updatedFiles);
                                        }}
                                        className="text-foreground/20 hover:text-red-400 transition-colors"
                                    >
                                        <Dismiss20Regular className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <ErrorMessage name="certifications" component="div" className={styles.error} />
            </div>

            {/* Statement of Purpose */}
            <div className={styles.fieldWrapper}>
                <label className={styles.label}>
                    {t('Auth.statementOfPurpose')}
                </label>
                <Field
                    as="textarea"
                    name="desc"
                    rows={4}
                    className={styles.textarea}
                    placeholder={t('Auth.statementPlaceholder')}
                />
                <ErrorMessage name="desc" component="div" className={styles.error} />
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
                            {t('Auth.submitApplication')}
                            <ArrowRight24Regular className={styles.submitIcon} />
                        </>
                    )}
                </button>
            </div>
        </Form>
    );
}
