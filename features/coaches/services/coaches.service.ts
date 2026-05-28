import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Coach } from '../types';

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
