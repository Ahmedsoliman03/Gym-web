'use client';

import { Formik } from 'formik';
import { useTranslations } from 'next-intl';
import { getRequestAccessSchema } from '../validations';
import { useAuthRequest } from '../hooks/useAuthRequest';
import { RequestAccessRequest, GymRequestFormProps, GymFormInnerProps } from '../types';
import { GymFormInner } from './gym-form-inner';

import toast from 'react-hot-toast';

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
                gymPhoto: null
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
                <GymFormInner
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                    dirty={dirty}
                    values={values as GymFormInnerProps['values']}
                    setFieldValue={setFieldValue}
                />
            )}
        </Formik>
    );
}
