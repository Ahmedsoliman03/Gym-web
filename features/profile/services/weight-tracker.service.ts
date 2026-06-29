import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import type { GoalMode, WeightLog } from '../components/WeightProgress/types';

export interface WeightTracker {
    goalWeight: number | null;
    goalMode: GoalMode;
    logs: WeightLog[];
}

export const weightTrackerKeys = {
    tracker: ['weight-tracker'] as const,
};

export const getWeightTracker = async (): Promise<WeightTracker> => {
    const { data } = await api.get<WeightTracker>('/api/me/weight-tracker');
    return data;
};

export const useWeightTracker = (enabled = true) =>
    useQuery<WeightTracker>({
        queryKey: weightTrackerKeys.tracker,
        queryFn: getWeightTracker,
        enabled,
    });

const setTracker = (qc: ReturnType<typeof useQueryClient>, tracker: WeightTracker) =>
    qc.setQueryData(weightTrackerKeys.tracker, tracker);

/** Upsert a dated weight entry (re-posting a date overwrites its weight). */
export const useUpsertWeightLogMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { date: string; weight: number }) => {
            const { data } = await api.post<WeightLog>('/api/me/weight-tracker/logs', payload);
            return data;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: weightTrackerKeys.tracker }),
    });
};

export const useDeleteWeightLogMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/me/weight-tracker/logs/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: weightTrackerKeys.tracker }),
    });
};

export const useClearWeightLogsMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.delete('/api/me/weight-tracker/logs');
        },
        onSuccess: () => {
            const current = qc.getQueryData<WeightTracker>(weightTrackerKeys.tracker);
            if (current) setTracker(qc, { ...current, logs: [] });
        },
    });
};

export const useUpdateWeightGoalMutation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { goalWeight: number; goalMode: GoalMode }) => {
            const { data } = await api.patch<WeightTracker>('/api/me/weight-tracker', payload);
            return data;
        },
        onSuccess: (tracker) => setTracker(qc, tracker),
    });
};
