import type { PresenceStatus } from '@/features/chat/types';

/** Public client profile returned by `GET /api/clients/{id}`
 *  (apps/clients/serializers.py → ClientDetailSerializer). The endpoint is
 *  keyed by the client *profile* id; `userId` carries the `User.id` needed for
 *  chat/messaging (mirrors the coach/gym detail contract). */
export interface ClientDetail {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    city?: string;
    area?: string;
    /** Pre-joined "area, city" string from the backend. */
    location?: string;
    photo: string | null;
    status?: PresenceStatus;
    created_at?: string;
    updated_at?: string;
}

export interface ClientDetailViewProps {
    id: string;
}
