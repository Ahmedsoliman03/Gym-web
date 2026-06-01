import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Gym, GymDetail } from '../types';

export const getGyms = async (): Promise<Gym[]> => {
    const { data } = await api.get<Gym[]>('/api/gyms');
    return data;
};

export const useGyms = () => {
    return useQuery<Gym[]>({
        queryKey: ['gyms'],
        queryFn: getGyms,
    });
};

export const getGym = async (id: string): Promise<GymDetail> => {
    const { data } = await api.get<GymDetail>(`/api/gyms/${id}`);
    return data;
};

export const useGym = (id: string) => {
    return useQuery<GymDetail>({
        queryKey: ['gyms', id],
        queryFn: () => getGym(id),
        enabled: Boolean(id),
    });
};
