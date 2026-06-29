import type { PresenceStatus } from '@/features/chat/types';

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
    created_at?: string;
    updated_at?: string;
}

export interface ClientDetailViewProps {
    id: string;
}
