'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';

import { api } from '@/utils/axios';

interface TranslationResponse {
  translations: string[];
}

export function useTextTranslation(text: string | null | undefined) {
  const locale = useLocale();
  const t = useTranslations('Translation');
  const queryClient = useQueryClient();
  const sourceText = text?.trim() ?? '';
  const targetLanguage = locale === 'ar' ? 'en' : 'ar';
  const queryKey = ['translation', sourceText, targetLanguage] as const;
  const translationKey = `${targetLanguage}:${sourceText}`;
  const [visibleTranslationKey, setVisibleTranslationKey] = useState<string | null>(null);
  const showTranslation = visibleTranslationKey === translationKey;
  const queryFn = async () => {
    const { data } = await api.post<TranslationResponse>('/api/core/translate/', {
      texts: [sourceText],
      targetLanguage,
    });
    const translation = data.translations?.[0]?.trim();
    if (!translation) throw new Error('Empty translation response');
    return translation;
  };

  const { data: translatedText, isFetching } = useQuery({
    queryKey,
    queryFn,
    enabled: false,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  const toggleTranslation = async () => {
    if (!sourceText) return false;

    if (translatedText) {
      const nextValue = !showTranslation;
      setVisibleTranslationKey(nextValue ? translationKey : null);
      return nextValue;
    }

    try {
      await queryClient.fetchQuery({
        queryKey,
        queryFn,
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
      });
      setVisibleTranslationKey(translationKey);
      return true;
    } catch {
      toast.error(t('translationFailed'));
      return false;
    }
  };

  return {
    displayedText: showTranslation && translatedText ? translatedText : (text ?? ''),
    isTranslating: isFetching,
    showTranslation,
    toggleTranslation,
    buttonLabel: isFetching
      ? t('translating')
      : showTranslation
        ? t('seeOriginal')
        : t('seeTranslation'),
  };
}
