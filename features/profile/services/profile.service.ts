import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { chatKeys } from '@/features/chat/services/chat.service';
import { plansKeys } from '@/features/plans/services/plans.service';
import type { ChatConversation, ChatRequest } from '@/features/chat/types';
import type { EditProfileValues, ProfilePlan, SocialMediaLink, UserProfile } from '../types';



export const getProfile = async (): Promise<UserProfile> => {
    const { data } = await api.get('/api/me');
    return data;
};

export const updateProfile = async (payload: FormData): Promise<UserProfile> => {
    const { data } = await api.patch('/api/me/profile', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export type PlanOwnerType = 'coach' | 'gym';

export interface PlanGetStartedInput {
    ownerType: PlanOwnerType;
    planId: string;
    message?: string;
    profileId?: string;
}

export type PlanGetStartedResult =
    | {
          status: 'conversation';
          conversation: ChatConversation;
          plan: ProfilePlan;
          interest: { id: string; wasCreated: boolean; createdAt: string };
      }
    | {
          status: 'request_pending';
          request: ChatRequest;
          plan: ProfilePlan;
          interest: { id: string; wasCreated: boolean; createdAt: string };
      };

export const getStartedWithPlan = async ({
    ownerType,
    planId,
    message,
}: PlanGetStartedInput): Promise<PlanGetStartedResult> => {
    const endpoint =
        ownerType === 'coach'
            ? `/api/coaches/plans/${planId}/get-started`
            : `/api/gyms/plans/${planId}/get-started`;
    const { data } = await api.post<PlanGetStartedResult>(endpoint, { message });
    return data;
};

export const useProfileQuery = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        retry: false,
        staleTime: 30_000,
    });
};

const splitDurationLabel = (raw: string): { value: string; unit: string } => {
    const trimmed = (raw ?? '').trim();
    if (!trimmed) return { value: '', unit: '' };
    const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
    if (!match) return { value: trimmed, unit: '' };
    return { value: match[1], unit: match[2].trim() };
};

const sanitizeSocialMedia = (links: SocialMediaLink[] = []): SocialMediaLink[] =>
    links
        .map((link) => ({
            platform: link.platform.trim(),
            url: link.url.trim(),
        }))
        .filter((link) => link.platform.length > 0 && link.url.length > 0);

export const buildEditProfileFormData = (input: EditProfileValues): FormData => {
    const fd = new FormData();

    if (input.role === 'client') {
        const v = input.values;
        if (v.fullName !== undefined) fd.append('fullName', v.fullName);
        if (v.phone !== undefined)    fd.append('phone', v.phone);
        if (v.photo)                  fd.append('photo', v.photo); 
        return fd;
    }

    if (input.role === 'coach') {
        const v = input.values;
        if (v.name !== undefined)            fd.append('name', v.name);
        if (v.image)                         fd.append('image', v.image);
        if (v.philosophyDesc !== undefined)  fd.append('philosophyDesc', v.philosophyDesc);
        if (v.specializations !== undefined) {
            fd.append('specializations', JSON.stringify(v.specializations));
        }
        if (v.socialMedia !== undefined) {
            fd.append('socialMedia', JSON.stringify(sanitizeSocialMedia(v.socialMedia)));
        }

        if (v.certifications !== undefined) {
            const keep = v.certifications.filter((c) => !!c.id).map((c) => c.id!);
            const news = v.certifications.filter((c) => !!c.file).map((c) => c.file!);
            fd.append('existing_certifications', JSON.stringify(keep));
            news.forEach((f) => fd.append('new_certifications', f));
        }

        if (v.plans !== undefined) {
            fd.append('plans', JSON.stringify(v.plans));
        }

        if (v.transformations !== undefined) {
            const meta: Array<Record<string, unknown>> = [];
            let imageIndex = 0;
            v.transformations.forEach((t) => {
                const { value, unit } = splitDurationLabel(t.duration);
                const row: Record<string, unknown> = {
                    id: t.id,
                    clientName: t.clientName,
                    durationValue: value,
                    durationUnit: unit,
                };
                if (t.image instanceof File) {
                    row.imageIndex = imageIndex++;
                    fd.append('transformation_images', t.image);
                } else if (t.image.startsWith('temp/')) {
                    row.image = t.image;
                }
                meta.push(row);
            });
            fd.append('transformations_meta', JSON.stringify(meta));
        }
        return fd;
    }

    // role === 'gym'
    const v = input.values;
    if (v.name !== undefined)        fd.append('name', v.name);
    if (v.image)                     fd.append('image', v.image);
    if (v.description !== undefined) fd.append('description', v.description);
    if (v.specializations !== undefined) {
        fd.append('specializations', JSON.stringify(v.specializations));
    }
    if (v.socialMedia !== undefined) {
        fd.append('socialMedia', JSON.stringify(sanitizeSocialMedia(v.socialMedia)));
    }

    if (v.gymImages !== undefined) {
        const keep = v.gymImages.filter((g) => !!g.id).map((g) => g.id!);
        const news = v.gymImages.filter((g) => !!g.file).map((g) => g.file!);
        fd.append('existing_gym_images', JSON.stringify(keep));
        news.forEach((f) => fd.append('new_gym_images', f));
    }
    if (v.plans !== undefined) {
        fd.append('plans', JSON.stringify(v.plans));
    }

    return fd;
};

export const useUpdateProfileMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(['profile'], data);
            queryClient.setQueryData(['session'], data);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['session'] });
            queryClient.invalidateQueries({ queryKey: plansKeys.usage });
        },
    });
};

export const usePlanGetStartedMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: getStartedWithPlan,
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['session'] });
            if (variables.profileId) {
                queryClient.invalidateQueries({
                    queryKey: [variables.ownerType === 'coach' ? 'coaches' : 'gyms', variables.profileId],
                });
            }
            if (result.status === 'conversation') {
                queryClient.refetchQueries({ queryKey: chatKeys.conversations });
            } else {
                queryClient.refetchQueries({ queryKey: chatKeys.requests('outgoing') });
            }
        },
    });
};
