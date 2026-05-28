import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Gym } from '../types';

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
