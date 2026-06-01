'use client';

import { useTranslations } from 'next-intl';
import { COMMON_COACH_IMAGE } from '@/constants/coaches';
import { Link } from '@/i18n/routing';
import { Coach } from '../types';

const styles = {
  card: "group bg-surface rounded-2xl overflow-hidden hover:translate-y-[-12px] transition-all duration-500 border border-white/5 shadow-2xl block hover:border-primary/30",
  imageContainer: "relative aspect-[4/5] overflow-hidden",
  image: "w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100",
  imageOverlay: "absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-background via-background/80 to-transparent",
  name: "font-headline text-3xl font-black block mb-1 leading-none uppercase",
  experience: "font-body text-primary text-xs font-black uppercase",
  location: "flex items-center gap-1.5 text-foreground/40 text-xs font-bold",
  content: "flex-1",
  tagContainer: "flex flex-wrap gap-2 py-5 px-6",
  tag: "bg-white/5 text-foreground/40 px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase border border-white/5 group-hover:border-primary/20 transition-colors"
};

export function CoachCard({ coach, index }: { coach: Coach, index: number }) {
  const t = useTranslations('Coaches');

  return (
    <Link
      href={`/coaches/${coach.id}` as any}
      className={styles.card}
      style={{ animationDelay: `${0.1 * (index % 4)}s` }}
    >
      <div className="flex flex-col h-full">
        {/* Image Section */}
        <div className={styles.imageContainer}>
          <img
            src={COMMON_COACH_IMAGE}
            alt={coach.fullName}
            className={styles.image}
          />

          <div className={styles.imageOverlay}>
            <span className={styles.name}>{coach.fullName}</span>
            <span className={styles.experience}>
              {t('yearsExp', { years: coach.experienceYears })}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className={styles.content}>
          <div className={styles.tagContainer}>
            {coach.specialization.map((spec: string) => (
              <span
                key={spec}
                className={styles.tag}
              >
                {spec}
              </span>
            ))}
          </div>

        </div>
      </div>
    </Link>
  );
}
