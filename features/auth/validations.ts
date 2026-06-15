import * as Yup from 'yup';
import { getPhoneSchema, getEmailSchema } from '@/utils/validations';

type Translator = (key: string, values?: Record<string, string | number>) => string;

const getPasswordSchema = (t: Translator) => Yup.string()
    .min(8, t('Validation.min', { field: t('Auth.password'), min: 8 }))
    .matches(/[A-Z]/, t('Validation.passwordCapital'))
    .matches(/[0-9]/, t('Validation.passwordNumber'))
    .matches(/[!@#$%^&*(),.?":{}|<>]/, t('Validation.passwordSpecial'))
    .required(t('Validation.required', { field: t('Auth.password') }));

export const getLoginSchema = (t: Translator) => Yup.object().shape({
    email: getEmailSchema(t),
    password: getPasswordSchema(t),
});

export const getRequestAccessSchema = (t: Translator) => Yup.object().shape({
    name: Yup.string().when('type', {
        is: 'coach',
        then: (schema) => schema.required(t('Validation.required', { field: t('Auth.legalFullName') })),
        otherwise: (schema) => schema.optional(),
    }),
    email: getEmailSchema(t),
    phone: getPhoneSchema(t),
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
        is: (val: string) => val === 'gym' || val === 'coach',
        then: (schema) => schema.required(t('Validation.required', { field: t('Location.city') })),
        otherwise: (schema) => schema.optional(),
    }),
    area: Yup.string().when('type', {
        is: (val: string) => val === 'gym' || val === 'coach',
        then: (schema) => schema.required(t('Validation.required', { field: t('Location.area') })),
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
    numberOfClients: Yup.number()
        .typeError(t('Validation.integer'))
        .min(0, t('Validation.positive'))
        .integer(t('Validation.integer'))
        .when('type', {
            is: 'coach',
            then: (schema) => schema.required(t('Validation.required', { field: t('Auth.numberOfClients') })),
            otherwise: (schema) => schema.optional(),
        }),
    // Promocode is referral-style — always optional, accepted from both flows.
    invitationPromocode: Yup.string().trim().optional(),
    certifications: Yup.array().of(Yup.mixed()).when('type', {
        is: 'coach',
        then: (schema) => schema.min(1, t('Validation.required', { field: t('Auth.certificateUpload') })).required(t('Validation.required', { field: t('Auth.certificateUpload') })),
        otherwise: (schema) => schema.optional(),
    }),
    profile_image: Yup.mixed().when('type', {
        is: 'coach',
        then: (schema) => schema.required(t('Validation.required', { field: t('Profile.profilePhoto') || 'Profile Photo' })),
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

export const getOtpSchema = (t: Translator) => Yup.object().shape({
    code: Yup.string().length(6, t('Validation.min', { field: t('Validation.code'), min: 6 })).required(t('Validation.required', { field: t('Validation.code') })),
});

export const getRegisterSchema = (t: Translator) => Yup.object().shape({
    firstName: Yup.string().required(t('Validation.required', { field: t('Validation.firstName') })),
    lastName: Yup.string().required(t('Validation.required', { field: t('Validation.lastName') })),
    email: getEmailSchema(t),
    phone: getPhoneSchema(t),
    password: getPasswordSchema(t),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], t('Validation.match'))
        .required(t('Validation.required', { field: t('Validation.confirmPassword') })),
});

export const getGoogleSignupCompleteSchema = (t: Translator) => Yup.object().shape({
    fullName: Yup.string().required(t('Validation.required', { field: t('Auth.fullName') })),
    phone: getPhoneSchema(t),
    city: Yup.string().required(t('Validation.required', { field: t('Location.city') })),
    area: Yup.string().required(t('Validation.required', { field: t('Location.area') })),
});

export const getActivateProfileSchema = (t: Translator) => Yup.object().shape({
    // email: getEmailSchema(t),
    inviteCode: Yup.string().length(8, t('Validation.min', { field: t('Auth.inviteCode'), min: 8 })).required(t('Validation.required', { field: t('Auth.inviteCode') })),
    password: getPasswordSchema(t),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], t('Validation.match'))
        .required(t('Validation.required', { field: t('Validation.confirmPassword') })),
    // agreement: Yup.boolean().oneOf([true], t('Validation.required', { field: t('Auth.membershipAgreement') })).required(),
});
