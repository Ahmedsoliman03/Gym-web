export interface LoginRequest {
    email: string; // can be email or phone based on Postman
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    city?: string;
    area?: string;
}

export interface ActivateRequest {
    inviteCode: string;
    password: string;
    confirmPassword: string;
}

export interface RequestAccessRequest {
    type: 'coach' | 'gym';
    name?: string;
    email: string;
    phone: string;
    specialization?: string[] | null;
    experience?: string | number;
    desc?: string;
    certifications?: File[] | null;
    profile_image?: File | null;
    gymName?: string;
    contactPerson?: string;
    governorate?: string;
    city?: string;
    area?: string;
    gymAddress?: string;
    memberCount?: string | number;
    /** Coach-only: how many clients the coach currently trains. */
    numberOfClients?: string | number;
    /** Optional referral / invitation promocode supplied by the applicant. */
    invitationPromocode?: string;
    gymLicense?: File | null;
    gymPhoto?: File | null;
    [key: string]: any;
}

export interface VerifyOTPRequest {
    email: string;
    otp: string;
}





export interface AuthResponse {
    message?: string;
    token?: string;
    user?: any;
}

// ─── Component Props Interfaces ──────────────────────────────────────────────

export interface GymRequestFormProps {
    onSuccess: () => void;
}

export interface GymFormInnerProps {
    isSubmitting: boolean;
    values: {
        gymName: string;
        gymAddress: string;
        governorate: string;
        city: string;
        area: string;
        contactPerson: string;
        memberCount: string;
        phone: string;
        email: string;
        gymLicense: File | null;
        gymPhoto: File | null;
        invitationPromocode: string;
    };
    setFieldValue: (field: string, value: unknown) => void;
}

export interface CoachRequestFormProps {
    onSuccess: () => void;
}

export interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    city: string;
    area: string;
}

export interface CoachFormInnerProps {
    isSubmitting: boolean;
    values: {
        name: string;
        email: string;
        phone: string;
        city: string;
        area: string;
        specialization: string[];
        experience: string;
        desc: string;
        certifications: File[];
        profile_image: File | null;
        numberOfClients: string;
        invitationPromocode: string;
    };
    setFieldValue: (field: string, value: unknown) => void;
}
