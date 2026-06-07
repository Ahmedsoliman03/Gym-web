'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

const styles = {
  base:
    'fixed bottom-6 left-6 z-[105] w-12 h-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/30 border border-primary/40 transition-all duration-300 active:scale-95 hover:brightness-110',
  hidden: 'opacity-0 pointer-events-none translate-y-2',
  visible: 'opacity-100 pointer-events-auto translate-y-0',
};

/**
 * Floating "scroll to top" button. Mounted once in the locale layout so it is
 * available on every page. Hidden until the user has scrolled past a small
 * threshold, then smoothly returns the page to the top on click.
 */
export function ScrollToTopButton() {
  const t = useTranslations('Common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const SHOW_AFTER_PX = 320;

    // Read once on mount so the button shows immediately on a back-navigation
    // that lands the user mid-page.
    setVisible(window.scrollY > SHOW_AFTER_PX);

    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('scrollToTop')}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`${styles.base} ${visible ? styles.visible : styles.hidden}`}
    >
      <ArrowUp size={18} strokeWidth={2.5} />
    </button>
  );
}
