'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useLocale } from 'next-intl';

export function OfflineIndicator() {
  const locale = useLocale();
  const [isOffline, setIsOffline] = useState(false);
  const [show, setShow] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      // Keep showing the "Online" state for 2.5 seconds, then animate out
      const timer = setTimeout(() => {
        setIsAnimatingOut(true);
        const exitTimer = setTimeout(() => {
          setShow(false);
          setIsAnimatingOut(false);
        }, 500); // match transition duration
        return () => clearTimeout(exitTimer);
      }, 2500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShow(true);
      setIsAnimatingOut(false);
    };

    // Set initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show) return null;

  const isRtl = locale === 'ar';
  const text = isOffline
    ? (isRtl ? 'أنت غير متصل بالإنترنت حالياً' : 'You are currently offline')
    : (isRtl ? 'تمت استعادة الاتصال بالإنترنت!' : 'Connection restored!');

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-[150] w-[90%] sm:w-auto min-w-[280px] px-5 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500 ease-out flex items-center gap-3 ${
        isAnimatingOut
          ? 'opacity-0 -translate-y-8 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      } ${
        isOffline
          ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-950/20'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-950/20'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        isOffline ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
      }`}>
        {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
      </div>
      <div className="flex-1 flex flex-col">
        <span className="text-xs font-black uppercase tracking-wider">
          {isOffline ? (isRtl ? 'انقطاع الاتصال' : 'Offline Mode') : (isRtl ? 'متصل الآن' : 'Online')}
        </span>
        <span className="text-xs opacity-80 font-bold">{text}</span>
      </div>
    </div>
  );
}
