import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import type { EditProfileValues, UserProfile } from '../types';



export const getProfile = async (): Promise<UserProfile> => {
    const { data } = await api.get('/api/me');
    return data;
};

export const updateProfile = async (payload: FormData): Promise<UserProfile> => {
    const { data } = await api.patch('/api/me', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const useProfileQuery = () => {
    // The `user_type` cookie is set by the backend proxy on login and cleared
    // on logout. Use its presence as a "we have a session" hint so logged-out
    // users on public pages don't churn 401s against /api/me.
    const isPossiblyLoggedIn =
        typeof document !== 'undefined' && /(?:^|;\s*)user_type=/.test(document.cookie);
    return useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        enabled: isPossiblyLoggedIn,
    });
};

// ── Edit Profile builder ───────────────────────────────────────────────────────
//
// The forms describe their values in human-readable shapes; this helper turns
// that into the exact multipart/form-data contract `PATCH /api/me` expects so
// the forms don't have to know about field renames, JSON stringification, or
// the existing-vs-new file split rules. The value shapes themselves live in
// ../types alongside the rest of the profile domain types.

/** Split a free-form duration label ("8 years", "12 weeks", "6 month") into
 *  the `durationValue` / `durationUnit` pair the API expects. When the label
 *  doesn't match `<number> <unit>`, we send the raw string as the value with
 *  an empty unit so the backend can decide what to do with it. */
const splitDurationLabel = (raw: string): { value: string; unit: string } => {
    const trimmed = (raw ?? '').trim();
    if (!trimmed) return { value: '', unit: '' };
    const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.+)$/);
    if (!match) return { value: trimmed, unit: '' };
    return { value: match[1], unit: match[2].trim() };
};

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
                // The API contract (postman README → "Edit Profile - Coach")
                // expects each transformation row to carry `durationValue` +
                // `durationUnit` as separate fields. The /me read returns a
                // single `duration` string like "8 years", so we parse it back
                // into number + unit here. When parsing fails (free-form
                // text), we send the whole string as the value with an empty
                // unit so the backend can fall back to its own normaliser.
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
        },
    });
};
