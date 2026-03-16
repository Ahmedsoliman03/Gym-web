'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useRequestAccessMutation } from '../services/auth.service';
import { ChevronDown24Regular, ArrowUpload24Regular, SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
import { useRef } from 'react';

interface CoachRequestFormProps {
    onSuccess: () => void;
}

export default function CoachRequestForm({ onSuccess }: CoachRequestFormProps) {
    const t = useTranslations();
    const request = useRequestAccessMutation();
    const certificationsRef = useRef<HTMLInputElement>(null);

    const validationSchema = getRequestAccessSchema(t);

    return (
        <Formik
            initialValues={{
                type: 'coach',
                name: '',
                email: '',
                phone: '',
                specialization: '',
                experience: '',
                workplace: '',
                socialMedia: '',
                certifications: null
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
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1">
                                {t('Auth.legalFullName')}
                            </label>
                            <Field
                                name="name"
                                className="w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium"
                                placeholder="John Doe"
                            />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Experience */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1">
                                {t('Auth.yearsOfExperience')}
                            </label>
                            <Field
                                name="experience"
                                type="number"
                                className="w-full px-4 py-3.5 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium"
                                placeholder={t('Auth.experiencePlaceholder')}
                            />
                            <ErrorMessage name="experience" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>
                    </div>

                    {/* Specialization */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-foreground/50 px-1">
                            {t('Auth.primarySpecialization')}
                        </label>
                        <div className="relative group/select">
                            <Field
                                as="select"
                                name="specialization"
                                className="w-full pl-4 pr-10 py-3.5 bg-[#0D121F] border border-transparent rounded-xl transition-all duration-200 outline-none appearance-none cursor-pointer text-sm font-bold text-foreground relative z-0"
                            >
                                <option value="" disabled className="bg-[#161B2B] text-foreground/50">{t('Auth.primarySpecialization')}</option>
                                <option value="Bodybuilding" className="bg-[#161B2B] text-foreground">{t('Auth.bodybuilding') || 'Bodybuilding'}</option>
                                <option value="Yoga" className="bg-[#161B2B] text-foreground">{t('Auth.yoga') || 'Yoga'}</option>
                                <option value="CrossFit" className="bg-[#161B2B] text-foreground">{t('Auth.crossfit') || 'CrossFit'}</option>
                                <option value="Nutrition" className="bg-[#161B2B] text-foreground">{t('Auth.nutrition') || 'Nutrition'}</option>
                                <option value="HIIT" className="bg-[#161B2B] text-foreground">High-Intensity Interval Training (HIIT)</option>
                            </Field>
                            <div className="absolute inset-y-0 right-3 flex items-center text-foreground/30 pointer-events-none transition-colors duration-200 z-10">
                                <ChevronDown24Regular />
                            </div>
                        </div>
                        <ErrorMessage name="specialization" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1">
                                {t('Auth.email')}
                            </label>
                            <Field
                                name="email"
                                type="email"
                                className="w-full px-4 py-3 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm"
                                placeholder={t('Auth.emailPlaceholder')}
                            />
                            <ErrorMessage name="email" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-foreground/50 px-1">
                                {t('Auth.phone')}
                            </label>
                            <Field
                                name="phone"
                                className="w-full px-4 py-3 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm"
                                placeholder={t('Auth.phonePlaceholder')}
                            />
                            <ErrorMessage name="phone" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                        </div>
                    </div>

                    {/* Certifications (Upload) */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-foreground/50 px-1">
                            {t('Auth.certificateUpload')}
                        </label>
                        <div
                            onClick={() => certificationsRef.current?.click()}
                            className="relative w-full py-8 px-4 bg-[#0D121F] border-2 border-dashed border-foreground/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group"
                        >
                            <input
                                ref={certificationsRef}
                                type="file"
                                name="certifications"
                                className="hidden"
                                onChange={(e) => setFieldValue('certifications', e.currentTarget.files?.[0])}
                            />
                            <ArrowUpload24Regular className="text-foreground/20 group-hover:text-primary transition-colors h-8 w-8" />
                            <div className="text-center">
                                <p className="text-sm font-bold text-primary">{t('Auth.dragAndDrop')}</p>
                                <p className="text-[10px] text-foreground/30 font-medium mt-1 uppercase tracking-wider">{t('Auth.uploadHint')}</p>
                            </div>
                            {values.certifications && (
                                <p className="text-xs font-medium text-foreground/60 mt-2 truncate max-w-full">
                                    {(values.certifications as File).name}
                                </p>
                            )}
                        </div>
                        <ErrorMessage name="certifications" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
                    </div>

                    {/* Statement of Purpose (Using current workplace for now as proxy if we don't want to change state) */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-foreground/50 px-1">
                            {t('Auth.statementOfPurpose')}
                        </label>
                        <Field
                            as="textarea"
                            name="workplace"
                            rows={4}
                            className="w-full px-4 py-3 bg-[#0D121F] border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm resize-none"
                            placeholder={t('Auth.statementPlaceholder')}
                        />
                        <ErrorMessage name="workplace" component="div" className="text-red-500 text-[10px] mt-1 px-1" />
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
