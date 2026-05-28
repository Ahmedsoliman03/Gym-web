'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GymsFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  area: string;
  setArea: (val: string) => void;
}

const styles = {
  container: "relative group z-20 mb-12",
  glow: "absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-25 group-focus-within:opacity-100 transition duration-1000",
  content: "relative flex flex-col md:flex-row items-stretch md:items-center bg-surface/40 backdrop-blur-md rounded-2xl p-2 gap-2 border border-white/5 shadow-2xl",
  searchWrapper: "flex flex-1 items-center bg-[#0D121F] rounded-xl px-4 gap-3 border border-white/5 focus-within:border-primary/30 transition-all",
  searchIcon: "text-foreground/30",
  searchInput: "bg-transparent border-none focus:ring-0 outline-none w-full text-foreground font-body text-base py-3.5 placeholder:text-foreground/20",
  selectsWrapper: "flex flex-col sm:flex-row gap-2 md:w-1/2",
  inputWrapper: "flex flex-1 items-center bg-[#0D121F] rounded-xl px-4 border border-white/5 focus-within:border-primary/30 transition-all",
  input: "bg-transparent border-none focus:ring-0 outline-none w-full text-foreground font-body text-sm py-3.5 placeholder:text-foreground/20",
  resetButton: "bg-primary text-primary-foreground font-headline font-black px-8 py-4 rounded-xl active:scale-95 transition-all whitespace-nowrap shadow-xl shadow-primary/10 uppercase text-xs hover:brightness-110"
};

export function GymsFilter({
  searchQuery,
  setSearchQuery,
  city,
  setCity,
  area,
  setArea
}: GymsFilterProps) {
  const t = useTranslations();

  return (
    <div className={styles.container} style={{ animationDelay: '0.2s' }}>
      <div className={styles.glow} />
      <div className={styles.content}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            placeholder={t('Coaches.searchPlaceholder')}
          />
        </div>

        <div className={styles.selectsWrapper}>
          {/* City input */}
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={styles.input}
              placeholder={t('Location.city')}
            />
          </div>

          {/* Area input */}
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className={styles.input}
              placeholder={t('Location.area')}
            />
          </div>
        </div>

        <button
          className={styles.resetButton}
          onClick={() => {
            setSearchQuery('');
            setCity('');
            setArea('');
          }}
        >
          {t('Coaches.reset')}
        </button>
      </div>
    </div>
  );
}
