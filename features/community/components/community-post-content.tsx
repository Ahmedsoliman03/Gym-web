'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { Link } from '@/i18n/routing';
import { api } from '@/utils/axios';

export function CommunityPostContent({ content, href }: { content: string; href?: string }) {
  const t = useTranslations('Community');
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const displayedContent = showTranslation && translated ? translated : content;
  const targetLanguage = locale === 'ar' ? 'en' : 'ar';
  const needsToggle = displayedContent.length > 240;
  const base = 'px-4 sm:px-6 py-2 text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap break-words';

  const toggleTranslation = async () => {
    if (translated) {
      setShowTranslation((value) => !value);
      return;
    }
    setIsTranslating(true);
    try {
      const { data } = await api.post<{ translations: string[] }>('/api/core/translate/', {
        texts: [content],
        targetLanguage,
      });
      const result = data.translations?.[0];
      if (!result) throw new Error('Empty translation');
      setTranslated(result);
      setShowTranslation(true);
      setExpanded(true);
    } catch {
      toast.error(t('translationFailed'));
    } finally {
      setIsTranslating(false);
    }
  };

  if (!content) return null;
  return <div>
    {href ? (
      <Link href={href} className={`block ${base} ${expanded ? '' : 'line-clamp-3'}`}>{displayedContent}</Link>
    ) : (
      <div className={`${base} ${expanded || !needsToggle ? '' : 'line-clamp-3'}`}>{displayedContent}</div>
    )}
    {needsToggle && <button type="button" onClick={() => setExpanded((value) => !value)}
      className="mx-4 sm:mx-6 text-primary text-xs font-black uppercase tracking-wider hover:underline">
      {expanded ? t('seeLess') : t('seeMore')}
    </button>}
    <button type="button" onClick={toggleTranslation} disabled={isTranslating}
      className="mx-4 sm:mx-6 m-2 block text-primary/80 text-xs font-bold hover:text-primary hover:underline disabled:opacity-50">
      {isTranslating ? t('translating') : showTranslation ? t('seeOriginal') : t('seeTranslation')}
    </button>
  </div>;
}
