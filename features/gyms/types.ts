export interface Gym {
    id: string;
    gymName: string;
    city: string;
    area: string;
    location: string;
    mainPhoto: string | null;
}

export interface GymDetail {
    id: string;
    gymName: string;
    location: string;
    memberCount: number;
    mainPhoto: string | null;
}
