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
    createdAt?: string;
    updatedAt?: string;
}

export interface CoachTransformation {
    id: string;
    clientName: string;
    /** Free-form duration label returned by the API, e.g. `"8 years"`. */
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
}

export interface CoachProfileData {
    id: string;
    type: 'coach';
    name: string;
    experienceYears?: number;
    specializations?: string[];
    description?: string;
    profileImage?: string | null;
    photo: string | null;
    certifications?: Certification[];
    plans?: ProfilePlan[];
    transformations?: CoachTransformation[];
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
    images?: GalleryImage[];
    plans?: ProfilePlan[];
    createdAt?: string;
    updatedAt?: string;
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

// ── Edit Profile value shapes ─────────────────────────────────────────────────
// Used by `buildEditProfileFormData` in services/profile.service.ts to
// translate form state into the multipart contract `PATCH /api/me` expects.

/** A gallery / certification item the user is editing.
 *  - `id` present  → keep this existing item.
 *  - `file` present → upload it as a new file.
 *  Items with neither are silently dropped. */
export interface EditableImage {
    id?: string;
    url?: string;
    file?: File;
}

/** Transformation row mid-edit. `image` is either a URL (existing) or a
 *  File (newly picked); the builder maps File entries into repeated
 *  `transformation_images` slots and tags each meta row with `imageIndex`. */
export interface EditableTransformation {
    id: string;
    clientName: string;
    /** Free-form duration label, e.g. `"8 years"`. Matches the API contract. */
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
}

export interface GymEditValues {
    name?: string;
    image?: File | null;
    description?: string;
    specializations?: string[];
    gymImages?: EditableImage[];
    plans?: ProfilePlan[];
}

export type EditProfileValues =
    | { role: 'client'; values: ClientEditValues }
    | { role: 'coach';  values: CoachEditValues }
    | { role: 'gym';    values: GymEditValues };

// ── View models ──────────────────────────────────────────────────────────────
// Shapes the profile/coach/gym view components consume. They're flattened,
// translated, and image-defaulted versions of the wire types above — each
// detail/profile page maps API responses into these before rendering.

export type ProfileViewType = 'coach' | 'gym' | 'client';

export interface ProfileViewBase {
    id: string;
    type: ProfileViewType;
    name: string;
    image: string;
    banner?: string;
    location?: string;
}

export interface CoachProfileViewModel extends ProfileViewBase {
    type: 'coach';
    stats: { label: string; value: string }[];
    description: string;
    transformations: { clientName: string; duration: string; image: string }[];
    credentials: { certifications: string[]; specializations: string[] };
    plans?: ProfilePlan[];
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

// ── Component props ──────────────────────────────────────────────────────────

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
    /** Active stories carried on the detail response; rendered through the
     *  story-avatar badge if present. */
    stories?: import('@/features/stories/types').Story[];
}

export interface TransformationItem {
    id: string;
    name: string;
    /** Free-form duration label, e.g. "8 years". Sent as-is to the API. */
    duration: string;
    /** Either a server-hosted URL (existing transformation) or a freshly
     *  picked File that will be uploaded on save. */
    image: string | File;
}

export interface TransformationEditorProps {
    transformations: TransformationItem[];
    onChange: (transformations: TransformationItem[]) => void;
}

export interface ProfilePostsProps {
    profileType: 'coach' | 'gym';
    /** The coach/gym **profile id** (CoachProfile.id / GymProfile.id). */
    profileId: string;
    /** Owner display name — used in the section header ("Posts of {name}"). */
    ownerName?: string;
    isOwner?: boolean;
    /** Where the "See all posts" link points. Defaults to `/my-posts` for the
     *  owner's own profile page; pass an explicit href when reusing this on
     *  someone else's coach/gym detail page. */
    viewAllHref?: string;
}
