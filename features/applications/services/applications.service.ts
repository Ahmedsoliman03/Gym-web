import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { plansKeys } from '@/features/plans/services/plans.service';
import type { JobApplication } from '../types';

// ─── Response shapes ──────────────────────────────────────────────────────────

type RawApplicationList =
    | JobApplication[]
    | {
          items?: JobApplication[];
          results?: JobApplication[];
          data?: JobApplication[];
          applications?: JobApplication[];
      };

const unwrapList = (data: RawApplicationList): JobApplication[] => {
    if (Array.isArray(data)) return data.filter(Boolean);
    return (
        data.items ??
        data.results ??
        data.data ??
        data.applications ??
        []
    ).filter(Boolean);
};

// ─── Listings ─────────────────────────────────────────────────────────────────

/** Gym-only: every application across all the gym's job posts. */
export const getMyJobsApplications = async (): Promise<JobApplication[]> => {
    const { data } = await api.get<RawApplicationList>(
        '/api/jobs/mine/applications',
    );
    return unwrapList(data);
};

export const useMyJobsApplications = (enabled = true) =>
    useQuery<JobApplication[]>({
        queryKey: ['applications', 'mine-jobs'],
        queryFn: getMyJobsApplications,
        enabled,
    });

/** Gym-only: applications for a single job post. */
export const getJobApplications = async (
    jobId: string,
): Promise<JobApplication[]> => {
    const { data } = await api.get<RawApplicationList>(
        `/api/jobs/${jobId}/applications`,
    );
    return unwrapList(data);
};

export const useJobApplications = (jobId: string | null) =>
    useQuery<JobApplication[]>({
        queryKey: ['applications', 'by-job', jobId],
        queryFn: () => getJobApplications(jobId as string),
        enabled: !!jobId,
    });

/** Coach-only: the current coach's own applications. */
export const getMyApplications = async (): Promise<JobApplication[]> => {
    const { data } = await api.get<RawApplicationList>(
        '/api/jobs/applications/mine',
    );
    return unwrapList(data);
};

export const useMyApplications = (enabled = true) =>
    useQuery<JobApplication[]>({
        queryKey: ['applications', 'mine-coach'],
        queryFn: getMyApplications,
        enabled,
    });

// ─── Mark CV viewed ───────────────────────────────────────────────────────────

export const markCvViewed = async (applicationId: string): Promise<void> => {
    await api.post(`/api/job-applications/${applicationId}/view-cv`);
};

/** Flip an application's CV-viewed flag locally for all caches. */
const applyCvViewedTransition = (
    apps: JobApplication[] | undefined,
    applicationId: string,
): JobApplication[] | undefined => {
    if (!apps) return apps;
    return apps.map((app) =>
        app.id === applicationId
            ? {
                  ...app,
                  cvViewed: true,
                  cvViewedAt: app.cvViewedAt ?? new Date().toISOString(),
              }
            : app,
    );
};

export const useMarkCvViewedMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markCvViewed,
        onMutate: async (applicationId) => {
            await queryClient.cancelQueries({ queryKey: ['applications'] });
            queryClient.setQueriesData<JobApplication[] | undefined>(
                { queryKey: ['applications'] },
                (curr) => applyCvViewedTransition(curr, applicationId),
            );
        },
        onError: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: plansKeys.usage });
        },
    });
};
