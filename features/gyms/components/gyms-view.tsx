'use client';

import { useState, useMemo } from 'react';
import { GYMS } from '@/constants/gyms';
import { GymsHero } from './gyms-hero';
import { GymsFilter } from './gyms-filter';
import { GymCard } from './gym-card';
import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

const styles = {
  container: "min-h-screen bg-background text-foreground font-sans selection:bg-primary/30",
  main: "pt-32 pb-24",
  header: "px-6 relative",
  gradientOverlay: "absolute -top-32 right-0 w-1/3 h-[500px] bg-gradient-to-l from-primary/10 to-transparent blur-3xl -z-10",
  gridContainer: "px-6 md:px-12 max-w-[1920px] mx-auto",
  titleRow: "flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-8 gap-4",
  titleLabel: "font-headline text-3xl font-black uppercase",
  titleUnderline: "h-1 w-20 bg-primary mt-4",
  showingText: "font-body text-foreground/40 text-sm uppercase font-bold",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8",
  emptyState: "py-32 text-center",
  emptyIconWrapper: "inline-block p-6 bg-white/5 rounded-full mb-6",
  emptyIcon: "text-foreground/20",
  emptyTitle: "text-4xl font-headline font-black mb-4 uppercase",
  emptyText: "text-foreground/60 font-body text-xl font-bold uppercase",
  clearButton: "mt-6 text-primary font-headline font-black uppercase hover:brightness-110 transition-all font-bold"
};

export function GymsView() {
  const t = useTranslations('Gyms');
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');

  const filteredGyms = useMemo(() => {
    return GYMS.filter((gym) => {
      const matchesSearch =
        gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.location.toLowerCase().includes(searchQuery.toLowerCase());

      const cityField = (gym as any).city;
      const areaField = (gym as any).area;

      const matchesCity = !city || cityField === city;
      const matchesArea = !area || areaField === area;

      return matchesSearch && matchesCity && matchesArea;
    });
  }, [searchQuery, city, area]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.gradientOverlay} />

        <section className={styles.header}>
          <GymsHero />
          <GymsFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            city={city}
            setCity={setCity}
            area={area}
            setArea={setArea}
          />
        </section>

        <div className={styles.gridContainer}>
          <div className={styles.titleRow}>
            <div>
              <h2 className={styles.titleLabel}>
                {t('partnerFacilities')}
              </h2>
              <div className={styles.titleUnderline} />
            </div>
            <span className={styles.showingText}>
              {t('showingGyms', { count: filteredGyms.length })}
            </span>
          </div>

          <div className={styles.grid}>
            {filteredGyms.map((gym, idx) => (
              <GymCard key={gym.id} gym={gym} index={idx} />
            ))}
          </div>

          {filteredGyms.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <SearchX size={48} className={styles.emptyIcon} />
              </div>
              <p className={styles.emptyText}>
                {t('noGymsFound')}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCity('');
                  setArea('');
                }}
                className={styles.clearButton}
              >
                {t('clearFilters')}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
