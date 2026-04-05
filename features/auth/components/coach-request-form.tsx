'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useRequestAccessMutation } from '../services/auth.service';
import { useRef, useState, useEffect } from 'react';
import { ChevronDown24Regular, ArrowUpload24Regular, SpinnerIos20Regular, ArrowRight24Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { SPECIALIZATIONS } from '@/constants/specializations';

const styles = {
  multiSelect: {
    container: "relative",
    trigger: (isOpen: boolean) => `
      w-full min-h-[52px] pl-4 pr-10 py-2.5 bg-[#0D121F] border-2 
      transition-all duration-300 cursor-pointer flex flex-wrap 
      gap-2 items-center rounded-xl 
      ${isOpen ? 'border-primary/30 ring-4 ring-primary/10' : 'border-transparent'}
    `,
    placeholder: "text-foreground/40 text-sm font-medium",
    tag: "flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-bold border border-primary/20 animate-premium-in group/tag",
    tagClose: "hover:text-red-400 transition-colors flex items-center justify-center p-0.5 rounded-md hover:bg-black/20",
    chevronWrapper: "absolute inset-y-0 right-3 flex items-center text-foreground/30 pointer-events-none transition-colors duration-200",
    chevron: (isOpen: boolean) => `h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`,
    dropdown: "absolute z-50 w-full mt-2 bg-[#161B2B] border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-premium-in backdrop-blur-xl",
    optionsList: "max-h-60 overflow-y-auto py-2 custom-scrollbar",
    option: (isSelected: boolean) => `
      px-4 py-3.5 flex items-center justify-between cursor-pointer 
      transition-all duration-200 hover:bg-primary/5 active:scale-[0.98] 
      ${isSelected ? 'bg-primary/5' : ''}
    `,
    optionText: (isSelected: boolean) => `text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-foreground/70'}`,
    optionIndicatorActive: "h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(34,197,94,0.8)]",
    optionIndicatorInactive: "h-2 w-2 rounded-full bg-white/5 border border-white/10"
  },
  form: "space-y-6 animate-premium-in",
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
  uploadSubtitle: "text-[10px] text-foreground/30 font-medium mt-1 uppercase tracking-wider",
  fileName: "text-xs font-medium text-foreground/60 mt-2 truncate max-w-full",
  submitWrapper: "flex justify-center pt-2",
  submitButton: "w-full py-4 bg-primary text-black rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer text-base uppercase tracking-wider",
  submitIcon: "group-hover:translate-x-1 transition-transform rtl:rotate-180"
};

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
        <div className={styles.multiSelect.container} ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={styles.multiSelect.trigger(isOpen)}
            >
                {value.length === 0 && (
                    <span className={styles.multiSelect.placeholder}>{placeholder}</span>
                )}
                {value.map((val) => {
                    const option = options.find((o) => o.value === val);
                    return (
                        <div
                            key={val}
                            className={styles.multiSelect.tag}
                        >
                            {option?.label}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleOption(val);
                                }}
                                className={styles.multiSelect.tagClose}
                            >
                                <Dismiss20Regular className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
                <div className={styles.multiSelect.chevronWrapper}>
                    <ChevronDown24Regular className={styles.multiSelect.chevron(isOpen)} />
                </div>
            </div>

            {isOpen && (
                <div className={styles.multiSelect.dropdown}>
                    <div className={styles.multiSelect.optionsList}>
                        {options.map((option) => {
                            const isSelected = value.includes(option.value);
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
                                    className={styles.multiSelect.option(isSelected)}
                                >
                                    <span className={styles.multiSelect.optionText(isSelected)}>
                                        {option.label}
                                    </span>
                                    {isSelected ? (
                                        <div className={styles.multiSelect.optionIndicatorActive} />
                                    ) : (
                                        <div className={styles.multiSelect.optionIndicatorInactive} />
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
                            name="specialization"
                            value={values.specialization as string[]}
                            onChange={(vals) => setFieldValue('specialization', vals)}
                            options={SPECIALIZATIONS.map(spec => ({
                                label: t(spec.label as any) || spec.fallback,
                                value: spec.value
                            }))}
                            placeholder={t('Auth.primarySpecialization')}
                        />
                        <ErrorMessage name="specialization" component="div" className={styles.error} />
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
                                onChange={(e) => setFieldValue('certifications', e.currentTarget.files?.[0])}
                            />
                            <ArrowUpload24Regular className={styles.uploadIconSize} />
                            <div className="text-center">
                                <p className={styles.uploadTitle}>{t('Auth.dragAndDrop')}</p>
                                <p className={styles.uploadSubtitle}>{t('Auth.uploadHint')}</p>
                            </div>
                            {values.certifications && (
                                <p className={styles.fileName}>
                                    {(values.certifications as File).name}
                                </p>
                            )}
                        </div>
                        <ErrorMessage name="certifications" component="div" className={styles.error} />
                    </div>

                    {/* Statement of Purpose */}
                    <div className={styles.fieldWrapper}>
                        <label className={styles.label}>
                            {t('Auth.statementOfPurpose')}
                        </label>
                        <Field
                            as="textarea"
                            name="workplace"
                            rows={4}
                            className={styles.textarea}
                            placeholder={t('Auth.statementPlaceholder')}
                        />
                        <ErrorMessage name="workplace" component="div" className={styles.error} />
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
                                    {t('Auth.submitApplication')}
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
