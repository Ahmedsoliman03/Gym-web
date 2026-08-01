'use client';

import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useAuthRequest } from '../hooks/useAuthRequest';
import { RequestAccessRequest, CoachRequestFormProps, CoachFormInnerProps } from '../types';
import { CoachFormInner } from './coach-form-inner';
import { clearFormDraft } from '@/components/shared/form-persist';

import toast from 'react-hot-toast';
import { toastApiError } from '@/utils/toast-api-error';

export default function CoachRequestForm({ onSuccess }: CoachRequestFormProps) {
    const t = useTranslations();
    const { requestAccess } = useAuthRequest();

    const validationSchema = getRequestAccessSchema(t);

    return (
        <Formik
            initialValues={{
                type: 'coach',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                verification_method: 'whatsapp',
                city: '',
                area: '',
                specialization: [] as string[],
                experience: '',
                desc: '',
                certifications: [] as File[],
                profile_image: null as File | null,
                numberOfClients: '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                try {
                    const { firstName, lastName, profile_image, certifications, ...rest } = values;
                    const name = [firstName, lastName]
                        .map((part) => part.trim())
                        .filter(Boolean)
                        .join(' ');
                    
                    const mappedValues: RequestAccessRequest = {
                        ...rest,
                        type: 'coach',
                        name,
                    };

                    if (profile_image) mappedValues.profile_image = profile_image;
                    if (certifications.length > 0) mappedValues.certifications = certifications;

                    const response = await requestAccess(mappedValues);
                    sessionStorage.setItem('request-access-email', values.email);
                    if (response.id !== undefined && response.id !== null) {
                        sessionStorage.setItem('request-access-id', String(response.id));
                    } else {
                        sessionStorage.removeItem('request-access-id');
                    }
                    localStorage.setItem('request-access-otp-method', values.verification_method);
                    clearFormDraft('draft:coach-request');
                    toast.success(t('Auth.requestSent'));
                    onSuccess();
                } catch (error: unknown) {
                    toastApiError(error, t('Validation.error'));
                }
            }}
        >
            {({ isSubmitting, values, setFieldValue }) => (
                <CoachFormInner
                    isSubmitting={isSubmitting}
                    values={values as CoachFormInnerProps['values']}
                    setFieldValue={setFieldValue}
                />
            )}
        </Formik>
    );
}
