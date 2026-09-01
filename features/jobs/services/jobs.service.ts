import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { plansKeys } from '@/features/plans/services/plans.service';
import type {
    ApplyJobInput,
    CreateJobInput,
    EditJobInput,
    Job,
    JobSaver,
} from '../types';

// ─── Response shapes ──────────────────────────────────────────────────────────

type RawJobList =
    | Job[]
    | { items?: Job[]; results?: Job[]; data?: Job[]; jobs?: Job[] };

const unwrapList = (data: RawJobList): Job[] => {
    if (Array.isArray(data)) return data.filter(Boolean);
    return (data.items ?? data.results ?? data.data ?? data.jobs ?? []).filter(Boolean);
};

// ─── Listings ─────────────────────────────────────────────────────────────────

export const getJobs = async (): Promise<Job[]> => {
    const { data } = await api.get<RawJobList>('/api/jobs');
    return unwrapList(data);
};

export const useJobs = () =>
    useQuery<Job[]>({ queryKey: ['jobs'], queryFn: getJobs });

export const getMyJobs = async (): Promise<Job[]> => {
    const { data } = await api.get<RawJobList>('/api/jobs/mine');
    return unwrapList(data);
};

export const useMyJobs = (enabled = true) =>
    useQuery<Job[]>({
        queryKey: ['jobs', 'mine'],
        queryFn: getMyJobs,
        enabled,
    });

export const getSavedJobs = async (): Promise<Job[]> => {
    const { data } = await api.get<RawJobList>('/api/jobs/saved');
    return unwrapList(data);
};

export const useSavedJobs = (enabled = true) =>
    useQuery<Job[]>({
        queryKey: ['jobs', 'saved'],
        queryFn: getSavedJobs,
        enabled,
    });

// ─── Details ──────────────────────────────────────────────────────────────────

export const getJob = async (jobId: string): Promise<Job> => {
    const { data } = await api.get<Job>(`/api/jobs/${jobId}`);
    return data;
};

export const useJob = (jobId: string | null) =>
    useQuery<Job>({
        queryKey: ['jobs', jobId],
        queryFn: () => getJob(jobId as string),
        enabled: !!jobId,
    });

// ─── Create / edit / delete / close / reopen ─────────────────────────────────

export const createJob = async (input: CreateJobInput): Promise<Job> => {
    // `image` is an R2 file path (temp/...) produced by the direct-upload flow;
    // the backend accepts it as a plain string field (see upload-img.md / postman README).
    const { data } = await api.post<Job>('/api/jobs', {
        title: input.title,
        specialization: input.specialization,
        content: input.content,
        ...(input.image ? { image: input.image } : {}),
    });
    return data;
};

export const useCreateJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', 'mine'] });
            // Posting a job consumes the `job_post` feature — refresh usage.
            queryClient.invalidateQueries({ queryKey: plansKeys.usage });
        },
    });
};

export const editJob = async (input: EditJobInput): Promise<Job> => {
    const { data } = await api.patch<Job>(`/api/jobs/${input.jobId}`, {
        content: input.content,
    });
    return data;
};

export const useEditJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: editJob,
        onSuccess: (updated) => {
            queryClient.setQueryData(['jobs', updated.id], updated);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', 'mine'] });
        },
    });
};

export const deleteJob = async (jobId: string): Promise<void> => {
    await api.delete(`/api/jobs/${jobId}`, {
        transformResponse: (data) => data,
    });
};

export const useDeleteJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteJob,
        onSuccess: (_data, jobId) => {
            // Drop the job from every cached list view so it disappears at once.
            (['jobs', ['jobs', 'mine'], ['jobs', 'saved']] as const).forEach(
                (key) => {
                    queryClient.setQueriesData<Job[] | undefined>(
                        { queryKey: Array.isArray(key) ? key : [key], exact: true },
                        (curr) => (Array.isArray(curr) ? curr.filter((j) => j.id !== jobId) : curr),
                    );
                },
            );
            queryClient.removeQueries({ queryKey: ['jobs', jobId] });
        },
    });
};

export const closeJob = async (jobId: string): Promise<void> => {
    await api.post(`/api/jobs/${jobId}/close`, undefined, {
        transformResponse: (data) => data,
    });
};

const applyJobClosedTransition = (job: Job, jobId: string, closedAt: string): Job =>
    job.id === jobId ? { ...job, status: 'closed', closedAt } : job;

const applyJobReopenedTransition = (job: Job, jobId: string): Job =>
    job.id === jobId ? { ...job, status: 'open', closedAt: null } : job;

export const useCloseJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: closeJob,
        onMutate: async (jobId) => {
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previous = queryClient.getQueriesData<Job[] | Job | undefined>({
                queryKey: ['jobs'],
            });
            const closedAt = new Date().toISOString();

            queryClient.setQueriesData<Job[] | undefined>(
                { queryKey: ['jobs'] },
                (curr) =>
                    Array.isArray(curr)
                        ? curr.map((j) => applyJobClosedTransition(j, jobId, closedAt))
                        : curr,
            );
            queryClient.setQueryData<Job | undefined>(['jobs', jobId], (curr) =>
                curr ? applyJobClosedTransition(curr, jobId, closedAt) : curr,
            );

            return { previous };
        },
        onError: (_err, _jobId, ctx) => {
            ctx?.previous?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSettled: (_data, _err, jobId) => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
        },
    });
};

export const reopenJob = async (jobId: string): Promise<void> => {
    await api.post(`/api/jobs/${jobId}/reopen`, undefined, {
        transformResponse: (data) => data,
    });
};

export const useReopenJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: reopenJob,
        onMutate: async (jobId) => {
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previous = queryClient.getQueriesData<Job[] | Job | undefined>({
                queryKey: ['jobs'],
            });

            queryClient.setQueriesData<Job[] | undefined>(
                { queryKey: ['jobs'] },
                (curr) =>
                    Array.isArray(curr)
                        ? curr.map((j) => applyJobReopenedTransition(j, jobId))
                        : curr,
            );
            queryClient.setQueryData<Job | undefined>(['jobs', jobId], (curr) =>
                curr ? applyJobReopenedTransition(curr, jobId) : curr,
            );

            return { previous };
        },
        onError: (_err, _jobId, ctx) => {
            ctx?.previous?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSettled: (_data, _err, jobId) => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['jobs', jobId] });
        },
    });
};

// ─── Save / share ─────────────────────────────────────────────────────────────

export const saveJob = async ({
    jobId,
    saved,
}: {
    jobId: string;
    saved: boolean;
}): Promise<void> => {
    await api.post(`/api/jobs/${jobId}/save`, { saved });
};

/** Apply a save transition to one job. Pure. */
const applyJobSaveTransition = (job: Job, nextSaved: boolean): Job => {
    const prev = job.isSaved ?? false;
    if (prev === nextSaved) return job;
    const delta = nextSaved ? 1 : -1;
    return {
        ...job,
        isSaved: nextSaved,
        savesCount: Math.max(0, (job.savesCount ?? 0) + delta),
    };
};

export const useSaveJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveJob,
        onMutate: async ({ jobId, saved }) => {
            await queryClient.cancelQueries({ queryKey: ['jobs'] });

            const prev: { key: unknown[]; data: Job[] | undefined }[] = [];
            queryClient
                .getQueriesData<Job[] | undefined>({ queryKey: ['jobs'] })
                .forEach(([key, data]) => {
                    prev.push({ key: key as unknown[], data });
                });
            const prevDetail = queryClient.getQueryData<Job>(['jobs', jobId]);

            queryClient.setQueriesData<Job[] | undefined>(
                { queryKey: ['jobs'] },
                (curr) =>
                    Array.isArray(curr)
                        ? curr.map((j) =>
                              j.id === jobId ? applyJobSaveTransition(j, saved) : j,
                          )
                        : curr,
            );

            if (prevDetail) {
                queryClient.setQueryData<Job>(
                    ['jobs', jobId],
                    applyJobSaveTransition(prevDetail, saved),
                );
            }

            return { prev, prevDetail };
        },
        onError: (_err, { jobId }, ctx) => {
            ctx?.prev.forEach(({ key, data }) => {
                queryClient.setQueryData(key, data);
            });
            if (ctx?.prevDetail !== undefined) {
                queryClient.setQueryData(['jobs', jobId], ctx.prevDetail);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs', 'saved'] });
        },
    });
};

// ─── Job savers (gym-owner-only — see JobSaversView) ───────────────────────────

interface RawJobSaversResponse {
    savesCount?: number;
    savers?: JobSaver[];
}

export interface JobSaversResponse {
    savesCount: number;
    savers: JobSaver[];
}

export const getJobSavers = async (jobId: string): Promise<JobSaversResponse> => {
    const { data } = await api.get<RawJobSaversResponse>(`/api/jobs/${jobId}/saves`);
    const savers = data.savers ?? [];
    return { savesCount: data.savesCount ?? savers.length, savers };
};

export const useJobSavers = (jobId: string | null, enabled = true) =>
    useQuery<JobSaversResponse>({
        queryKey: ['jobs', 'savers', jobId],
        queryFn: () => getJobSavers(jobId as string),
        enabled: enabled && !!jobId,
    });

export const shareJob = async (jobId: string): Promise<void> => {
    await api.post(`/api/jobs/${jobId}/share`);
};

const applyJobShareIncrement = (job: Job): Job => ({
    ...job,
    sharesCount: (job.sharesCount ?? 0) + 1,
});

export const useShareJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: shareJob,
        onMutate: async (jobId) => {
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            queryClient.setQueriesData<Job[] | undefined>(
                { queryKey: ['jobs'] },
                (curr) =>
                    Array.isArray(curr)
                        ? curr.map((j) =>
                              j.id === jobId ? applyJobShareIncrement(j) : j,
                          )
                        : curr,
            );
            const prevDetail = queryClient.getQueryData<Job>(['jobs', jobId]);
            if (prevDetail) {
                queryClient.setQueryData<Job>(
                    ['jobs', jobId],
                    applyJobShareIncrement(prevDetail),
                );
            }
        },
    });
};

// ─── Apply ────────────────────────────────────────────────────────────────────

export const applyForJob = async (input: ApplyJobInput & { cv: File | string }): Promise<void> => {
    const formData = new FormData();
    formData.append('fullName', input.fullName);
    formData.append('email', input.email);
    formData.append('whatsappNumber', input.whatsappNumber);
    formData.append('headline', input.headline);
    formData.append('cv', input.cv);

    await api.post(`/api/jobs/${input.jobId}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const applyJobAppliedTransition = (job: Job, jobId: string): Job =>
    job.id === jobId && !job.isApplied
        ? {
              ...job,
              isApplied: true,
              applicationsCount: (job.applicationsCount ?? 0) + 1,
          }
        : job;

export const useApplyForJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: applyForJob,
        onMutate: async (vars) => {
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previous = queryClient.getQueriesData<Job[] | Job | undefined>({
                queryKey: ['jobs'],
            });

            queryClient.setQueriesData<Job[] | undefined>(
                { queryKey: ['jobs'] },
                (curr) =>
                    Array.isArray(curr)
                        ? curr.map((j) => applyJobAppliedTransition(j, vars.jobId))
                        : curr,
            );
            queryClient.setQueryData<Job | undefined>(
                ['jobs', vars.jobId],
                (curr) => (curr ? applyJobAppliedTransition(curr, vars.jobId) : curr),
            );

            return { previous };
        },
        onError: (_err, _vars, ctx) => {
            // Restore every snapshotted cache entry on failure.
            ctx?.previous?.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSuccess: () => {
            // A successful apply consumes the `apply_job` feature — refresh usage.
            queryClient.invalidateQueries({ queryKey: plansKeys.usage });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};
