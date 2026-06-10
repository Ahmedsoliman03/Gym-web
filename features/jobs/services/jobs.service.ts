import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
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

// ─── Create / edit / delete / close ───────────────────────────────────────────

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
    await api.delete(`/api/jobs/${jobId}`);
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
                        { queryKey: Array.isArray(key) ? key : [key] },
                        (curr) => (curr ? curr.filter((j) => j.id !== jobId) : curr),
                    );
                },
            );
            queryClient.removeQueries({ queryKey: ['jobs', jobId] });
        },
    });
};

export const closeJob = async (jobId: string): Promise<Job> => {
    const { data } = await api.post<Job>(`/api/jobs/${jobId}/close`);
    return data;
};

export const useCloseJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: closeJob,
        onSuccess: (updated) => {
            // Replace the job in every cached list with the updated payload so
            // its `status: 'closed'` propagates instantly.
            (['jobs', ['jobs', 'mine']] as const).forEach((key) => {
                queryClient.setQueriesData<Job[] | undefined>(
                    { queryKey: Array.isArray(key) ? key : [key] },
                    (curr) =>
                        curr
                            ? curr.map((j) => (j.id === updated.id ? updated : j))
                            : curr,
                );
            });
            queryClient.setQueryData(['jobs', updated.id], updated);
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
                    curr
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
            queryClient.setQueriesData<Job[] | undefined>(
                { queryKey: ['jobs'] },
                (curr) =>
                    curr
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

/** Flip `isApplied` to true on the matching job inside any cached list. */
const applyJobAppliedTransition = (job: Job, jobId: string): Job =>
    job.id === jobId ? { ...job, isApplied: true } : job;

export const useApplyForJobMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: applyForJob,
        onSuccess: (_data, vars) => {
            // Patch every cached list view (feed, mine, saved, and any future
            // list under the ['jobs'] root) so the Apply button swaps to the
            // "Already applied" pill everywhere the same job is rendered.
            queryClient.setQueriesData<Job[] | undefined>(
                { queryKey: ['jobs'] },
                (curr) =>
                    curr
                        ? curr.map((j) => applyJobAppliedTransition(j, vars.jobId))
                        : curr,
            );
            queryClient.setQueryData<Job | undefined>(
                ['jobs', vars.jobId],
                (curr) => (curr ? { ...curr, isApplied: true } : curr),
            );
        },
    });
};
