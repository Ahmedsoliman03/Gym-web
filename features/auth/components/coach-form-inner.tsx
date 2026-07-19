'use client';

import { Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { useRef, useCallback, useState } from 'react';
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
import { useFileDrop } from '@/hooks/use-file-drop';
import { LiveValidate } from '@/components/shared/live-validate';
import { FormPersist } from '@/components/shared/form-persist';
import { CoachFormInnerProps } from '../types';
import { useR2Upload } from '@/hooks/use-r2-upload';
import toast from 'react-hot-toast';

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
    uploadContainerDragging: "border-primary/40 bg-primary/10",
    uploadIconSize: "text-foreground/20 group-hover:text-primary transition-colors h-8 w-8",
    uploadTitle: "text-sm font-bold text-primary",
    uploadSubtitle: "text-[10px] text-foreground/30 font-medium mt-1 uppercase",
    submitWrapper: "flex justify-center pt-2",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-lg shadow-primary/20 enabled:hover:scale-[1.01] enabled:active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-base uppercase",
    submitIcon: "group-hover:translate-x-1 transition-transform rtl:rotate-180"
};

export function CoachFormInner({ isSubmitting, values, setFieldValue }: CoachFormInnerProps) {
    const t = useTranslations();
    const tLoc = useTranslations('Location');
    const certificationsRef = useRef<HTMLInputElement>(null);
    const profileImageRef = useRef<HTMLInputElement>(null);
    const { uploadFile, uploadMultipleFiles } = useR2Upload();
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoProgress, setPhotoProgress] = useState(0);
    const [certsUploading, setCertsUploading] = useState(false);
    const [certsProgress, setCertsProgress] = useState(0);

    const profileImageDrop = useFileDrop({
        accept: 'image/*',
        onFiles: async (files) => {
            setPhotoUploading(true);
            setPhotoProgress(0);
            try {
                const path = await uploadFile(files[0], 'profile_photo', setPhotoProgress);
                setFieldValue('profile_image', path);
            } catch { toast.error('Upload failed'); } finally { setPhotoUploading(false); }
        },
    });
    const certificationsDrop = useFileDrop({
        accept: 'image/*',
        multiple: true,
        onFiles: async (files) => {
            setCertsUploading(true);
            setCertsProgress(0);
            try {
                const paths = await uploadMultipleFiles(files, 'certification', setCertsProgress);
                setFieldValue('certifications', [...values.certifications, ...paths]);
            } catch { toast.error('Upload failed'); } finally { setCertsUploading(false); }
        },
    });

    const handleLocationSuccess = useCallback((result: LocationResult) => {
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

        if (city) setFieldValue('city', city);
        if (area) setFieldValue('area', area);
    }, [setFieldValue]);

    const { status: locStatus, error: locError, detect } = useLocationDetect(handleLocationSuccess);

    return (
        <Form className={styles.form}>
            <LiveValidate />
            <FormPersist storageKey="draft:coach-request" />
            <div className={styles.gridWrapper}>
                {/* First Name */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.firstName')}
                    </label>
                    <Field
                        name="firstName"
                        className={styles.input}
                        placeholder="John"
                    />
                    <ErrorMessage name="firstName" component="div" className={styles.error} />
                </div>

                {/* Last Name */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.lastName')}
                    </label>
                    <Field
                        name="lastName"
                        className={styles.input}
                        placeholder="Doe"
                    />
                    <ErrorMessage name="lastName" component="div" className={styles.error} />
                </div>
            </div>

            <div className={styles.gridWrapper}>
                {/* Experience */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.yearsOfExperience')}
                    </label>
                    <Field
                        name="experience"
                        type="number"
                        min={0}
                        className={styles.input}
                        placeholder={t('Auth.experiencePlaceholder')}
                    />
                    <ErrorMessage name="experience" component="div" className={styles.error} />
                </div>

                {/* Current number of clients — digits only via inputMode + type=number. */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.numberOfClients')}
                    </label>
                    <Field
                        name="numberOfClients"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={styles.input}
                        placeholder={t('Auth.numberOfClientsPlaceholder')}
                    />
                    <ErrorMessage name="numberOfClients" component="div" className={styles.error} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* City (governorate-level, e.g. "Giza") */}
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
                        <ErrorMessage name="city" component="div" className={styles.error} />
                    </div>
                    {/* Area (sub-area, e.g. "6th of October") */}
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
                        <ErrorMessage name="area" component="div" className={styles.error} />
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

            <div className={styles.gridWrapper}>
                {/* Profile Image (Upload) */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Profile.profilePhoto') || 'Profile Photo'}
                    </label>
                    <div
                        onClick={() => profileImageRef.current?.click()}
                        {...profileImageDrop.dropHandlers}
                        className={`${styles.uploadContainer} ${profileImageDrop.isDragging ? styles.uploadContainerDragging : ''}`}
                    >
                        <input
                            ref={profileImageRef}
                            type="file"
                            name="profile_image"
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.currentTarget.files?.[0];
                                if (!file) return;
                                e.currentTarget.value = '';
                                setPhotoUploading(true);
                                setPhotoProgress(0);
                                try {
                                    const path = await uploadFile(file, 'profile_photo', setPhotoProgress);
                                    setFieldValue('profile_image', path);
                                } catch { toast.error('Upload failed'); } finally { setPhotoUploading(false); }
                            }}
                        />
                        <ArrowUpload24Regular className={styles.uploadIconSize} />
                        <div className="text-center">
                            <p className={styles.uploadTitle}>{t('Auth.dragAndDrop')}</p>
                            <p className={styles.uploadSubtitle}>{t('Auth.uploadHint')}</p>
                        </div>
                    </div>

                    {/* Upload spinner or existing photo preview */}
                    {photoUploading ? (
                        <div className="mt-3 flex items-center gap-3 bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-primary rounded-full animate-spin flex-shrink-0" />
                            <span className="text-xs font-bold text-foreground/50">Uploading {photoProgress}%</span>
                        </div>
                    ) : values.profile_image && typeof values.profile_image === 'string' ? (
                        <div className="mt-3">
                            <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl group/file">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <img
                                        src={values.profile_image}
                                        className="w-8 h-8 object-cover rounded-lg bg-black/20 flex-shrink-0"
                                        alt="Profile"
                                    />
                                    <span className="text-xs font-bold text-foreground/80 truncate">
                                        Photo uploaded ✓
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFieldValue('profile_image', null)}
                                    className="text-foreground/30 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                                >
                                    <Dismiss20Regular className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : null}
                    <ErrorMessage name="profile_image" component="div" className={styles.error} />
                </div>

                {/* Certifications (Upload) */}
                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
                        {t('Auth.certificateUpload')}
                    </label>
                    <div
                        onClick={() => certificationsRef.current?.click()}
                        {...certificationsDrop.dropHandlers}
                        className={`${styles.uploadContainer} ${certificationsDrop.isDragging ? styles.uploadContainerDragging : ''}`}
                    >
                        <input
                            ref={certificationsRef}
                            type="file"
                            name="certifications"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={async (e) => {
                                const newFiles = Array.from(e.currentTarget.files || []);
                                if (!newFiles.length) return;
                                e.currentTarget.value = '';
                                setCertsUploading(true);
                                setCertsProgress(0);
                                try {
                                    const paths = await uploadMultipleFiles(newFiles, 'certification', setCertsProgress);
                                    setFieldValue('certifications', [...values.certifications, ...paths]);
                                } catch { toast.error('Upload failed'); } finally { setCertsUploading(false); }
                            }}
                        />
                        <ArrowUpload24Regular className={styles.uploadIconSize} />
                        <div className="text-center">
                            <p className={styles.uploadTitle}>{t('Auth.dragAndDrop')}</p>
                            <p className={styles.uploadSubtitle}>{t('Auth.uploadHint')}</p>
                        </div>
                    </div>

                    {/* Certs uploading spinner */}
                    {certsUploading && (
                        <div className="mt-3 flex items-center gap-3 bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-primary rounded-full animate-spin flex-shrink-0" />
                            <span className="text-xs font-bold text-foreground/50">Uploading {certsProgress}%</span>
                        </div>
                    )}
                    {/* Files List */}
                    {values.certifications.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {values.certifications.map((cert: string | File, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl group/file"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <img
                                            src={typeof cert === 'string' ? cert : URL.createObjectURL(cert)}
                                            className="w-8 h-8 object-cover rounded-lg bg-black/20 flex-shrink-0"
                                            alt={`cert-${index}`}
                                        />
                                        <span className="text-xs font-bold text-foreground/80 truncate">
                                            {typeof cert === 'string' ? `Cert ${index + 1} ✓` : cert.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedFiles = values.certifications.filter((_: any, i: number) => i !== index);
                                            setFieldValue('certifications', updatedFiles);
                                        }}
                                        className="text-foreground/30 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                                    >
                                        <Dismiss20Regular className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <ErrorMessage name="certifications" component="div" className={styles.error} />
                </div>
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
                    disabled={isSubmitting || photoUploading || certsUploading}
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
