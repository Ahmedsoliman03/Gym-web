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
                    const mappedValues = {
                        ...rest,
                        city: governorate,
                        area: city,
                        gymAddress: friendlyAddress,
                    } as any;
                    
                    if (gymLicense) mappedValues.gymLicense = gymLicense;
                    if (gymPhoto) mappedValues.gymPhoto = gymPhoto;

                    await requestAccess(mappedValues as RequestAccessRequest);
                    sessionStorage.setItem('request-access-email', values.email);
                    clearFormDraft('draft:gym-request');
                    toast.success(t('Auth.requestSent'));
                    onSuccess();
                } catch (error: any) {
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
