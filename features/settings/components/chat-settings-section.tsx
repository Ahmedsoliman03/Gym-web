'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import {
    useChatSettings,
    useUpdateChatSettingsMutation,
} from '@/features/chat/services/chat.service';
import { useChatSocket } from '@/features/chat/socket/chat-socket-provider';
import type {
    ChatAccessRule,
    ChatSettings,
    PresenceStatus,
} from '@/features/chat/types';
import { GLoaderSection } from '@/components/ui/g-loader';
import { settingsStyles as s } from './styles';

const PRESENCE_OPTIONS: PresenceStatus[] = ['online', 'busy', 'offline'];
const ACCESS_OPTIONS: ChatAccessRule[] = ['open', 'request_required'];

const ACCESS_ROWS: Array<{
    key: keyof Pick<ChatSettings, 'allowClients' | 'allowCoaches' | 'allowGyms'>;
    titleKey: 'allowClientsTitle' | 'allowCoachesTitle' | 'allowGymsTitle';
    descKey: 'allowClientsDesc' | 'allowCoachesDesc' | 'allowGymsDesc';
}> = [
    { key: 'allowClients', titleKey: 'allowClientsTitle', descKey: 'allowClientsDesc' },
    { key: 'allowCoaches', titleKey: 'allowCoachesTitle', descKey: 'allowCoachesDesc' },
    { key: 'allowGyms',    titleKey: 'allowGymsTitle',    descKey: 'allowGymsDesc' },
];

export function ChatSettingsSection() {
    const t = useTranslations('Settings');
    const { data: settings, isLoading, isError } = useChatSettings();
    const updateMutation = useUpdateChatSettingsMutation();
    const { setPresence } = useChatSocket();

    // Local draft so the user can tweak multiple toggles and commit them all
    // with one Save call. We resync whenever the server value updates.
    const [draft, setDraft] = useState<ChatSettings | null>(settings ?? null);

    useEffect(() => {
        if (settings) setDraft(settings);
    }, [settings]);

    if (isLoading || !draft) return <GLoaderSection minHeight={160} />;
    if (isError || !settings) {
        return <div className={s.rowDesc}>{t('chatLoadError')}</div>;
    }

    const dirty =
        draft.manualStatus !== settings.manualStatus ||
        draft.allowClients !== settings.allowClients ||
        draft.allowCoaches !== settings.allowCoaches ||
        draft.allowGyms !== settings.allowGyms;

    const handleSave = () => {
        if (!dirty) return;
        const presenceChanged = draft.manualStatus !== settings.manualStatus;
        updateMutation.mutate(draft, {
            onSuccess: () => {
                // Persisted via REST; also broadcast the new status live over
                // the socket so other users' presence dots update immediately
                // instead of waiting on the backend to apply the saved value.
                if (presenceChanged) setPresence(draft.manualStatus);
                toast.success(t('chatUpdateSuccess'));
            },
            onError: () => toast.error(t('chatUpdateError')),
        });
    };

    return (
        <div>
            <div className={s.sectionLabel}>{t('presenceLabel')}</div>
            <div className={s.row}>
                <div className={s.rowText}>
                    <div className={s.rowTitle}>{t('manualStatusTitle')}</div>
                    <div className={s.rowDesc}>{t('manualStatusDesc')}</div>
                </div>
                <div className={s.pillGroup}>
                    {PRESENCE_OPTIONS.map((status) => {
                        const active = draft.manualStatus === status;
                        return (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setDraft({ ...draft, manualStatus: status })}
                                className={`${s.pill} ${active ? s.pillActive : ''}`}
                            >
                                {t(`presence_${status}`)}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={s.sectionLabel}>{t('whoCanChatLabel')}</div>
            {ACCESS_ROWS.map(({ key, titleKey, descKey }) => {
                const current = draft[key];
                return (
                    <div key={key} className={s.row}>
                        <div className={s.rowText}>
                            <div className={s.rowTitle}>{t(titleKey)}</div>
                            <div className={s.rowDesc}>{t(descKey)}</div>
                        </div>
                        <div className={s.pillGroup}>
                            {ACCESS_OPTIONS.map((rule) => {
                                const active = current === rule;
                                return (
                                    <button
                                        key={rule}
                                        type="button"
                                        onClick={() => setDraft({ ...draft, [key]: rule })}
                                        className={`${s.pill} ${active ? s.pillActive : ''}`}
                                    >
                                        {t(`access_${rule}`)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

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
