import type { PresenceStatus } from '@/features/chat/types';

export interface ClientWeightLog {
    id: string;
    date: string;
    weight: number;
}

/** Weight-tracker data surfaced on the client-details page (body-analytics chart). */
export interface ClientWeightTracker {
    goalWeight: number | null;
    goalMode: 'lose' | 'gain';
    goalAchieved: boolean;
    logs: ClientWeightLog[];
}

export interface ClientDetail {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    city?: string;
    area?: string;
    location?: string;
    photo: string | null;
    status?: PresenceStatus;
    weightTracker?: ClientWeightTracker;
    created_at?: string;
    updated_at?: string;
}

export interface ClientDetailViewProps {
    id: string;
}
