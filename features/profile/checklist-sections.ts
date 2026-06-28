import type { UserProfile } from './types';

/** A checklist row: one array on the `/api/me` response that the owner can
 *  fill in to complete their profile. */
export type ChecklistKey =
    | 'specializations'
    | 'certifications'
    | 'transformations'
    | 'gallery'
    | 'socialMedia'
    | 'plans';

export interface ChecklistItem {
    key: ChecklistKey;
    labelKey: string;
    checked: boolean;
}

export const sectionDomId = (key: ChecklistKey) => `profile-section-${key}`;

const has = (arr: unknown): boolean => Array.isArray(arr) && arr.length > 0;

export const buildProfileChecklist = (
    profile: UserProfile | undefined,
): ChecklistItem[] => {
    if (!profile) return [];

    // `profile.profile` can briefly be undefined right after the /me response
    // resolves, so read every array through optional chaining.
    if (profile.userType === 'coach') {
        const p = profile.profile;
        const specs = p?.specializations ?? p?.specialization ?? [];
        return [
            { key: 'specializations', labelKey: 'specializations', checked: has(specs) },
            { key: 'certifications', labelKey: 'certifications', checked: has(p?.certifications) },
            { key: 'transformations', labelKey: 'transformationGallery', checked: has(p?.transformations) },
            { key: 'socialMedia', labelKey: 'socialMedia', checked: has(p?.socialMedia) },
            { key: 'plans', labelKey: 'Plans', checked: has(p?.plans) },
        ];
    }

    if (profile.userType === 'gym') {
        const p = profile.profile;
        return [
            { key: 'specializations', labelKey: 'activePrograms', checked: has(p?.specializations) },
            { key: 'gallery', labelKey: 'facilityGallery', checked: has(p?.images) },
            { key: 'socialMedia', labelKey: 'socialMedia', checked: has(p?.socialMedia) },
            { key: 'plans', labelKey: 'Plans', checked: has(p?.plans) },
        ];
    }

    return [];
};
