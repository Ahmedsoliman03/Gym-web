'use client';

import { useEffect, useState } from 'react';
import { UserPen, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';

// Delay before the banner slides in after the profile is known (ms).
const APPEAR_DELAY = 5000;

export function CompleteProfileBanner() {
  const t = useTranslations('Profile');
  const locale = useLocale();
  const { profile } = useProfileUser();

  const [visible, setVisible] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  const userType = profile?.userType;
  const editCount = profile?.profile?.editCount;
  const shouldNudge =
    (userType === 'coach' || userType === 'gym') && editCount === 0;

  useEffect(() => {
    if (!shouldNudge) return;

    const timer = setTimeout(() => setVisible(true), APPEAR_DELAY);
    return () => clearTimeout(timer);
  }, [shouldNudge]);

  if (!visible) return null;

  const isRtl = locale === 'ar';

  const dismiss = () => {
    setAnimatingOut(true);
    setTimeout(() => setVisible(false), 400);
  };

  return (
    <div
      role="status"
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] w-[92%] sm:w-auto sm:max-w-md px-4 py-3.5 rounded-2xl border border-primary/30 bg-surface/95 backdrop-blur-md shadow-2xl shadow-primary/10 flex items-center gap-3 transition-all duration-400 ease-out ${
        animatingOut
          ? 'opacity-0 translate-y-8 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-primary/15 text-primary">
        <UserPen size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-foreground leading-tight">
          {t('completeProfileTitle')}
        </p>
        <p className="text-xs font-bold text-foreground/60 mt-0.5 leading-snug">
          {t('completeProfileMessage')}
        </p>
      </div>

      <Link
        href="/profile/edit"
        onClick={dismiss}
        className="shrink-0 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[11px] hover:brightness-110 transition-all"
      >
        {t('editProfile')}
      </Link>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t('completeProfileDismiss')}
        className="shrink-0 p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/10 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
