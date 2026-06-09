'use client';

import { useState, useMemo } from 'react';
import { GymsHero } from './gyms-hero';
import { GymsFilter } from './gyms-filter';
import { GymCard } from './gym-card';
import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGyms } from '../services/gyms.service';
import { useAutoLocationFilter } from '@/hooks/use-auto-location-filter';
import { StoriesBar } from '@/features/stories/components/stories-bar';

const styles = {
  container: "min-h-screen bg-background text-foreground font-sans selection:bg-primary/30",
  main: "pt-20 sm:pt-24 pb-12",
  header: "px-4 sm:px-6 relative",
  gradientOverlay: "absolute -top-32 right-0 w-1/3 h-[500px] bg-gradient-to-l from-primary/10 to-transparent blur-3xl -z-10",
  gridContainer: "px-4 sm:px-6 md:px-12 max-w-[1920px] mx-auto",
  titleRow: "flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 border-b border-white/5 pb-6 sm:pb-8 gap-4",
  titleLabel: "font-headline text-2xl sm:text-3xl font-black uppercase",
  titleUnderline: "h-1 w-16 sm:w-20 bg-primary mt-3 sm:mt-4",
  showingText: "font-body text-foreground/40 text-xs sm:text-sm uppercase font-bold",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8",
  emptyState: "py-16 sm:py-32 text-center",
  emptyIconWrapper: "inline-block p-6 bg-white/5 rounded-full mb-6",
  emptyIcon: "text-foreground/20",
  emptyTitle: "text-4xl font-headline font-black mb-4 uppercase",
  emptyText: "text-foreground/60 font-body text-xl font-bold uppercase",
  clearButton: "mt-6 text-primary font-headline font-black uppercase hover:brightness-110 transition-all font-bold"
};

export function GymsView() {
  const t = useTranslations('Gyms');
  const tLoc = useTranslations('Location');
  const [searchQuery, setSearchQuery] = useState('');

  const { city, setCity, area, setArea, detect, isDetecting } =
    useAutoLocationFilter({
      successMessage:
        tLoc('locationDetected') || 'Location detected: Showing gyms near you!',
    });

  const { data: gymsData } = useGyms();

  const gyms = useMemo(() => {
    return gymsData || [];
  }, [gymsData]);

  const filteredGyms = useMemo(() => {
    return gyms.filter((gym) => {
      const matchesSearch =
        gym.gymName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gym.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = !city || gym.city.toLowerCase().includes(city.toLowerCase());
      const matchesArea = !area || gym.area.toLowerCase().includes(area.toLowerCase());

      return matchesSearch && matchesCity && matchesArea;
    });
  }, [gyms, searchQuery, city, area]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.gradientOverlay} />

        <section className={styles.header}>
          <GymsHero />
          <StoriesBar userType="gym" />
          <GymsFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            city={city}
            setCity={setCity}
            area={area}
            setArea={setArea}
            onDetectLocation={detect}
            isDetectingLocation={isDetecting}
            isLocationActive={Boolean(city || area)}
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
