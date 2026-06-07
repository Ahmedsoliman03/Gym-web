export type JobStatus = 'open' | 'closed';

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
    /** Increments when anyone calls the share endpoint. */
    sharesCount?: number;
    /** Excludes the author. */
    savesCount?: number;
    /** Total applications submitted to this job. */
    applicationsCount?: number;
    isSaved?: boolean;
    /** Coach-side: whether the current user already applied. */
    hasApplied?: boolean;
    createdAt?: string;
    /** Non-null timestamp means the job is closed for applications. */
    closedAt?: string | null;
    updatedAt?: string;
}

export interface CreateJobInput {
    title: string;
    specialization: string;
    content: string;
    image: File | null;
}

export interface EditJobInput {
    jobId: string;
    /** Only the editable fields per the README. */
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
