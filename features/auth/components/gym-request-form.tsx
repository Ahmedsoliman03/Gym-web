'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useRequestAccessMutation } from '../services/auth.service';
import { ArrowUpload24Regular, Image24Regular, SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
import { useRef } from 'react';
import { CustomSelect } from '@/components/ui/custom-select';
import { CITIES_DATA } from '@/constants/locations';

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
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-base uppercase",
    submitIcon: "group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180 inline-block"
};

interface GymRequestFormProps {
    onSuccess: () => void;
}

export default function GymRequestForm({ onSuccess }: GymRequestFormProps) {
    const t = useTranslations();
    const request = useRequestAccessMutation();
    const gymLicenseRef = useRef<HTMLInputElement>(null);
    const facilityPhotosRef = useRef<HTMLInputElement>(null);

    const validationSchema = getRequestAccessSchema(t);

    return (
        <Formik
            initialValues={{
                type: 'gym',
                email: '',
                phone: '',
                gymName: '',
                gymAddress: '',
                city: '',
                area: '',
                contactPerson: '',
                gymLicense: null,
                facilityPhotos: null
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                await request.mutateAsync(values);
                onSuccess();
            }}
        >
            {({ isSubmitting, values, setFieldValue }) => (
                <Form className={styles.form}>
                    <div className={styles.gridWrapper}>
                        {/* Gym Name */}
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.gymName')}
                            </label>
                            <Field
                                name="gymName"
                                className={styles.input}
                                placeholder={t('Auth.gymNamePlaceholder')}
                            />
                            <ErrorMessage name="gymName" component="div" className={styles.error} />
                        </div>

                        {/* Contact Person */}
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.contactPerson')}
                            </label>
                            <Field
                                name="contactPerson"
                                className={styles.input}
                                placeholder={t('Auth.contactPersonPlaceholder')}
                            />
                            <ErrorMessage name="contactPerson" component="div" className={styles.error} />
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

                        {/* City Select */}
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.selectCity')}
                            </label>
                            <CustomSelect
                                value={values.city}
                                onChange={(val: string) => {
                                    setFieldValue('city', val);
                                    setFieldValue('area', '');
                                }}
                                options={[
                                    { label: t('Auth.cairo'), value: 'cairo' },
                                    { label: t('Auth.giza'), value: 'giza' }
                                ]}
                                placeholder={t('Auth.selectCity')}
                            />
                            <ErrorMessage name="city" component="div" className={styles.error} />
                        </div>

                        {/* Area Select */}
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.selectArea')}
                            </label>
                            <CustomSelect
                                value={values.area}
                                onChange={(val: string) => setFieldValue('area', val)}
                                options={values.city ? CITIES_DATA[values.city].map(area => ({
                                    label: t(`Auth.${area}`),
                                    value: area
                                })) : []}
                                placeholder={t('Auth.selectArea')}
                                disabled={!values.city}
                            />
                            <ErrorMessage name="area" component="div" className={styles.error} />
                        </div>


                        {/* Gym Address */}
                        <div className={`${styles.fieldWrapper} md:col-span-2`}>
                            <label className={styles.label}>
                                {t('Auth.gymAddress')}
                            </label>
                            <Field
                                name="gymAddress"
                                className={styles.input}
                                placeholder={t('Auth.gymAddressPlaceholder')}
                            />
                            <ErrorMessage name="gymAddress" component="div" className={styles.error} />
                        </div>
                    </div>

                    <div className={styles.gridWrapper}>
                        {/* Gym License */}
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.gymLicense')}
                            </label>
                            <div
                                onClick={() => gymLicenseRef.current?.click()}
                                className={styles.uploadContainer}
                            >
                                <input
                                    ref={gymLicenseRef}
                                    type="file"
                                    name="gymLicense"
                                    className="hidden"
                                    onChange={(e) => setFieldValue('gymLicense', e.currentTarget.files?.[0])}
                                />
                                <ArrowUpload24Regular className={styles.uploadIcon} />
                                <span className={styles.uploadText}>{values.gymLicense ? (values.gymLicense as File).name : t('Auth.gymLicense')}</span>
                            </div>
                            <ErrorMessage name="gymLicense" component="div" className={styles.error} />
                        </div>

                        {/* Facility Photos */}
                        <div className={styles.fieldWrapper}>
                            <label className={styles.label}>
                                {t('Auth.facilityPhotos')}
                            </label>
                            <div
                                onClick={() => facilityPhotosRef.current?.click()}
                                className={styles.uploadContainer}
                            >
                                <input
                                    ref={facilityPhotosRef}
                                    type="file"
                                    name="facilityPhotos"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => setFieldValue('facilityPhotos', e.currentTarget.files)}
                                />
                                <Image24Regular className={styles.uploadIcon} />
                                <span className={styles.uploadText}>{values.facilityPhotos ? t('Auth.photosSelected', { count: (values.facilityPhotos as FileList).length }) : t('Auth.facilityPhotos')}</span>
                            </div>
                        </div>
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
                                    <span>{t('Auth.submitApplication')}</span>
                                    <ArrowRight24Regular className={styles.submitIcon} />
                                </>
                            )}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
