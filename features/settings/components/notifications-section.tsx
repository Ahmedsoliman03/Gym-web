'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import {
    useNotificationSettings,
    useUpdateNotificationSettingsMutation,
    type NotificationPreferences,
} from '@/features/notification/services/notification-settings.service';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { GLoaderSection } from '@/components/ui/g-loader';
import { settingsStyles as s } from './styles';

type PrefKey = keyof NotificationPreferences;

type Group = {
    labelKey: string;
    keys: PrefKey[];
};

const GROUPS: Group[] = [
    { labelKey: 'notif_group_posts', keys: ['post_vote', 'post_share', 'post_save'] },
    {
        labelKey: 'notif_group_comments',
        keys: ['post_comment', 'comment_vote', 'comment_reply', 'reply_vote'],
    },
    { labelKey: 'notif_group_jobs', keys: ['job_application', 'job_save'] },
];

// Clients can't create posts, so post votes/shares/saves/comments (and the
// job group, which is gym/coach-only) can never notify a client — only
// interactions on a comment/reply they themselves wrote apply.
const CLIENT_VISIBLE_KEYS = new Set<PrefKey>(['comment_vote', 'comment_reply', 'reply_vote']);

const ALL_KEYS: PrefKey[] = GROUPS.flatMap((g) => g.keys);

export function NotificationsSection() {
    const t = useTranslations('Settings');
    const { data, isLoading, isError } = useNotificationSettings();
    const updateMutation = useUpdateNotificationSettingsMutation();
    const { profile } = useProfileUser();

    const [overrides, setOverrides] = useState<Partial<NotificationPreferences>>({});

    const draft = useMemo(
        () => (data ? { ...data.preferences, ...overrides } : null),
        [data, overrides],
    );

    if (isLoading) return <GLoaderSection minHeight={160} />;
    if (isError || !data || !draft) {
        return <div className={s.rowDesc}>{t('notificationsLoadError')}</div>;
    }

    const groups =
        profile?.userType === 'client'
            ? GROUPS.map((g) => ({
                  ...g,
                  keys: g.keys.filter((k) => CLIENT_VISIBLE_KEYS.has(k)),
              })).filter((g) => g.keys.length > 0)
            : GROUPS;

    const dirty = ALL_KEYS.some((k) => draft[k] !== data.preferences[k]);

    const toggle = (key: PrefKey) =>
        setOverrides((current) => ({
            ...current,
            [key]: !draft[key],
        }));

    const handleSave = () => {
        if (!dirty) return;
        updateMutation.mutate(draft, {
            onSuccess: () => {
                setOverrides({});
                toast.success(t('notificationsUpdateSuccess'));
            },
            onError: () => toast.error(t('notificationsUpdateError')),
        });
    };

    return (
        <div className="mt-2">
            {groups.map((group) => (
                <div key={group.labelKey}>
                    <div className={s.sectionLabel}>{t(group.labelKey)}</div>
                    {group.keys.map((key) => {
                        const on = draft[key];
                        return (
                            <div key={key} className={s.row}>
                                <div className={s.rowText}>
                                    <div className={s.rowTitle}>{t(`notif_${key}_title`)}</div>
                                    <div className={s.rowDesc}>{t(`notif_${key}_desc`)}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggle(key)}
                                    aria-pressed={on}
                                    className={`${s.toggle} ${on ? s.toggleOn : s.toggleOff}`}
                                >
                                    <span
                                        className={`${s.toggleKnob} ${on ? s.toggleKnobOn : s.toggleKnobOff} mt-px`}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ))}

            <div className={s.saveRow}>
                {dirty && <span className={s.dirtyHint}>{t('unsavedChanges')}</span>}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!dirty || updateMutation.isPending}
                    className={s.submitButton}
                    style={{ width: 'auto', minWidth: 160 }}
                >
                    {updateMutation.isPending ? t('saving') : t('save')}
                </button>
            </div>
        </div>
    );
}
