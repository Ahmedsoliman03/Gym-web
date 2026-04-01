'use client';

import { useTranslations } from 'next-intl';
import { SpecializationDropdown } from './specialization-dropdown';
import { SPECIALIZATIONS } from '@/constants/coaches';

interface CoachesFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (val: string) => void;
}

export function CoachesFilter({
  searchQuery,
  setSearchQuery,
  selectedSpecialty,
  setSelectedSpecialty,
}: CoachesFilterProps) {
  const t = useTranslations('Coaches');

  return (
    <div className="relative group animate-premium-in z-20" style={{ animationDelay: '0.2s' }}>
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-25 group-focus-within:opacity-100 transition duration-1000"></div>
      <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center bg-surface/40 backdrop-blur-md rounded-2xl p-2 gap-2 border border-white/5 shadow-2xl">
        {/* Search Input */}
        <div className="flex flex-1 items-center bg-[#0D121F] rounded-xl px-4 gap-3 border border-white/5 focus-within:border-primary/30 transition-all">
          <span className="material-symbols-outlined text-foreground/30 text-xl">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 outline-none w-full text-foreground font-body text-base py-3.5 placeholder:text-foreground/20"
            placeholder={t('searchPlaceholder')}
          />
        </div>

        {/* Specialized Dropdown */}
        <SpecializationDropdown
          value={selectedSpecialty}
          onChange={setSelectedSpecialty}
          options={SPECIALIZATIONS}
          placeholder={t('allSpecialties')}
        />

        {/* Reset Action */}
        <button
          className="bg-primary text-primary-foreground font-headline font-black px-8 py-4 rounded-xl active:scale-95 transition-all whitespace-nowrap shadow-xl shadow-primary/10 uppercase tracking-widest text-xs hover:brightness-110"
          onClick={() => {
            setSelectedSpecialty('All');
            setSearchQuery('');
          }}
        >
          {t('reset')}
        </button>
      </div>
    </div>
  );
}
