import type { Job } from '@/features/jobs/types';


export interface ApplicationCoach {
    id: string;
    fullName: string;
    experienceYears?: number;
    specialization: string[];
    photo: string | null;
}


export interface JobApplication {
    id: string;
    fullName: string;
    email: string;
    whatsappNumber: string;
    headline: string;
    cv: string;
    cvViewed: boolean;
    cvViewedAt: string | null;
    appliedAt: string;
    coach: ApplicationCoach;
    job: Job;
}
