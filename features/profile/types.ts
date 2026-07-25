import type { PresenceStatus } from '@/features/chat/types';

export interface Certification {
    id: string;
    file: string;
}

export interface GalleryImage {
    id: string;
    image: string;
    createdAt?: string;
}

export interface ProfilePlan {
    id?: string;
    name: string;
    duration: string;
    price: string;
    salePrice?: string;
    features: string[];
    getStartedCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface SocialMediaLink {
    platform: string;
    url: string;
}

export interface CoachTransformation {
    id: string;
    clientName: string;
    duration: string;
    image: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ClientProfileData {
    id: string;
    type: 'client';
    name: string;
    photo: string | null;
    editCount?: number;
}

export interface CoachProfileData {
    id: string;
    type: 'coach';
    name: string;
    experienceYears?: number;
    numberOfClients?: number;
    specializations?: string[];
    specialization?: string[];
    description?: string;
    socialMedia?: SocialMediaLink[];
    profileImage?: string | null;
    photo: string | null;
    certifications?: Certification[];
    plans?: ProfilePlan[];
    transformations?: CoachTransformation[];
    editCount?: number;
    promoCode?: string;
}

export interface GymProfileData {
    id: string;
    type: 'gym';
    name: string;
    gymName?: string;
    description?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    city?: string;
    area?: string;
    location?: string;
    address?: string;
    memberCount?: number;
    licenseImage?: string | null;
    mainPhoto?: string | null;
    photo: string | null;
    specializations?: string[];
    socialMedia?: SocialMediaLink[];
    images?: GalleryImage[];
    plans?: ProfilePlan[];
    createdAt?: string;
    updatedAt?: string;
    editCount?: number;
    promoCode?: string;
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

export interface EditableImage {
    id?: string;
    url?: string;
    file?: File;
}

export interface EditableTransformation {
    id: string;
    clientName: string;
    duration: string;
    image: string | File;
}

export interface ClientEditValues {
    fullName?: string;
    phone?: string;
    photo?: File | null;
}

export interface CoachEditValues {
    name?: string;
    image?: File | null;
    philosophyDesc?: string;
    specializations?: string[];
    certifications?: EditableImage[];
    plans?: ProfilePlan[];
    transformations?: EditableTransformation[];
    socialMedia?: SocialMediaLink[];
}

export interface GymEditValues {
    name?: string;
    image?: File | null;
    description?: string;
    specializations?: string[];
    gymImages?: EditableImage[];
    plans?: ProfilePlan[];
    socialMedia?: SocialMediaLink[];
}

export type EditProfileValues =
    | { role: 'client'; values: ClientEditValues }
    | { role: 'coach';  values: CoachEditValues }
    | { role: 'gym';    values: GymEditValues };

export type ProfileViewType = 'coach' | 'gym' | 'client';

export interface ProfileViewBase {
    id: string;
        userId?: string;
    type: ProfileViewType;
    name: string;
    image: string;
    banner?: string;
    location?: string;
    status?: PresenceStatus;
    socialMedia?: SocialMediaLink[];
}

export interface CoachProfileViewModel extends ProfileViewBase {
    type: 'coach';
    stats: { label: string; value: string }[];
    description: string;
    transformations: { clientName: string; duration: string; image: string }[];
    credentials: { certifications: string[]; specializations: string[] };
    plans?: ProfilePlan[];
    specializations?: string[];
}

export interface GymProfileViewModel extends ProfileViewBase {
    type: 'gym';
    memberCount: string;
    description: string;
    programs: string[];
    images: string[];
    plans?: ProfilePlan[];
}

export interface ClientProfileViewModel extends ProfileViewBase {
    type: 'client';
    goal: string;
    progress: number;
    weight: { current: string; target: string };
    stats: { label: string; value: string }[];
    recentActivity: { activity: string; time: string }[];
}

export interface EditProfileFormProps {
    profile: UserProfile;
}

export interface ClientEditFormProps {
    profile: ClientProfile;
}

export interface CoachEditFormProps {
    profile: CoachProfile;
}

export interface GymEditFormProps {
    profile: GymProfile;
}

export interface GalleryEditorProps {
    images: EditableImage[];
    onChange: (images: EditableImage[]) => void;
    onUploadingChange?: (isUploading: boolean) => void;
    title?: string;
}

export interface CoachCredentialsProps {
    specializations: string[];
    isOwner?: boolean;
}

export interface CoachPhilosophyProps {
    description: string;
    onGoToPlans?: () => void;
    isOwner?: boolean;
}

export interface CoachProfileHeaderProps {
    name: string;
    stats: { label: string; value: string }[];
    image: string;
    isOwner?: boolean;
    coachId?: string;
    coachUserId?: string;
    stories?: import('@/features/stories/types').Story[];
    specializations?: string[];
    email?: string;
    status?: PresenceStatus;
}

export interface TransformationItem {
    id: string;
    name: string;
    duration: string;
    image: string | File;
    uploadedPath?: string;
}

export interface TransformationEditorProps {
    transformations: TransformationItem[];
    onChange: (transformations: TransformationItem[]) => void;
    onUploadingChange?: (isUploading: boolean) => void;
}

export interface ProfilePostsProps {
    profileType: 'coach' | 'gym';
    profileId: string;
    ownerName?: string;
    isOwner?: boolean;
    viewAllHref?: string;
}
