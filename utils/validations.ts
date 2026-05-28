import * as Yup from 'yup';

export const EGYPTIAN_PHONE_REGEX = /^(01|\+201|00201)[0125][0-9]{8}$/;

export const getPhoneSchema = (t: any) => 
    Yup.string()
        .matches(EGYPTIAN_PHONE_REGEX, t('Validation.invalidPhone'))
        .required(t('Validation.required', { field: t('Auth.phone') }));

export const getFullNameSchema = (t: any) =>
    Yup.string().required(t('Validation.required', { field: t('Auth.fullName') }));

export const getEmailSchema = (t: any) =>
    Yup.string().email(t('Validation.email')).required(t('Validation.required', { field: t('Auth.email') }));
