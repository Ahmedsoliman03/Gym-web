export type JobStatus = 'open' | 'closed';

/** A user who saved a job — can be any account type (client/coach/gym
 * browsing jobs), mirrors community's PostAuthor shape. */
export interface JobSaverUser {
    id: string;
    profileId: string;
    fullName: string;
    userType: 'coach' | 'gym' | 'client';
    photo?: string | null;
}

export interface JobSaver {
    user: JobSaverUser;
    savedAt?: string;
}

export interface JobGym {
    id: string;
    gymName: string;
    city?: string;
    area?: string;
    mainPhoto?: string | null;
}

export interface Job {
    id: string;
    title: string;
    location: string;
    content: string;
    salary?: string;
    specialization: string[];
    image: string | null;
    status: JobStatus;
    gym: JobGym;
    sharesCount?: number;
    savesCount?: number;
    applicationsCount?: number;
    isSaved?: boolean;
    isApplied?: boolean;
    createdAt?: string;
    closedAt?: string | null;
    updatedAt?: string;
}

export interface CreateJobInput {
    title: string;
    specialization: string;
    content: string;
    /** R2 file path returned by the uploads/generate flow (see upload-img.md). */
    image: string | null;
}

export interface EditJobInput {
    jobId: string;
    content: string;
}

export interface ApplyJobInput {
    jobId: string;
    fullName: string;
    email: string;
    whatsappNumber: string;
    headline: string;
    cv: File;
}
