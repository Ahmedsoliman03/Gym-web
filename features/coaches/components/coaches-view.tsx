'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCoaches } from '../services/coaches.service';
import { useAutoLocationFilter } from '@/hooks/use-auto-location-filter';

// Modular Components
import { CoachesHero } from './coaches-hero';
import { CoachesFilter } from './coaches-filter';
import { CoachCard } from './coach-card';
import { StoriesBar } from '@/features/stories/components/stories-bar';
import { CoachCardSkeleton } from '@/components/ui/skeletons/coach-card-skeleton';

const styles = {
  container: "min-h-screen bg-background text-foreground font-sans selection:bg-primary/30",
  main: "pt-20 sm:pt-24 pb-12",
  header: "px-4 sm:px-6 relative",
  gradientOverlay: "absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent blur-3xl -z-10",
  headerContent: "max-w-[1920px] mx-auto",
  gridContainer: "px-4 sm:px-6 md:px-12 max-w-[1920px] mx-auto",
  titleRow: "flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 border-b border-white/5 pb-6 sm:pb-8 gap-4",
  titleLabel: "font-headline text-2xl sm:text-3xl font-black uppercase",
  titleUnderline: "h-1 w-16 sm:w-20 bg-primary mt-3 sm:mt-4",
  showingText: "font-body text-foreground/40 text-xs sm:text-sm uppercase font-bold",
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8",
  emptyState: "py-16 sm:py-32 text-center",
  emptyIconWrapper: "inline-block p-6 bg-white/5 rounded-full mb-6",
  emptyIcon: "material-symbols-outlined text-5xl text-foreground/20",
  emptyText: "text-foreground/60 font-body text-xl font-bold uppercase",
  clearButton: "mt-6 text-primary font-headline font-black uppercase hover:brightness-110 transition-all font-bold"
};

export function CoachesView() {
  const t = useTranslations('Coaches');
  const tLoc = useTranslations('Location');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [experience, setExperience] = useState('All');

  const { city, setCity, area, setArea, detect, isDetecting, reset: resetLocation } =
    useAutoLocationFilter({
      successMessage:
        tLoc('locationDetected') || 'Location detected: Showing coaches near you!',
    });

  const { data: coachesData, isLoading } = useCoaches();

  const coaches = useMemo(() => {
    return coachesData || [];
  }, [coachesData]);

  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      const matchesSearch =
        coach.fullName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === 'All' || coach.specialization.includes(selectedSpecialty);

      const matchesExperience =
        experience === 'All' ||
        (experience === 'more_8'
          ? coach.experienceYears > 8
          : coach.experienceYears === parseInt(experience, 10));

      // Coach.city / Coach.area may be absent on the API today; when present,
      // apply the filter; when absent and the user has set a filter, keep the
      // record (be lenient so we don't hide all coaches by accident).
      const matchesCity =
        !city ||
        (coach.city ? coach.city.toLowerCase().includes(city.toLowerCase()) : true);
      const matchesArea =
        !area ||
        (coach.area ? coach.area.toLowerCase().includes(area.toLowerCase()) : true);

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesExperience &&
        matchesCity &&
        matchesArea
      );
    });
  }, [coaches, searchQuery, selectedSpecialty, experience, city, area]);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.header}>
          <div className={styles.gradientOverlay} />
          <div className={styles.headerContent}>
            <CoachesHero />
            <StoriesBar userType="coach" />
            <CoachesFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedSpecialty={selectedSpecialty}
              setSelectedSpecialty={setSelectedSpecialty}
              experience={experience}
              setExperience={setExperience}
              city={city}
              setCity={setCity}
              area={area}
              setArea={setArea}
              onDetectLocation={detect}
              isDetectingLocation={isDetecting}
              isLocationActive={Boolean(city || area)}
              onResetLocation={resetLocation}
            />
          </div>
        </section>

        <div className={styles.gridContainer}>

          <section>
            <div className={styles.titleRow}>
              <div>
                <h2 className={styles.titleLabel}>
                  {t('featuredStaff')}
                </h2>
                <div className={styles.titleUnderline} />
              </div>
              <span className={styles.showingText}>
                {t('showingExperts', { count: filteredCoaches.length })}
              </span>
            </div>

            {isLoading ? (
              <div className={styles.grid}>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <CoachCardSkeleton key={idx} />
                ))}
              </div>
            ) : filteredCoaches.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconWrapper}>
                  <span className={styles.emptyIcon}>
                    search_off
                  </span>
                </div>
                <p className={styles.emptyText}>
                  {t('noCoaches')}
                </p>
                <button
                  onClick={() => {
                    setSelectedSpecialty('All');
                    setSearchQuery('');
                    setExperience('All');
                    resetLocation();
                  }}
                  className={styles.clearButton}
                >
                  {t('clearFilters')}
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredCoaches.map((coach, idx) => (
                  <CoachCard key={coach.id} coach={coach} index={idx} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
