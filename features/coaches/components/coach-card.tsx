'use client';

import { useTranslations } from 'next-intl';
import { COMMON_COACH_IMAGE } from '@/constants/coaches';
import { Link } from '@/i18n/routing';
import { Coach } from '../types';

const styles = {
  card: "group bg-surface rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 border border-white/5 shadow-xl block hover:border-primary/30 hover:shadow-primary/10 flex flex-col",
  banner: "relative h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-background overflow-hidden",
  bannerPattern: "absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:14px_14px]",
  avatarWrap: "absolute left-1/2 -translate-x-1/2 -bottom-12 z-10",
  avatarRing: "relative w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-primary via-primary/70 to-primary/30 shadow-lg shadow-primary/20",
  avatarInner: "w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center",
  avatarImg: "w-full h-full object-cover",
  info: "pt-16 px-5 pb-5 text-center flex flex-col gap-1 flex-1",
  name: "font-headline text-xl font-black uppercase leading-tight",
  experience: "font-body text-primary text-[11px] font-black uppercase tracking-wider",
  tagContainer: "flex flex-wrap gap-1.5 justify-center mt-3",
  tag: "bg-white/5 text-foreground/60 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border border-white/5 group-hover:border-primary/20 transition-colors",
};

export function CoachCard({ coach, index }: { coach: Coach, index: number }) {
  const t = useTranslations('Coaches');

  return (
    <Link
      href={`/coaches/${coach.id}` as any}
      className={styles.card}
      style={{ animationDelay: `${0.1 * (index % 4)}s` }}
    >
      <div className={styles.banner}>
        <div className={styles.bannerPattern} />
        <div className={styles.avatarWrap}>
          <div className={styles.avatarRing}>
            <div className={styles.avatarInner}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coach.photo || COMMON_COACH_IMAGE}
                alt={coach.fullName}
                className={styles.avatarImg}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{coach.fullName}</span>
        <span className={styles.experience}>
          {t('yearsExp', { years: coach.experienceYears })}
        </span>
        <div className={styles.tagContainer}>
          {coach.specialization.map((spec: string) => (
            <span key={spec} className={styles.tag}>
              {spec}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
