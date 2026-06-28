import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { plansKeys } from '@/features/plans/services/plans.service';
import type {
    ApplyJobInput,
    CreateJobInput,
    EditJobInput,
    Job,
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
    // Per postman README: the create-job endpoint accepts `title`, `content`,
    // `specialization`, `image`. `location` is auto-derived from the gym
    // profile (`area, city`) server-side, so we MUST NOT send it from here.
    const formData = new FormData();
    formData.append('title', input.title);
    formData.append('specialization', input.specialization);
    formData.append('content', input.content);
    if (input.image) formData.append('image', input.image);

    const { data } = await api.post<Job>('/api/jobs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
    // The close endpoint replies 200 but may send an empty (or partial) body.
    // `transformResponse: identity` stops Axios from trying to JSON-parse it,
    // which otherwise surfaced a false "close failed" error on a successful
    // request. We don't use the body — the optimistic patch + refetch below
    // own the cache update.
    await api.post(`/api/jobs/${jobId}/close`, undefined, {
        transformResponse: (data) => data,
    });
};

/** Mark a job closed in-place, preserving every other field (counts, gym,
 *  etc.). Closing must never wipe `applicationsCount` / `savesCount` /
 *  `sharesCount`, so we patch rather than replace with the server payload. */
const applyJobClosedTransition = (job: Job, jobId: string, closedAt: string): Job =>
    job.id === jobId ? { ...job, status: 'closed', closedAt } : job;

const applyJobReopenedTransition = (job: Job, jobId: string): Job =>
    job.id === jobId ? { ...job, status: 'open', closedAt: null } : job;

export const useCloseJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: closeJob,
        // Optimistically flip the job to closed everywhere it's cached, keeping
        // its counts intact. Snapshot first so we can roll back on failure.
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
            // Resync this job (and lists) with the server's authoritative copy —
            // which keeps the counts correct after the optimistic patch.
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

            // The ['jobs'] prefix also matches the single-Job detail query
            // (['jobs', id]), so guard against non-array entries before mapping.
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
            // The ['jobs'] prefix also matches the single-Job detail query
            // (['jobs', id]), so guard against non-array entries before mapping.
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

export const applyForJob = async (input: ApplyJobInput): Promise<void> => {
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

/** Flip `isApplied` to true and bump `applicationsCount` on the matching job.
 *  Guarded on `isApplied` so re-runs (or a server refetch racing the optimistic
 *  patch) can't double-count the same application. */
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
        // Optimistic: swap the Apply button to "Already applied" AND increment
        // the applicant count everywhere the job is rendered, before the request
        // resolves. Snapshot first so we can roll back if the apply fails.
        onMutate: async (vars) => {
            await queryClient.cancelQueries({ queryKey: ['jobs'] });
            const previous = queryClient.getQueriesData<Job[] | Job | undefined>({
                queryKey: ['jobs'],
            });

            // Patch every cached list view (feed, mine, saved, and any future
            // list under the ['jobs'] root). The ['jobs'] prefix also matches
            // the single-Job detail query (['jobs', id]), so guard against
            // non-array entries before mapping.
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
            // Resync with the server's authoritative counts, and refresh the
            // coach's own applications list so the new application shows up.
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });
};
