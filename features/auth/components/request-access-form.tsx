'use client';

import { useTranslations } from 'next-intl';
import { Building24Regular, Sport24Regular, CheckmarkCircle24Regular } from '@fluentui/react-icons';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import GymRequestForm from './gym-request-form';
import CoachRequestForm from './coach-request-form';

export default function RequestAccessForm() {
    const t = useTranslations();
    const [submitted, setSubmitted] = useState(false);
    const [type, setType] = useState<'gym' | 'coach'>('gym');

    if (submitted) {
        return (
            <div className="text-center space-y-4 animate-premium-in">
                <div className="flex justify-center text-green-500">
                    <CheckmarkCircle24Regular className="w-16 h-16" />
                </div>
                <h2 className="text-2xl font-bold">{t('Auth.requestSent')}</h2>
                <p className="text-foreground/60">{t('Auth.requestPending')}</p>
                <Link href="/login" className="block text-primary font-medium hover:underline">{t('Auth.returnToLogin')}</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('Auth.requestAccess')}</h1>
                <p className="text-foreground/60 text-sm">{t('Auth.requestSubtitle')}</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground/50 px-1">
                        {t('Auth.accountType')}
                    </label>
                    <div className="flex gap-4 p-1 bg-foreground/5 rounded-2xl">
                        <button
                            onClick={() => setType('gym')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all ${type === 'gym' ? 'bg-surface shadow-sm text-primary' : 'text-foreground/40 font-medium'}`}
                        >
                            <Building24Regular />
                            <span className="font-semibold">{t('Auth.gym')}</span>
                        </button>
                        <button
                            onClick={() => setType('coach')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all ${type === 'coach' ? 'bg-surface shadow-sm text-primary' : 'text-foreground/40 font-medium'}`}
                        >
                            <Sport24Regular />
                            <span className="font-semibold">{t('Auth.coach')}</span>
                        </button>
                    </div>
                </div>

                {type === 'gym' ? (
                    <GymRequestForm onSuccess={() => setSubmitted(true)} />
                ) : (
                    <CoachRequestForm onSuccess={() => setSubmitted(true)} />
                )}
            </div>

            <div className="text-center pt-4 text-sm font-medium">
                <Link href="/login" className="text-foreground/40 hover:text-primary transition-colors cursor-pointer">{t('Auth.alreadyHaveAccount')}</Link>
            </div>
        </div>
    );
}
