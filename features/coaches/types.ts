export interface Coach {
    id: string;
    fullName: string;
    experienceYears: number;
    specialization: string[];
    photo: string | null;
    city?: string;
    area?: string;
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
    onDetectLocation: () => void;
    isDetectingLocation?: boolean;
    onResetLocation?: () => void;
}

export interface ExperienceDropdownProps {
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
}

export interface SpecializationDropdownProps {
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder: string;
}
