import type { Story } from '@/features/stories/types';

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
    file: string;
}

export interface CoachDetail {
    id: string;
    fullName: string;
    experienceYears: number;
    specialization: string[];
    description: string;
    photo: string | null;
    certifications: CoachCertification[];
    stories?: Story[];
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
