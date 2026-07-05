import { serverApiGet } from '@/utils/server-fetch';
import type { Coach, CoachDetail } from '../types';

// Server-side counterparts of getCoaches/getCoach (coaches.service.ts). Both
// endpoints return the payload directly (no transform), so the shapes match the
// client queryFns exactly and hydration is a straight handoff.

export const getCoachesServer = (): Promise<Coach[]> => serverApiGet<Coach[]>('coaches');

export const getCoachServer = (id: string): Promise<CoachDetail> =>
    serverApiGet<CoachDetail>(`coaches/${id}`);
