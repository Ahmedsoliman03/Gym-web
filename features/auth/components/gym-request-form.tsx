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
                    const { governorate, city, area, gymAddress, ...rest } = values;
                    // Build one human-readable address by collecting every
                    // location-related text from finest to coarsest detail.
                    // Empty inputs are dropped so we don't produce stray commas.
                    const friendlyAddress = [gymAddress, area, city, governorate]
                        .map((part) => (part ?? '').toString().trim())
                        .filter(Boolean)
                        .join(', ');
                    const mappedValues = {
                        ...rest,
                        // Keep the city/area split the backend already expects.
                        city: governorate,
                        area: city,
                        // Send the combined friendly address back as gymAddress.
                        gymAddress: friendlyAddress,
                    };
                    await requestAccess(mappedValues as RequestAccessRequest);
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
