import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';

export const getCoaches = async () => {
    const { data } = await api.get('/api/coaches');
    return data;
};

export const useCoaches = () => {
    return useQuery({
        queryKey: ['coaches'],
        queryFn: getCoaches,
    });
};
