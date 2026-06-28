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
                    // The backend expects a single space-separated `name`; the
                    // form collects it as two fields (see CoachFormInner).
                    const { firstName, lastName, ...rest } = values;
                    const name = [firstName, lastName]
                        .map((part) => part.trim())
                        .filter(Boolean)
                        .join(' ');
                    await requestAccess({ ...rest, name } as RequestAccessRequest);
                    clearFormDraft('draft:coach-request');
                    toast.success(t('Auth.requestSent'));
                    onSuccess();
                } catch (error: any) {
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
