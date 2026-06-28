import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { ClientDetail } from '../types';

export const getClient = async (id: string): Promise<ClientDetail> => {
    const { data } = await api.get<ClientDetail>(`/api/clients/${id}`);
    return data;
};

export const useClient = (id: string) => {
    return useQuery<ClientDetail>({
        queryKey: ['clients', id],
        queryFn: () => getClient(id),
        enabled: Boolean(id),
    });
};
