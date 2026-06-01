'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { GymsHero } from './gyms-hero';
import { GymsFilter } from './gyms-filter';
import { GymCard } from './gym-card';
import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGyms } from '../services/gyms.service';
import { useLocationDetect } from '@/hooks/use-location-detect';
import { StoriesBar } from '@/features/stories/components/stories-bar';
import toast from 'react-hot-toast';

const styles = {
  container: "min-h-screen bg-background text-foreground font-sans selection:bg-primary/30",
  main: "pt-24 pb-12",
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

const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem(key);
      }
    } catch (e) {
      console.warn('sessionStorage is not accessible:', e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('sessionStorage is not accessible:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('sessionStorage is not accessible:', e);
    }
  }
};

export function GymsView() {
  const t = useTranslations('Gyms');
  const tLoc = useTranslations('Location');
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const isRestoredRef = useRef(false);

  const { data: gymsData } = useGyms();

  const { detect } = useLocationDetect((result) => {
    // Map governorate/county (e.g. Giza, Cairo) to City search input
    let detectedCity = '';
    if (result.governorate) {
      detectedCity = result.governorate;
    } else if (result.city && (result.city.toLowerCase() === 'cairo' || result.city.toLowerCase() === 'giza')) {
      detectedCity = result.city;
    }

    // Map town/suburb (e.g. 6th of October, Maadi) to Area search input
    let detectedArea = '';
    if (result.city && result.city.toLowerCase() !== 'cairo' && result.city.toLowerCase() !== 'giza') {
      detectedArea = result.city;
    } else if (result.area) {
      detectedArea = result.area;
    }

    if (detectedCity) {
      setCity(detectedCity);
      safeSessionStorage.setItem('detected_city', detectedCity);
    }
    if (detectedArea) {
      setArea(detectedArea);
      safeSessionStorage.setItem('detected_area', detectedArea);
    }

    safeSessionStorage.setItem('location_detected', 'true');
    toast.success(tLoc('locationDetected') || 'Location detected: Showing gyms near you!');
  });

  // Sync city changes to sessionStorage to handle language/route changes
  useEffect(() => {
    if (!isRestoredRef.current) return;
    if (city) {
      safeSessionStorage.setItem('detected_city', city);
    } else {
      safeSessionStorage.removeItem('detected_city');
    }
  }, [city]);

  // Sync area changes to sessionStorage to handle language/route changes
  useEffect(() => {
    if (!isRestoredRef.current) return;
    if (area) {
      safeSessionStorage.setItem('detected_area', area);
    } else {
      safeSessionStorage.removeItem('detected_area');
    }
  }, [area]);

  useEffect(() => {
    const hasDetected = safeSessionStorage.getItem('location_detected');
    const hasStarted = safeSessionStorage.getItem('location_detect_started');

    if (hasDetected) {
      // Restore detected values if they exist
      const storedCity = safeSessionStorage.getItem('detected_city');
      const storedArea = safeSessionStorage.getItem('detected_area');
      if (storedCity) setCity(storedCity);
      if (storedArea) setArea(storedArea);
      isRestoredRef.current = true;
      return;
    }

    if (hasStarted) {
      isRestoredRef.current = true;
      return;
    }

    safeSessionStorage.setItem('location_detect_started', 'true');
    detect();
    isRestoredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <div className="mb-8">
            <StoriesBar userType="gym" />
          </div>
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
