'use client';

import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { styles } from './navbar.styles';

export function LanguageToggle() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    // Preserve the current query string and hash so switching the language only
    // swaps the locale — it must not reset URL-driven page state or content.
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    router.replace(`${pathname}${search}${hash}`, { locale: nextLocale });
  };

  return (
    <button onClick={toggleLanguage} className={styles.langButton} title={t('switchLanguage')}>
      <Globe size={18} />
      <span className={styles.langText}>{locale === 'en' ? 'AR' : 'EN'}</span>
    </button>
  );
}
