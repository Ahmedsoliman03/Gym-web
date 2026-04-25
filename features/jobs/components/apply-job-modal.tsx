'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Upload, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/modal';

interface ApplyJobModalProps {
    job: any;
    onClose: () => void;
}

// Egyptian phone numbers: 01[0,1,2,5] followed by 8 digits
const EGYPTIAN_PHONE_REGEX = /^((\+20)|0)1[0125][0-9]{8}$/;

const styles = {
    formWrapper: "space-y-6",
    input: "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
    label: "text-[11px] font-bold text-foreground/50 px-1 uppercase mb-2 block",
    error: "text-red-500 text-[10px] mt-1 px-1",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase",
    uploadContainer: "relative w-full py-6 px-4 bg-[#0D121F] border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group",
    phoneWrapper: "relative",
    phoneIcon: "absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none",
    phoneInput: "w-full pl-10 pr-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
};

export function ApplyJobModal({ job, onClose }: ApplyJobModalProps) {
    const t = useTranslations('Jobs');

    if (!job) return null;

    return (
        <Modal
            isOpen={!!job}
            onClose={onClose}
            title={t('applyPopupTitle')}
        >
            <Formik
                initialValues={{
                    name: '',
                    email: '',
                    whatsapp: '',
                    description: '',
                    cv: null
                }}
                validationSchema={Yup.object({
                    name: Yup.string().required(t('userName') + ' is required'),
                    email: Yup.string().email().required(t('userEmail') + ' is required'),
                    whatsapp: Yup.string()
                        .matches(EGYPTIAN_PHONE_REGEX, t('whatsappInvalid'))
                        .required(t('whatsappNumber') + ' is required'),
                    cv: Yup.mixed().required(t('uploadCv') + ' is required')
                })}
                onSubmit={(values) => {
                    console.log('Submit application for:', job.id, values);
                    onClose();
                }}
            >
                {({ setFieldValue, values }) => (
                    <Form className={styles.formWrapper}>
                        <div>
                            <label className={styles.label}>{t('userName')}</label>
                            <Field name="name" className={styles.input} placeholder={t('userName')} />
                            <ErrorMessage name="name" component="div" className={styles.error} />
                        </div>
                        <div>
                            <label className={styles.label}>{t('userEmail')}</label>
                            <Field name="email" type="email" className={styles.input} placeholder={t('userEmail')} />
                            <ErrorMessage name="email" component="div" className={styles.error} />
                        </div>
                        <div>
                            <label className={styles.label}>{t('whatsappNumber')}</label>
                            <div className={styles.phoneWrapper}>
                                <Phone size={15} className={styles.phoneIcon} />
                                <Field
                                    name="whatsapp"
                                    type="tel"
                                    className={styles.phoneInput}
                                    placeholder="01XXXXXXXXX"
                                />
                            </div>
                            <ErrorMessage name="whatsapp" component="div" className={styles.error} />
                        </div>
                        <div>
                            <label className={styles.label}>{t('headline')}</label>
                            <Field
                                as="textarea"
                                name="description"
                                className={`${styles.input} h-24 resize-none`}
                                placeholder={t('description')}
                            />
                        </div>
                        <div>
                            <label className={styles.label}>{t('uploadCv')}</label>
                            <div
                                className={styles.uploadContainer}
                                onClick={() => {
                                    const input = document.getElementById('cv-upload') as HTMLInputElement;
                                    input?.click();
                                }}
                            >
                                <input
                                    id="cv-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setFieldValue('cv', e.currentTarget.files?.[0])}
                                />
                                <Upload className="text-foreground/20" />
                                <span className="text-xs text-foreground/40 font-medium">
                                    {values.cv ? (values.cv as File).name : t('uploadCv')}
                                </span>
                            </div>
                            <ErrorMessage name="cv" component="div" className={styles.error} />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            {t('submitApplication')}
                        </button>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
