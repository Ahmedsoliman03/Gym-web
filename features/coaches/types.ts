export interface Coach {
    id: string;
    fullName: string;
    experienceYears: number;
    specialization: string[];
    photo: string | null;
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
