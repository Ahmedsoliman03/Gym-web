import type { Story } from '@/features/stories/types';
import type { PresenceStatus } from '@/features/chat/types';
import type { GalleryImage, ProfilePlan, SocialMediaLink } from '@/features/profile/types';

export interface Gym {
    id: string;
    gymName: string;
    city: string;
    area: string;
    location: string;
    mainPhoto: string | null;
    isCurrentUser?: boolean;
}

export interface GymDetail {
    id: string;
    /** Owner's `User.id` — the same id `/api/me` returns at top level.
     *  The detail endpoint is keyed by profile id, but chat/messaging
     *  must use the User.id, so the backend exposes it as `userId`. */
    userId: string;
    gymName: string;
    location: string;
    memberCount: number;
    mainPhoto: string | null;
    description?: string;
    contactPerson?: string;
    city?: string;
    area?: string;
    address?: string;
    photo?: string | null;
    specializations?: string[];
    images?: GalleryImage[];
    plans?: ProfilePlan[];
    /** Per postman README: gym detail responses include the gym's active stories. */
    stories?: Story[];
    status?: PresenceStatus;
    socialMedia?: SocialMediaLink[];
}

export interface GymCardProps {
    gym: Gym;
    index: number;
}

export interface GymDetailViewProps {
    id: string;
}

export interface GymsFilterProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    area: string;
    setArea: (val: string) => void;
    onDetectLocation: () => void;
    isDetectingLocation?: boolean;
    isLocationActive?: boolean;
}
