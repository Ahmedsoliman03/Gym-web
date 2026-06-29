import type { UserProfile } from './types';

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
