'use client';

import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { Upload, Phone, FileCheck2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { LiveValidate } from '@/components/shared/live-validate';
import { useFileDrop } from '@/hooks/use-file-drop';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { useApplyForJobMutation } from '../services/jobs.service';
import type { Job } from '../types';

interface ApplyJobModalProps {
    job: Job | null;
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
    uploadContainerDragging: "border-primary/40 bg-primary/10",
    uploadContainerSelected: "relative w-full py-5 px-4 bg-primary/10 border-2 border-primary/40 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-primary/15 transition-all group",
    uploadIconSelected: "shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center",
    uploadDetails: "flex-1 min-w-0 text-left",
    uploadFilename: "text-sm font-bold text-foreground truncate",
    uploadHint: "text-[10px] font-medium text-primary/70 uppercase tracking-wider mt-0.5",
    uploadClearBtn: "p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-white/10 transition-all shrink-0",
    phoneWrapper: "relative",
    phoneIcon: "absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none",
    phoneInput: "w-full pl-10 pr-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
};

function CvField() {
    const t = useTranslations('Jobs');
    const { values, setFieldValue } = useFormikContext<{ cv: File | null }>();
    const cv = values.cv;

    const { isDragging, dropHandlers } = useFileDrop({
        onFiles: (files) => setFieldValue('cv', files[0]),
    });

    const openPicker = () =>
        (document.getElementById('cv-upload') as HTMLInputElement | null)?.click();

    return (
        <div>
            <label className={styles.label}>{t('uploadCv')}</label>
            {cv ? (
                <div
                    className={`${styles.uploadContainerSelected} ${isDragging ? styles.uploadContainerDragging : ''}`}
                    onClick={openPicker}
                    {...dropHandlers}
                >
                    <input
                        id="cv-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => setFieldValue('cv', e.currentTarget.files?.[0])}
                    />
                    <span className={styles.uploadIconSelected}>
                        <FileCheck2 size={18} />
                    </span>
                    <div className={styles.uploadDetails}>
                        <p className={styles.uploadFilename}>{cv.name}</p>
                        <p className={styles.uploadHint}>{t('cvSelected')}</p>
                    </div>
                    <button
                        type="button"
                        className={styles.uploadClearBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            setFieldValue('cv', null);
                            const input = document.getElementById('cv-upload') as HTMLInputElement | null;
                            if (input) input.value = '';
                        }}
                        aria-label={t('cvRemove')}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className={`${styles.uploadContainer} ${isDragging ? styles.uploadContainerDragging : ''}`}
                    onClick={openPicker}
                    {...dropHandlers}
                >
                    <input
                        id="cv-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => setFieldValue('cv', e.currentTarget.files?.[0])}
                    />
                    <Upload className="text-foreground/20" />
                    <span className="text-xs text-foreground/40 font-medium">
                        {t('uploadCv')}
                    </span>
                </div>
            )}
            <ErrorMessage name="cv" component="div" className={styles.error} />
        </div>
    );
}

export function ApplyJobModal({ job, onClose }: ApplyJobModalProps) {
    const t = useTranslations('Jobs');
    const applyMutation = useApplyForJobMutation();
    const { profile } = useProfileUser();

    if (!job) return null;

    return (
        <Modal
            isOpen={!!job}
            onClose={onClose}
            title={t('applyPopupTitle')}
        >
            <Formik
                enableReinitialize
                initialValues={{
                    name: profile?.fullName ?? '',
                    email: profile?.email ?? '',
                    whatsapp: profile?.phone ?? '',
                    description: '',
                    cv: null as File | null,
                }}
                validationSchema={Yup.object({
                    name: Yup.string().required(t('userName') + ' is required'),
                    email: Yup.string().email().required(t('userEmail') + ' is required'),
                    whatsapp: Yup.string()
                        .matches(EGYPTIAN_PHONE_REGEX, t('whatsappInvalid'))
                        .required(t('whatsappNumber') + ' is required'),
                    cv: Yup.mixed().required(t('uploadCv') + ' is required'),
                })}
                onSubmit={async (values, { resetForm }) => {
                    if (!values.cv) return;
                    try {
                        await applyMutation.mutateAsync({
                            jobId: job.id,
                            fullName: values.name,
                            email: values.email,
                            whatsappNumber: values.whatsapp,
                            headline: values.description,
                            cv: values.cv,
                        });
                        toast.success(t('applySuccess'));
                        resetForm();
                        onClose();
                    } catch {
                        toast.error(t('applyFailed'));
                    }
                }}
            >
                {() => (
                    <Form className={styles.formWrapper}>
                        <LiveValidate />
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
                        <CvField />
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={applyMutation.isPending}
                        >
                            {applyMutation.isPending
                                ? t('applySubmitting')
                                : t('submitApplication')}
                        </button>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
