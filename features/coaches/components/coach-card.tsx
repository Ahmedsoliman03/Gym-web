'use client';

import { useTranslations } from 'next-intl';
import { COMMON_COACH_IMAGE } from '@/constants/coaches';

interface CoachCardProps {
  coach: {
    id: number;
    name: string;
    yearsExp: number;
    specializations: string[];
    tier: string;
  };
  index: number;
}

export function CoachCard({ coach, index }: CoachCardProps) {
  const t = useTranslations('Coaches');

  return (
    <div
      className="group bg-surface rounded-2xl overflow-hidden hover:translate-y-[-12px] transition-all duration-500 border border-white/5 shadow-2xl animate-premium-in"
      style={{ animationDelay: `${0.1 * (index % 4)}s` }}
    >
      <div className="flex flex-col h-full">
        {/* Image Section */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={COMMON_COACH_IMAGE}
            alt={coach.name}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
          />

          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-background via-background/80 to-transparent">
            <span className="font-headline text-3xl font-black block mb-1 leading-none">{coach.name}</span>
            <span className="font-body text-primary text-xs font-black tracking-[0.2em] uppercase">
              {t('yearsExp', { years: coach.yearsExp })}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 py-5 px-6">
            {coach.specializations.map((spec) => (
              <span
                key={spec}
                className="bg-white/5 text-foreground/40 px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/5 group-hover:border-primary/20 transition-colors"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Action Section */}
        {/* <div className="px-6 pb-8 mt-auto">
          <button className="w-full text-primary font-headline text-sm font-black tracking-widest group-hover:translate-x-1 transition-all uppercase flex items-center justify-center gap-2 border border-primary/20 py-3 rounded-xl hover:bg-primary/10">
            {t('profile')}
          </button>
        </div> */}
      </div>
    </div>
  );
}
