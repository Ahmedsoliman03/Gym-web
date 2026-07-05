import { serverApiGet } from '@/utils/server-fetch';
import type { Gym, GymDetail } from '../types';

// Server-side counterparts of getGyms/getGym (gyms.service.ts). Both endpoints
// return the payload directly (no transform), so the shapes match the client
// queryFns exactly.

export const getGymsServer = (): Promise<Gym[]> => serverApiGet<Gym[]>('gyms');

export const getGymServer = (id: string): Promise<GymDetail> =>
    serverApiGet<GymDetail>(`gyms/${id}`);
