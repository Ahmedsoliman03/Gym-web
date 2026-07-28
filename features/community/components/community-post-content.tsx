'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useTextTranslation } from '@/hooks/use-text-translation';

export function CommunityPostContent({ content, href }: { content: string; href?: string }) {
  const t = useTranslations('Community');
  const [expanded, setExpanded] = useState(false);
  const {
    displayedText: displayedContent,
    isTranslating,
    toggleTranslation,
    buttonLabel,
  } = useTextTranslation(content);
  const needsToggle = displayedContent.length > 240;
  const base = 'px-4 sm:px-6 py-2 text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap break-words';

  const handleTranslation = async () => {
    const showingTranslation = await toggleTranslation();
    if (showingTranslation) {
      setExpanded(true);
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
    <button type="button" onClick={handleTranslation} disabled={isTranslating}
      className="mx-4 sm:mx-6 m-2 block text-primary/80 text-xs font-bold hover:text-primary hover:underline disabled:opacity-50">
      {buttonLabel}
    </button>
  </div>;
}
