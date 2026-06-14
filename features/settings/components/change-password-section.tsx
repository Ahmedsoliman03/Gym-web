'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import { useChangePasswordMutation } from '@/features/auth/services/auth.service';
import { LiveValidate } from '@/components/shared/live-validate';
import { settingsStyles as s } from './styles';

export function ChangePasswordSection() {
    const t = useTranslations('Settings');
    const tNav = useTranslations('Navbar');
    const changePassword = useChangePasswordMutation();

    return (
        <Formik
            initialValues={{
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }}
            validationSchema={Yup.object({
                currentPassword: Yup.string().required(t('required')),
                newPassword: Yup.string()
                    .min(8, t('passwordTooShort'))
                    .required(t('required')),
                confirmPassword: Yup.string()
                    .oneOf([Yup.ref('newPassword')], tNav('passwordMismatch'))
                    .required(t('required')),
            })}
            onSubmit={(values, { resetForm }) => {
                changePassword.mutate(values, {
                    onSuccess: () => {
                        toast.success(tNav('changePasswordSuccess'));
                        resetForm();
                    },
                    onError: () => toast.error(t('changePasswordError')),
                });
            }}
        >
            {() => (
                <Form className={`${s.formWrapper} mt-4`}>
                    <LiveValidate />
                    <div>
                        <label className={s.label}>{tNav('currentPassword')}</label>
                        <Field name="currentPassword" type="password" className={s.input} />
                        <ErrorMessage name="currentPassword" component="div" className={s.error} />
                    </div>
                    <div>
                        <label className={s.label}>{tNav('newPassword')}</label>
                        <Field name="newPassword" type="password" className={s.input} />
                        <ErrorMessage name="newPassword" component="div" className={s.error} />
                    </div>
                    <div>
                        <label className={s.label}>{tNav('confirmNewPassword')}</label>
                        <Field name="confirmPassword" type="password" className={s.input} />
                        <ErrorMessage name="confirmPassword" component="div" className={s.error} />
                    </div>
                    <button
                        type="submit"
                        disabled={changePassword.isPending}
                        className={s.submitButton}
                    >
                        {changePassword.isPending ? t('saving') : t('save')}
                    </button>
                </Form>
            )}
        </Formik>
    );
}
