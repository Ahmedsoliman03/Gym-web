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
    verification_method?: OtpChannel;
}

export interface GoogleAuthRequest {
    code: string;
    redirectUri?: string;
}

export interface GoogleProfile {
    email: string;
    fullName: string;
    picture: string;
}

export interface AuthUser {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    userType: 'client' | 'coach' | 'gym' | 'admin';
}

export type GoogleAuthResponse =
    | {
          status: 'authenticated';
          user: AuthUser;
      }
    | {
          status: 'signup_required';
          googleProfile: GoogleProfile;
      };

export interface GoogleSignupCompleteRequest {
    fullName?: string;
    phone: string;
    city: string;
    area: string;
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
    numberOfClients?: string | number;
    gymLicense?: File | null;
    gymPhoto?: File | null;
    [key: string]: unknown;
}

export type OtpChannel = 'whatsapp' | 'email';

export interface RequestAccessResponse {
    id?: string | number;
    [key: string]: unknown;
}

export interface UpdateCommunicationPreferenceRequest {
    requestId: string | number;
    communication_preference: OtpChannel;
}

export const OTP_TIMER_SECONDS = 300;
export const OTP_TIMER_KEY = 'otp:timerUntil';


export const OTP_CHANNEL_KEY = 'otp:channel';
export const OTP_SWITCH_COOLDOWN_KEY = 'otp:switchCooldownUntil';

export const OTP_EMAIL_KEY = 'otp:email';

// Registration always sends the first code over WhatsApp.
export const DEFAULT_OTP_CHANNEL: OtpChannel = 'whatsapp';

export interface VerifyOTPRequest {
    email: string;
    otp: string;
    type?: OtpChannel;
}

export interface ResendOtpRequest {
    email: string;
    verification_method: OtpChannel;
}
export interface UseResendCooldownOptions {
    /** localStorage key under which the absolute expiry timestamp is stored. */
    storageKey: string;
    /** Cooldown length in milliseconds. Defaults to 15 seconds. */
    durationMs?: number;
}

export interface ResendCooldown {
    /** Whole seconds remaining, 0 when idle. */
    secondsLeft: number;
    /** True while a cooldown is running. */
    isCoolingDown: boolean;
    /** Begin (or restart) the cooldown and persist it. */
    start: () => void;
}

export type ResendActivationRequest = ResendOtpRequest;





export interface AuthResponse {
    message?: string;
    token?: string;
    user?: AuthUser;
}

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
        firstName: string;
        lastName: string;
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
    };
    setFieldValue: (field: string, value: unknown) => void;
}
