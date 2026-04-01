'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { COACHES } from '@/constants/coaches';

// Modular Components
import { CoachesHero } from './coaches-hero';
import { CoachesFilter } from './coaches-filter';
import { CoachCard } from './coach-card';

export function CoachesView() {
  const t = useTranslations('Coaches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const filteredCoaches = useMemo(() => {
    return COACHES.filter((coach) => {
      const matchesSearch =
        coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coach.tier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === 'All' || coach.specializations.includes(selectedSpecialty);

      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">

      <main className="pt-24 pb-12">
        {/* Header Section */}
        <section className="py-8 md:py-12 border-b border-white/5 relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent blur-3xl -z-10" />
          <div className="px-6 mx-auto">
            <CoachesHero />
            <CoachesFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedSpecialty={selectedSpecialty}
              setSelectedSpecialty={setSelectedSpecialty}
            />
          </div>
        </section>

        {/* Coaches Grid Container */}
        <div className="px-6 max-w-[1920px] mx-auto pt-12">
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/5 pb-8 gap-4">
              <div>
                <h2 className="font-headline text-3xl font-black tracking-tight uppercase">
                  {t('featuredStaff')}
                </h2>
                <div className="h-1 w-20 bg-primary mt-4" />
              </div>
              <span className="font-body text-foreground/40 text-sm tracking-[0.3em] uppercase font-bold">
                {t('showingExperts', { count: filteredCoaches.length })}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCoaches.map((coach, idx) => (
                <CoachCard key={coach.id} coach={coach} index={idx} />
              ))}
            </div>

            {/* Empty State */}
            {filteredCoaches.length === 0 && (
              <div className="py-32 text-center animate-premium-in">
                <div className="inline-block p-6 bg-white/5 rounded-full mb-6">
                  <span className="material-symbols-outlined text-5xl text-foreground/20">
                    search_off
                  </span>
                </div>
                <p className="text-foreground/60 font-body text-xl font-bold uppercase tracking-widest">
                  {t('noCoaches')}
                </p>
                <button
                  onClick={() => {
                    setSelectedSpecialty('All');
                    setSearchQuery('');
                  }}
                  className="mt-6 text-primary font-headline font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all"
                >
                  {t('clearFilters')}
                </button>
              </div>
            )}


          </section>
        </div>
      </main>


    </div>
  );
}
