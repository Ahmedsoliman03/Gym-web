'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useRequestAccessMutation } from '../services/auth.service';
import { ChevronDown24Regular, ArrowUpload24Regular, SpinnerIos20Regular, ArrowRight24Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { useRef, useState, useEffect } from 'react';

interface CoachRequestFormProps {
    onSuccess: () => void;
}

interface Option {
    label: string;
    value: string;
}

interface CustomMultiSelectProps {
    name: string;
    value: string[];
    onChange: (value: string[]) => void;
    options: Option[];
    placeholder: string;
}

function CustomMultiSelect({ value, onChange, options, placeholder }: CustomMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (val: string) => {
        const newValue = value.includes(val)
            ? value.filter((v) => v !== val)
            : [...value, val];
        onChange(newValue);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full min-h-[52px] pl-4 pr-10 py-2.5 bg-[#0D121F] border-2 transition-all duration-300 cursor-pointer flex flex-wrap gap-2 items-center rounded-xl ${
                    isOpen ? 'border-primary/30 ring-4 ring-primary/10' : 'border-transparent'
                }`}
            >
                {value.length === 0 && (
                    <span className="text-foreground/40 text-sm font-medium">{placeholder}</span>
                )}
                {value.map((val) => {
                    const option = options.find((o) => o.value === val);
                    return (
                        <div
                            key={val}
                            className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-bold border border-primary/20 animate-premium-in group/tag"
                        >
                            {option?.label}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(val);
                                }}
                                className="hover:text-red-400 transition-colors flex items-center justify-center p-0.5 rounded-md hover:bg-black/20"
                            >
                                <Dismiss20Regular className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
                <div className="absolute inset-y-0 right-3 flex items-center text-foreground/30 pointer-events-none transition-colors duration-200">
                    <ChevronDown24Regular className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#161B2B] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-premium-in backdrop-blur-xl">
                    <div className="max-h-60 overflow-y-auto py-2 custom-scrollbar">
                        {options.map((option) => {
                            const isSelected = value.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
                                    className={`px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-primary/5 active:scale-[0.98] ${
                                        isSelected ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground/70'}`}>
                                        {option.label}
                                    </span>
                                    {isSelected ? (
                                        <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-white/5 border border-white/10" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
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
                specialization: [] as string[],
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
                    <div className="space-y-2 relative">
                        <label className="text-[11px] font-bold text-foreground/50 px-1">
                            {t('Auth.primarySpecialization')}
                        </label>
                        <CustomMultiSelect
                            name="specialization"
                            value={values.specialization as string[]}
                            onChange={(vals) => setFieldValue('specialization', vals)}
                            options={[
                                { label: t('Auth.bodybuilding') || 'Bodybuilding', value: 'Bodybuilding' },
                                { label: t('Auth.yoga') || 'Yoga', value: 'Yoga' },
                                { label: t('Auth.crossfit') || 'CrossFit', value: 'CrossFit' },
                                { label: t('Auth.nutrition') || 'Nutrition', value: 'Nutrition' },
                                { label: 'High-Intensity Interval Training (HIIT)', value: 'HIIT' }
                            ]}
                            placeholder={t('Auth.primarySpecialization')}
                        />
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
