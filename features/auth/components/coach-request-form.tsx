'use client';

import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useAuthRequest } from '../hooks/useAuthRequest';
import { RequestAccessRequest, CoachRequestFormProps, CoachFormInnerProps } from '../types';
import { CoachFormInner } from './coach-form-inner';

import toast from 'react-hot-toast';

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
                governorate: '',
                city: '',
                area: '',
                specialization: [] as string[],
                experience: '',
                desc: '',
                certifications: [] as File[],
                profile_image: null as File | null
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                try {
                    const { governorate, city, area, ...rest } = values;
                    const mappedValues = {
                        ...rest,
                        city: governorate,
                        area: city
                    };
                    await requestAccess(mappedValues as RequestAccessRequest);
                    toast.success(t('Auth.requestSent'));
                    onSuccess();
                } catch (error: any) {
                    toast.error(error?.response?.data?.message || t('Validation.error'));
                }
            }}
        >
            {({ isSubmitting, values, setFieldValue, isValid, dirty }) => (
                <CoachFormInner
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                    dirty={dirty}
                    values={values as CoachFormInnerProps['values']}
                    setFieldValue={setFieldValue}
                />
            )}
        </Formik>
    );
}
