'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { setApiErrorCodeMessages } from '@/utils/api-error-messages';

/**
 * Bridges localized strings into the (hook-less) `toastApiError` util so known
 * backend error codes can be shown as friendly, translated, static messages.
 * Mount once inside `NextIntlClientProvider`. Re-runs on locale change.
 */
export function ApiErrorMessagesProvider() {
    const t = useTranslations('Errors');

    useEffect(() => {
        setApiErrorCodeMessages({
            feature_limit_exceeded: t('featureLimitExceeded'),
        });
    }, [t]);

    return null;
}
