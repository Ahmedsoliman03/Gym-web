'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useRequestAccessMutation } from '../services/auth.service';
import { Person24Regular, Mail24Regular, Phone24Regular, Star24Regular, ChevronDown24Regular, History24Regular, Briefcase24Regular, Link24Regular, ArrowUpload24Regular, SpinnerIos20Regular, ArrowRight24Regular } from '@fluentui/react-icons';
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
                <Form className="space-y-5 animate-premium-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.fullName')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <Person24Regular />
                                </div>
                                <Field
                                    name="name"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.namePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1 px-1" />
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

                        {/* Specialization */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.specialization')}
                            </label>
                            <div className="relative group/select">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none transition-colors duration-200 z-10">
                                    <Star24Regular />
                                </div>
                                <Field
                                    as="select"
                                    name="specialization"
                                    className="w-full pl-10 pr-10 py-3 bg-foreground/5 border border-transparent rounded-2xl transition-all duration-200 outline-none appearance-none cursor-pointer text-sm font-bold relative z-0"
                                >
                                    <option value="" disabled className="bg-surface text-foreground/50">{t('Auth.selectSpecialization')}</option>
                                    <option value="Bodybuilding" className="bg-surface text-foreground">{t('Auth.bodybuilding')}</option>
                                    <option value="Yoga" className="bg-surface text-foreground">{t('Auth.yoga')}</option>
                                    <option value="CrossFit" className="bg-surface text-foreground">{t('Auth.crossfit')}</option>
                                    <option value="Nutrition" className="bg-surface text-foreground">{t('Auth.nutrition')}</option>
                                </Field>
                                <div className="absolute inset-y-0 right-3 flex items-center text-foreground/30 pointer-events-none transition-colors duration-200 z-10">
                                    <ChevronDown24Regular />
                                </div>
                            </div>
                            <ErrorMessage name="specialization" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Experience */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.experience')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <History24Regular />
                                </div>
                                <Field
                                    name="experience"
                                    type="number"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.experiencePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="experience" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Workplace */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.workplace')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <Briefcase24Regular />
                                </div>
                                <Field
                                    name="workplace"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.workplacePlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="workplace" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Social Media */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.socialMedia')}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-foreground/30 pointer-events-none">
                                    <Link24Regular />
                                </div>
                                <Field
                                    name="socialMedia"
                                    className="w-full pl-10 pr-4 py-3 bg-foreground/5 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder={t('Auth.socialMediaPlaceholder')}
                                />
                            </div>
                            <ErrorMessage name="socialMedia" component="div" className="text-red-500 text-xs mt-1 px-1" />
                        </div>

                        {/* Certifications */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                                {t('Auth.certifications')}
                            </label>
                            <div
                                onClick={() => certificationsRef.current?.click()}
                                className="relative w-full py-4 px-4 bg-foreground/5 border-2 border-dashed border-foreground/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[100px]"
                            >
                                <input
                                    ref={certificationsRef}
                                    type="file"
                                    name="certifications"
                                    className="hidden"
                                    onChange={(e) => setFieldValue('certifications', e.currentTarget.files?.[0])}
                                />
                                <ArrowUpload24Regular className="text-foreground/30 group-hover:text-primary transition-colors h-8 w-8" />
                                <span className="text-sm font-medium text-foreground/60 text-center">{values.certifications ? (values.certifications as File).name : t('Auth.certifications')}</span>
                            </div>
                            <ErrorMessage name="certifications" component="div" className="text-red-500 text-xs mt-1 px-1" />
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
