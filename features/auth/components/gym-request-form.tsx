'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useRequestAccessMutation } from '../services/auth.service';
import { ArrowUpload24Regular, Image24Regular, SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
import { useRef } from 'react';

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
                contactPerson: '',
                position: '',
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
                <Form className="space-y-6 animate-premium-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gym Name */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1 uppercase tracking-wider">
                                {t('Auth.gymName')}
                            </label>
                            <Field
                                name="gymName"
                                className="w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium"
                                placeholder={t('Auth.gymNamePlaceholder')}
                            />
                            <ErrorMessage name="gymName" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1 uppercase tracking-wider">
                                {t('Auth.phone')}
                            </label>
                            <Field
                                name="phone"
                                className="w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium"
                                placeholder={t('Auth.phonePlaceholder')}
                            />
                            <ErrorMessage name="phone" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1 uppercase tracking-wider">
                                {t('Auth.email')}
                            </label>
                            <Field
                                name="email"
                                type="email"
                                className="w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium"
                                placeholder={t('Auth.emailPlaceholder')}
                            />
                            <ErrorMessage name="email" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Gym Address */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1 uppercase tracking-wider">
                                {t('Auth.gymAddress')}
                            </label>
                            <Field
                                name="gymAddress"
                                className="w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium"
                                placeholder={t('Auth.gymAddressPlaceholder')}
                            />
                            <ErrorMessage name="gymAddress" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Contact Person */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1 uppercase tracking-wider">
                                {t('Auth.contactPerson')}
                            </label>
                            <Field
                                name="contactPerson"
                                className="w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium"
                                placeholder={t('Auth.contactPersonPlaceholder')}
                            />
                            <ErrorMessage name="contactPerson" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Position */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1 uppercase tracking-wider">
                                {t('Auth.position')}
                            </label>
                            <Field
                                name="position"
                                className="w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium"
                                placeholder={t('Auth.positionPlaceholder')}
                            />
                            <ErrorMessage name="position" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gym License */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1 uppercase tracking-wider">
                                {t('Auth.gymLicense')}
                            </label>
                            <div
                                onClick={() => gymLicenseRef.current?.click()}
                                className="relative w-full py-6 px-4 bg-[#0D121F] border-2 border-dashed border-foreground/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group min-h-[100px]"
                            >
                                <input
                                    ref={gymLicenseRef}
                                    type="file"
                                    name="gymLicense"
                                    className="hidden"
                                    onChange={(e) => setFieldValue('gymLicense', e.currentTarget.files?.[0])}
                                />
                                <ArrowUpload24Regular className="text-foreground/20 group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-xs font-medium text-foreground/40 text-center">{values.gymLicense ? (values.gymLicense as File).name : t('Auth.gymLicense')}</span>
                            </div>
                            <ErrorMessage name="gymLicense" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Facility Photos */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1 uppercase tracking-wider">
                                {t('Auth.facilityPhotos')}
                            </label>
                            <div
                                onClick={() => facilityPhotosRef.current?.click()}
                                className="relative w-full py-6 px-4 bg-[#0D121F] border-2 border-dashed border-foreground/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group min-h-[100px]"
                            >
                                <input
                                    ref={facilityPhotosRef}
                                    type="file"
                                    name="facilityPhotos"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => setFieldValue('facilityPhotos', e.currentTarget.files)}
                                />
                                <Image24Regular className="text-foreground/20 group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-xs font-medium text-foreground/40 text-center">{values.facilityPhotos ? t('Auth.photosSelected', { count: (values.facilityPhotos as FileList).length }) : t('Auth.facilityPhotos')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-base uppercase tracking-wider"
                        >
                            {isSubmitting ? (
                                <SpinnerIos20Regular className="animate-spin" />
                            ) : (
                                <>
                                    {t('Auth.submitApplication')}
                                    <ArrowRight24Regular className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                                </>
                            )}
                        </button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
