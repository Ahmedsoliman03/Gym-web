'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useRequestAccessMutation } from '../services/auth.service';
import { Building24Regular, Mail24Regular, Phone24Regular, Location24Regular, ContactCard24Regular, Briefcase24Regular, ArrowUpload24Regular, Image24Regular, SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
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
                <Form className="space-y-5 animate-premium-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Gym Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.gymName')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <Building24Regular />
                                </div>
                                <Field
                                    name="gymName"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.gymNamePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="gymName" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>


                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.phone')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <Phone24Regular />
                                </div>
                                <Field
                                    name="phone"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.phonePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.email')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <Mail24Regular />
                                </div>
                                <Field
                                    name="email"
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.emailPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Gym Address */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.gymAddress')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <Location24Regular />
                                </div>
                                <Field
                                    name="gymAddress"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.gymAddressPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="gymAddress" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Contact Person */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.contactPerson')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <ContactCard24Regular />
                                </div>
                                <Field
                                    name="contactPerson"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.contactPersonPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="contactPerson" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Position */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.position')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <Briefcase24Regular />
                                </div>
                                <Field
                                    name="position"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.positionPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="position" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Gym License */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.gymLicense')}
                            </label>
                            <div
                                onClick={() => gymLicenseRef.current?.click()}
                                className="relative w-full py-4 px-4 bg-foreground/5 border-2 border-dashed border-foreground/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[100px]"
                            >
                                <input
                                    ref={gymLicenseRef}
                                    type="file"
                                    name="gymLicense"
                                    className="hidden"
                                    onChange={(e) => setFieldValue('gymLicense', e.currentTarget.files?.[0])}
                                />
                                <ArrowUpload24Regular className="text-foreground/30 group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-sm font-medium text-foreground/60 text-center">{values.gymLicense ? (values.gymLicense as File).name : t('Auth.gymLicense')}</span>
                            </div>
                            <ErrorMessage name="gymLicense" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Facility Photos */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.facilityPhotos')}
                            </label>
                            <div
                                onClick={() => facilityPhotosRef.current?.click()}
                                className="relative w-full py-4 px-4 bg-foreground/5 border-2 border-dashed border-foreground/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[100px]"
                            >
                                <input
                                    ref={facilityPhotosRef}
                                    type="file"
                                    name="facilityPhotos"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => setFieldValue('facilityPhotos', e.currentTarget.files)}
                                />
                                <Image24Regular className="text-foreground/30 group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-sm font-medium text-foreground/60 text-center">{values.facilityPhotos ? t('Auth.photosSelected', { count: (values.facilityPhotos as FileList).length }) : t('Auth.facilityPhotos')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-12 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            {isSubmitting ? (
                                <SpinnerIos20Regular className="animate-spin" />
                            ) : (
                                <>
                                    {t('Auth.submit')}
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
