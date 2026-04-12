'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/modal';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const styles = {
    formWrapper: "space-y-6",
    input: "w-full px-4 py-3.5 bg-[#0D121F] border border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-foreground text-sm font-medium",
    label: "text-[11px] font-bold text-foreground/50 px-1 uppercase mb-2 block",
    error: "text-red-500 text-[10px] mt-1 px-1",
    submitButton: "w-full py-4 bg-primary text-black rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase",
};

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const t = useTranslations('Navbar');

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={t('changePassword')}
        >
            <Formik
                initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                }}
                validationSchema={Yup.object({
                    currentPassword: Yup.string().required(t('currentPassword') + ' is required'),
                    newPassword: Yup.string().min(8).required(t('newPassword') + ' is required'),
                    confirmNewPassword: Yup.string()
                        .oneOf([Yup.ref('newPassword')], t('passwordMismatch'))
                        .required(t('confirmNewPassword') + ' is required')
                })}
                onSubmit={(values) => {
                    console.log('Change password:', values);
                    onClose();
                }}
            >
                {() => (
                    <Form className={styles.formWrapper}>
                        <div>
                            <label className={styles.label}>{t('currentPassword')}</label>
                            <Field name="currentPassword" type="password" className={styles.input} />
                            <ErrorMessage name="currentPassword" component="div" className={styles.error} />
                        </div>
                        <div>
                            <label className={styles.label}>{t('newPassword')}</label>
                            <Field name="newPassword" type="password" className={styles.input} />
                            <ErrorMessage name="newPassword" component="div" className={styles.error} />
                        </div>
                        <div>
                            <label className={styles.label}>{t('confirmNewPassword')}</label>
                            <Field name="confirmNewPassword" type="password" className={styles.input} />
                            <ErrorMessage name="confirmNewPassword" component="div" className={styles.error} />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            {t('changePassword')}
                        </button>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
