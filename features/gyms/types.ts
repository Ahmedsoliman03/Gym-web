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
    gymName: string;
    location: string;
    memberCount: number;
    mainPhoto: string | null;
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
