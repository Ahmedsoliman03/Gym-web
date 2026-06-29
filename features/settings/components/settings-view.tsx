'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bell, Lock, MessageSquare, UserX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SettingsAccordion } from './settings-accordion';
import { ChangePasswordSection } from './change-password-section';
import { ChatSettingsSection } from './chat-settings-section';
import { NotificationsSection } from './notifications-section';
import { BlockedUsersSection } from './blocked-users-section';
import { useSettingsSections } from '../services/settings.service';

const styles = {
    page: 'pt-20 sm:pt-24 pb-16 px-3 sm:px-6 md:px-12 min-h-screen',
    inner: 'max-w-3xl mx-auto',
    pageTitle:
        'text-3xl sm:text-4xl font-headline font-bold mb-8 text-foreground',
    accordionGroup: 'flex flex-col gap-4',
};

type Panel = 'password' | 'chat' | 'notifications' | 'blocked' | null;

const PANELS = ['password', 'chat', 'notifications', 'blocked'] as const;

export function SettingsView() {
    const t = useTranslations('Settings');
    const searchParams = useSearchParams();
    const initialPanel: Panel =
        PANELS.find((p) => p === searchParams.get('section')) ?? null;
    const [open, setOpen] = useState<Panel>(initialPanel);

    const { data: allowed } = useSettingsSections();
    const canSee = (section: Exclude<Panel, null>) => !allowed || allowed.includes(section);

    const toggle = (panel: Exclude<Panel, null>) =>
        setOpen((curr) => (curr === panel ? null : panel));

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <h1 className={styles.pageTitle}>{t('title')}</h1>
                <div className={styles.accordionGroup}>
                    {canSee('password') && (
                        <SettingsAccordion
                            icon={<Lock size={18} />}
                            title={t('passwordTitle')}
                            subtitle={t('passwordSubtitle')}
                            open={open === 'password'}
                            onToggle={() => toggle('password')}
                        >
                            <ChangePasswordSection />
                        </SettingsAccordion>
                    )}

                    {canSee('chat') && (
                        <SettingsAccordion
                            icon={<MessageSquare size={18} />}
                            title={t('chatTitle')}
                            subtitle={t('chatSubtitle')}
                            open={open === 'chat'}
                            onToggle={() => toggle('chat')}
                        >
                            <ChatSettingsSection />
                        </SettingsAccordion>
                    )}

                    {canSee('notifications') && (
                        <SettingsAccordion
                            icon={<Bell size={18} />}
                            title={t('notificationsTitle')}
                            subtitle={t('notificationsSubtitle')}
                            open={open === 'notifications'}
                            onToggle={() => toggle('notifications')}
                        >
                            <NotificationsSection />
                        </SettingsAccordion>
                    )}

                    {canSee('blocked') && (
                        <SettingsAccordion
                            icon={<UserX size={18} />}
                            title={t('blockedUsersTitle')}
                            subtitle={t('blockedUsersSubtitle')}
                            open={open === 'blocked'}
                            onToggle={() => toggle('blocked')}
                        >
                            <BlockedUsersSection />
                        </SettingsAccordion>
                    )}
                </div>
            </div>
        </div>
    );
}
