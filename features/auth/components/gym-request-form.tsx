'use client';

import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useAuthRequest } from '../hooks/useAuthRequest';
import { RequestAccessRequest, GymRequestFormProps, GymFormInnerProps } from '../types';
import { GymFormInner } from './gym-form-inner';
import { clearFormDraft } from '@/components/shared/form-persist';

import toast from 'react-hot-toast';
import { toastApiError } from '@/utils/toast-api-error';

export default function GymRequestForm({ onSuccess }: GymRequestFormProps) {
    const t = useTranslations();
    const { requestAccess } = useAuthRequest();
    const validationSchema = getRequestAccessSchema(t);

    return (
        <Formik
            initialValues={{
                type: 'gym',
                email: '',
                phone: '',
                verification_method: 'whatsapp',
                gymName: '',
                gymAddress: '',
                governorate: '',
                city: '',
                area: '',
                contactPerson: '',
                memberCount: '',
                gymLicense: null,
                gymPhoto: null,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                try {
                    const { governorate, city, area, gymAddress, gymLicense, gymPhoto, ...rest } = values;
                    const friendlyAddress = [gymAddress, area, city, governorate]
                        .map((part) => (part ?? '').toString().trim())
                        .filter(Boolean)
                        .join(', ');
                    const mappedValues: RequestAccessRequest = {
                        ...rest,
                        type: 'gym',
                        city: governorate,
                        area: city,
                        gymAddress: friendlyAddress,
                    };
                    
                    if (gymLicense) mappedValues.gymLicense = gymLicense;
                    if (gymPhoto) mappedValues.gymPhoto = gymPhoto;

                    const response = await requestAccess(mappedValues);
                    sessionStorage.setItem('request-access-email', values.email);
                    if (response.id !== undefined && response.id !== null) {
                        sessionStorage.setItem('request-access-id', String(response.id));
                    } else {
                        sessionStorage.removeItem('request-access-id');
                    }
                    localStorage.setItem('request-access-otp-method', values.verification_method);
                    clearFormDraft('draft:gym-request');
                    toast.success(t('Auth.requestSent'));
                    onSuccess();
                } catch (error: unknown) {
                    toastApiError(error, t('Validation.error'));
                }
            }}
        >
            {({ isSubmitting, values, setFieldValue }) => (
                <GymFormInner
                    isSubmitting={isSubmitting}
                    values={values as GymFormInnerProps['values']}
                    setFieldValue={setFieldValue}
                />
            )}
        </Formik>
    );
}
