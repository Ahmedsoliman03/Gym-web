'use client';

import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { SpinnerIos20Regular } from '@fluentui/react-icons';
import { toastApiError } from '@/utils/toast-api-error';
import { useGoogleAuthMutation } from '../services/auth.service';
import type { GoogleProfile } from '../types';
import { normalizeAuthNextPath } from '../utils/next-path';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_PROFILE_STORAGE_KEY = 'gymspot.googleSignupProfile';

type GoogleCodeResponse = {
    code?: string;
    error?: string;
};

type GoogleCodeClient = {
    requestCode: () => void;
};

type GooglePopupError = {
    type?: string;
};

declare global {
    interface Window {
        google?: {
            accounts?: {
                oauth2?: {
                    initCodeClient: (config: {
                        client_id: string;
                        scope: string;
                        ux_mode: 'popup';
                        callback: (response: GoogleCodeResponse) => void;
                        error_callback?: (error: GooglePopupError) => void;
                    }) => GoogleCodeClient;
                };
            };
        };
    }
}

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = () => {
    if (typeof window === 'undefined') return Promise.reject(new Error('browser_required'));
    if (window.google?.accounts?.oauth2) return Promise.resolve();
    if (googleScriptPromise) return googleScriptPromise;

    googleScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            `script[src="${GOOGLE_SCRIPT_SRC}"]`,
        );
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('google_script_failed')), {
                once: true,
            });
            return;
        }

        const script = document.createElement('script');
        script.src = GOOGLE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('google_script_failed'));
        document.head.appendChild(script);
    });
    return googleScriptPromise;
};

export const saveGoogleSignupProfile = (profile: GoogleProfile) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(GOOGLE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const readGoogleSignupProfile = (): GoogleProfile | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(GOOGLE_PROFILE_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as GoogleProfile) : null;
    } catch {
        return null;
    }
};

export const clearGoogleSignupProfile = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(GOOGLE_PROFILE_STORAGE_KEY);
};

const googleIcon = (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
);

export function GoogleAuthButton({
    className,
    label,
}: {
    className: string;
    label: string;
}) {
    const t = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const googleAuth = useGoogleAuthMutation();
    const [loading, setLoading] = useState(false);

    const safeNext = normalizeAuthNextPath(searchParams.get('next'));

    const handleGoogleCode = async (response: GoogleCodeResponse) => {
        if (response.error || !response.code) {
            toast.error(t('Auth.googleFailed'));
            setLoading(false);
            return;
        }

        try {
            const result = await googleAuth.mutateAsync({
                code: response.code,
                redirectUri: window.location.origin,
            });
            if (result.status === 'authenticated') {
                clearGoogleSignupProfile();
                router.push(safeNext as never);
                return;
            }

            saveGoogleSignupProfile(result.googleProfile);
            const nextParam = safeNext === '/' ? '' : `?next=${encodeURIComponent(safeNext)}`;
            router.push(`/complete-google-signup${nextParam}` as never);
        } catch (error) {
            toastApiError(error, t('Auth.googleFailed'));
        } finally {
            setLoading(false);
        }
    };

    const onClick = async () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            toast.error(t('Auth.googleConfigMissing'));
            return;
        }

        setLoading(true);
        try {
            await loadGoogleScript();
            const client = window.google?.accounts?.oauth2?.initCodeClient({
                client_id: clientId,
                scope: 'openid email profile',
                ux_mode: 'popup',
                callback: handleGoogleCode,
                error_callback: (error) => {
                    setLoading(false);
                    if (error.type !== 'popup_closed') toast.error(t('Auth.googleFailed'));
                },
            });
            if (!client) throw new Error('google_unavailable');
            client.requestCode();
        } catch {
            setLoading(false);
            toast.error(t('Auth.googleFailed'));
        }
    };

    return (
        <button
            type="button"
            className={className}
            onClick={onClick}
            disabled={loading || googleAuth.isPending}
        >
            {loading || googleAuth.isPending ? (
                <SpinnerIos20Regular className="animate-spin" />
            ) : (
                googleIcon
            )}
            <span>{label}</span>
        </button>
    );
}
