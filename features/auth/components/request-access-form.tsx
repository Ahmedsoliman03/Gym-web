'use client';

import { useTranslations } from 'next-intl';
import { CheckmarkCircle24Regular } from '@fluentui/react-icons';
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
        <div className="space-y-8 animate-premium-in">
            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-black tracking-tight text-white">{t('Auth.requestAccess')}</h1>
                <p className="text-foreground/50 text-[13px] leading-relaxed max-w-sm mx-auto">
                    {t('Auth.requestSubtitle')}
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 px-1">
                        {t('Auth.accountType')}
                    </label>
                    <div className="flex gap-2 p-1.5 bg-[#0D121F] rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('gym')}
                            className={`flex-1 py-3 rounded-lg cursor-pointer transition-all font-bold text-sm ${type === 'gym' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground/60'}`}
                        >
                            {t('Auth.gym')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('coach')}
                            className={`flex-1 py-3 rounded-lg cursor-pointer transition-all font-bold text-sm ${type === 'coach' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-foreground/40 hover:text-foreground/60'}`}
                        >
                            {t('Auth.coach')}
                        </button>
                    </div>
                </div>

                {type === 'gym' ? (
                    <GymRequestForm onSuccess={() => setSubmitted(true)} />
                ) : (
                    <CoachRequestForm onSuccess={() => setSubmitted(true)} />
                )}
            </div>

            <div className="text-center pt-2">
                <p className="text-[11px] text-foreground/30 font-medium">
                    {t('Auth.reviewTime')}
                </p>
            </div>

            <div className="text-center pt-4 text-sm font-medium border-t border-foreground/5 mt-4">
                <Link href="/login" className="text-foreground/40 hover:text-primary transition-colors cursor-pointer">{t('Auth.alreadyHaveAccount')}</Link>
            </div>
        </div>
    );
}
