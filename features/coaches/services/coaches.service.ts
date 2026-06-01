import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Coach, CoachDetail } from '../types';

export const getCoaches = async (): Promise<Coach[]> => {
    const { data } = await api.get<Coach[]>('/api/coaches');
    return data;
};

export const useCoaches = () => {
    return useQuery<Coach[]>({
        queryKey: ['coaches'],
        queryFn: getCoaches,
    });
};

export const getCoach = async (id: string): Promise<CoachDetail> => {
    const { data } = await api.get<CoachDetail>(`/api/coaches/${id}`);
    return data;
};

export const useCoach = (id: string) => {
    return useQuery<CoachDetail>({
        queryKey: ['coaches', id],
        queryFn: () => getCoach(id),
        enabled: Boolean(id),
    });
};
