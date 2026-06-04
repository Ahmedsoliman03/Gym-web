'use client';

import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SpecializationDropdown } from './specialization-dropdown';
import { ExperienceDropdown } from './experience-dropdown';
import { SPECIALIZATIONS } from '@/constants/specializations';
import { CoachesFilterProps } from '../types';

const styles = {
  container: "relative group z-20",
  glow: "absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-25 group-focus-within:opacity-100 transition duration-1000",
  content: "relative flex flex-col lg:flex-row items-stretch lg:items-center bg-surface/40 backdrop-blur-md rounded-2xl p-2 gap-2 border border-white/5 shadow-2xl",
  searchWrapper: "flex flex-1 items-center bg-[#0D121F] rounded-xl px-4 gap-3 border border-white/5 focus-within:border-primary/30 transition-all",
  searchIcon: "material-symbols-outlined text-foreground/30 text-xl",
  searchInput: "bg-transparent border-none focus:ring-0 outline-none w-full text-foreground font-body text-base py-3.5 placeholder:text-foreground/20",
  actionGroup: "flex flex-col sm:flex-row gap-2",
  locationButton: "flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-foreground font-headline font-black px-5 py-4 rounded-xl active:scale-95 transition-all whitespace-nowrap uppercase text-xs border border-white/10 hover:border-primary/30 disabled:opacity-60 disabled:cursor-wait",
  locationSpinner: "w-4 h-4 rounded-full border-2 border-foreground/40 border-t-foreground animate-spin",
  resetButton: "bg-primary text-primary-foreground font-headline font-black px-8 py-4 rounded-xl active:scale-95 transition-all whitespace-nowrap shadow-xl shadow-primary/10 uppercase text-xs hover:brightness-110"
};

export function CoachesFilter({
  searchQuery,
  setSearchQuery,
  selectedSpecialty,
  setSelectedSpecialty,
  experience,
  setExperience,
  onDetectLocation,
  isDetectingLocation = false,
  onResetLocation,
}: CoachesFilterProps) {
  const t = useTranslations('Coaches');
  const t_root = useTranslations();

  return (
    <div className={styles.container} style={{ animationDelay: '0.2s' }}>
      <div className={styles.glow} />
      <div className={styles.content}>
        {/* Search Input */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            placeholder={t('searchPlaceholder')}
          />
        </div>

        {/* Specialized Dropdown */}
        <SpecializationDropdown
          value={selectedSpecialty}
          onChange={setSelectedSpecialty}
          options={SPECIALIZATIONS.map(s => s.value)}
          placeholder={t('allSpecialties')}
        />

        {/* Experience Dropdown */}
        <ExperienceDropdown
          value={experience}
          onChange={setExperience}
          placeholder={t_root('Profile.experience') || 'Years of Experience'}
        />

        {/* Actions */}
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.locationButton}
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            aria-label={t_root('Location.detectLocation')}
          >
            {isDetectingLocation ? (
              <span className={styles.locationSpinner} />
            ) : (
              <MapPin size={16} />
            )}
            {isDetectingLocation
              ? t_root('Location.detecting')
              : t_root('Location.detectLocation')}
          </button>

          <button
            className={styles.resetButton}
            onClick={() => {
              setSelectedSpecialty('All');
              setSearchQuery('');
              setExperience('All');
              onResetLocation?.();
            }}
          >
            {t('reset')}
          </button>
        </div>
      </div>
    </div>
  );
}
