'use client';

import { useSubscriptionUsageQuery } from '@/features/plans/services/plans.service';
import type { FeatureUsage } from '@/features/plans/types';

export interface UnusedSlot {
    /** Backend feature code, e.g. `certifications`. */
    code: string;
    /** Backend display name, used as a fallback label. */
    name: string;
    /** Slots that would still be unused even after this save. */
    remaining: number;
}

export interface ProfileSaveGuard {
    /** This save would consume the final allowed profile edit this period. */
    isLastEdit: boolean;
    /** Profile-related limited features the user hasn't filled up. */
    unusedSlots: UnusedSlot[];
    /** Show the pre-save warning: it's the last edit AND slots are left unused. */
    shouldWarn: boolean;
}

const isUnlimited = (n: number) => n === -1;
const findUsage = (usage: FeatureUsage[], code: string) =>
    usage.find((u) => u.feature_code === code);


export function useProfileSaveGuard(
    enabled: boolean,
    newlyAdding: Record<string, number>,
): ProfileSaveGuard {
    const { data: usage = [] } = useSubscriptionUsageQuery(enabled);

    const edit = findUsage(usage, 'edit_profile');
    const editRemaining =
        edit && !isUnlimited(edit.monthly_limit)
            ? edit.monthly_limit - edit.monthly_used
            : Infinity;
    const isLastEdit = editRemaining === 1;

    const unusedSlots: UnusedSlot[] = [];
    for (const [code, adding] of Object.entries(newlyAdding)) {
        const feature = findUsage(usage, code);
        if (!feature || isUnlimited(feature.monthly_limit)) continue;
        const remaining =
            feature.monthly_limit - feature.monthly_used - (adding || 0);
        if (remaining > 0) {
            unusedSlots.push({ code, name: feature.feature_name, remaining });
        }
    }

    return {
        isLastEdit,
        unusedSlots,
        shouldWarn: isLastEdit && unusedSlots.length > 0,
    };
}
