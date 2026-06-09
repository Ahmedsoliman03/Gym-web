'use client';

import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useAuthRequest } from '../hooks/useAuthRequest';
import { RequestAccessRequest, CoachRequestFormProps, CoachFormInnerProps } from '../types';
import { CoachFormInner } from './coach-form-inner';

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
                name: '',
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
                invitationPromocode: '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                try {
                    // Drop an empty promocode so we don't ship a meaningless ""
                    // referral field on the request body.
                    const { invitationPromocode, ...rest } = values;
                    const trimmedPromocode = (invitationPromocode ?? '').trim();
                    const payload = {
                        ...rest,
                        ...(trimmedPromocode ? { invitationPromocode: trimmedPromocode } : {}),
                    };
                    await requestAccess(payload as RequestAccessRequest);
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
