import * as Yup from 'yup';

export const getLoginSchema = (t: any) => Yup.object().shape({
    email: Yup.string().email(t('Validation.email')).required(t('Validation.required', { field: t('Auth.email') })),
    password: Yup.string().min(8, t('Validation.min', { field: t('Auth.password'), min: 8 })).required(t('Validation.required', { field: t('Auth.password') })),
});

export const getRequestAccessSchema = (t: any) => Yup.object().shape({
    name: Yup.string().when('type', {
        is: 'coach',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.legalFullName') })),
        otherwise: (schema) => schema.optional(),
    }),
    email: Yup.string().email(t('Validation.email')).required(t('Validation.required', { field: t('Auth.email') })),
    phone: Yup.string()
        .matches(/^(01|\+201|00201)[0125][0-9]{8}$/, t('Validation.invalidPhone'))
        .required(t('Validation.required', { field: t('Auth.phone') })),
    type: Yup.string().oneOf(['gym', 'coach']).required(),

    // Gym Fields
    gymName: Yup.string().when('type', {
        is: 'gym',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.gymName') })),
        otherwise: (schema) => schema.optional(),
    }),
    gymAddress: Yup.string().when('type', {
        is: 'gym',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.gymAddress') })),
        otherwise: (schema) => schema.optional(),
    }),
    city: Yup.string().when('type', {
        is: 'gym',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.selectCity') })),
        otherwise: (schema) => schema.optional(),
    }),
    area: Yup.string().when('type', {
        is: 'gym',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.selectArea') })),
        otherwise: (schema) => schema.optional(),
    }),
    contactPerson: Yup.string().when('type', {
        is: 'gym',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.contactPerson') })),
        otherwise: (schema) => schema.optional(),
    }),
    memberCount: Yup.number()
        .typeError(t('Validation.integer'))
        .positive(t('Validation.positive'))
        .integer(t('Validation.integer'))
        .when('type', {
            is: 'gym',
            then: (schema) => schema.required(t('Validation.required', { field: t('Auth.memberCount') })),
            otherwise: (schema) => schema.optional(),
        }),

    // Coach Fields
    specialization: Yup.array().of(Yup.string()).min(1, t('Validation.required', { field: t('Auth.primarySpecialization') })).when('type', {
        is: 'coach',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.primarySpecialization') })),
        otherwise: (schema) => schema.optional(),
    }),
    desc: Yup.string().when('type', {
        is: 'coach',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.statementOfPurpose') })),
        otherwise: (schema) => schema.optional(),
    }),

    experience: Yup.number().positive(t('Validation.positive')).integer(t('Validation.integer')).when('type', {
        is: 'coach',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.yearsOfExperience') })),
        otherwise: (schema) => schema.optional(),
    }),
    certifications: Yup.array().of(Yup.mixed()).when('type', {
        is: 'coach',
        then: (schema) => schema.min(1, t('Validation.required', { field: t('Auth.certificateUpload') })).required(t('Validation.required', { field: t('Auth.certificateUpload') })),
        otherwise: (schema) => schema.optional(),
    }),
    gymLicense: Yup.mixed().when('type', {
        is: 'gym',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.gymLicense') })),
        otherwise: (schema) => schema.optional(),
    }),
    gymPhoto: Yup.mixed().when('type', {
        is: 'gym',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.gymPhoto') })),
        otherwise: (schema) => schema.optional(),
    }),
});

export const getOtpSchema = (t: any) => Yup.object().shape({
    code: Yup.string().length(6, t('Validation.min', { field: t('Validation.code'), min: 6 })).required(t('Validation.required', { field: t('Validation.code') })),
});

export const getRegisterSchema = (t: any) => Yup.object().shape({
    fullName: Yup.string().required(t('Validation.required', { field: t('Auth.fullName') })),
    email: Yup.string().email(t('Validation.email')).required(t('Validation.required', { field: t('Auth.email') })),
    phone: Yup.string()
        .matches(/^(01|\+201|00201)[0125][0-9]{8}$/, t('Validation.invalidPhone'))
        .required(t('Validation.required', { field: t('Auth.phone') })),
    password: Yup.string().min(8, t('Validation.min', { field: t('Auth.password'), min: 8 })).required(t('Validation.required', { field: t('Auth.password') })),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], t('Validation.match'))
        .required(t('Validation.required', { field: t('Validation.confirmPassword') })),
});

export const getActivateProfileSchema = (t: any) => Yup.object().shape({
    inviteCode: Yup.string().length(8, t('Validation.min', { field: t('Auth.inviteCode'), min: 8 })).required(t('Validation.required', { field: t('Auth.inviteCode') })),
    password: Yup.string().min(8, t('Validation.min', { field: t('Auth.password'), min: 8 })).required(t('Validation.required', { field: t('Auth.password') })),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], t('Validation.match'))
        .required(t('Validation.required', { field: t('Validation.confirmPassword') })),
    agreement: Yup.boolean().oneOf([true], t('Validation.required', { field: t('Auth.membershipAgreement') })).required(),
});
