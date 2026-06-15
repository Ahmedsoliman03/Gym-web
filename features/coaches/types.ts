import type { Story } from '@/features/stories/types';
import type { PresenceStatus } from '@/features/chat/types';
import type {
    CoachTransformation,
    ProfilePlan,
    SocialMediaLink,
} from '@/features/profile/types';

export interface Coach {
    id: string;
    fullName: string;
    experienceYears: number;
    specialization: string[];
    photo: string | null;
    city?: string;
    area?: string;
    isCurrentUser?: boolean;
}

export interface CoachCertification {
    id?: string;
    file: string;
    createdAt?: string;
}

export interface CoachDetail {
    id: string;
    /** Owner's `User.id` — the same id `/api/me` returns at top level.
     *  The detail endpoint is keyed by profile id, but chat/messaging
     *  must use the User.id, so the backend exposes it as `userId`. */
    userId: string;
    fullName: string;
    experienceYears: number;
    /** Number of clients the coach is currently training. Surfaced in the
     *  detail header stats alongside experience. */
    numberOfClients?: number;
    /** The detail endpoint returns the singular field `specialization`
     *  (even though /me uses the plural `specializations`). Mirror the
     *  actual wire shape so consumers don't read `undefined`. */
    specialization: string[];
    description: string;
    photo: string | null;
    certifications: CoachCertification[];
    plans?: ProfilePlan[];
    transformations?: CoachTransformation[];
    stories?: Story[];
    status?: PresenceStatus;
    socialMedia?: SocialMediaLink[];
}

export interface CoachDetailViewProps {
    id: string;
}

export interface CoachesFilterProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    selectedSpecialty: string;
    setSelectedSpecialty: (val: string) => void;
    experience: string;
    setExperience: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    area: string;
    setArea: (val: string) => void;
    onDetectLocation: () => void;
    isDetectingLocation?: boolean;
    isLocationActive?: boolean;
    onResetLocation?: () => void;
}

export interface ExperienceDropdownProps {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    onClear?: () => void;
}

export interface SpecializationDropdownProps {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder: string;
    onClear?: () => void;
}
