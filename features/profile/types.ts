export interface Certification {
    id: string;
    file: string;
}

export interface ClientProfileData {
    id: string;
    type: 'client';
    name: string;
    photo: string | null;
}

export interface CoachProfileData {
    id: string;
    type: 'coach';
    name: string;
    experienceYears?: number;
    specialization?: string[];
    description?: string;
    profileImage?: string | null;
    photo: string | null;
    certifications?: Certification[];
}

export interface GymProfileData {
    id: string;
    type: 'gym';
    name: string;
    gymName?: string;
    location?: string;
    memberCount?: number;
    mainPhoto?: string | null;
    photo: string | null;
}

export interface ClientProfile {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    userType: 'client';
    profile: ClientProfileData;
}

export interface CoachProfile {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    userType: 'coach';
    profile: CoachProfileData;
}

export interface GymProfile {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    userType: 'gym';
    profile: GymProfileData;
}

export type UserProfile = ClientProfile | CoachProfile | GymProfile;