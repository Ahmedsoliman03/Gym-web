'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { setApiErrorCodeMessages } from '@/utils/api-error-messages';

export function ApiErrorMessagesProvider() {
    const t = useTranslations('Errors');

    useEffect(() => {
        setApiErrorCodeMessages({
            feature_limit_exceeded: t('featureLimitExceeded'),
        });
    }, [t]);

    return null;
}
