'use client';

import { Link } from '@/i18n/routing';
import { GymCardProps } from '../types';

const DEFAULT_GYM_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop';

const styles = {
  card: "group bg-surface rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 border border-white/5 shadow-xl block hover:border-primary/30 hover:shadow-primary/10 flex flex-col",
  banner: "relative h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-background overflow-hidden",
  bannerPattern: "absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:14px_14px]",
  logoWrap: "absolute left-1/2 -translate-x-1/2 -bottom-10 z-10",
  logoFrame: "relative w-20 h-20 rounded-2xl p-[3px] bg-gradient-to-br from-primary via-primary/70 to-primary/30 shadow-lg shadow-primary/20",
  logoInner: "w-full h-full rounded-xl overflow-hidden bg-surface flex items-center justify-center",
  logoImg: "w-full h-full object-cover",
  info: "pt-14 px-5 pb-5 text-center flex flex-col gap-1",
  name: "font-headline text-xl font-black uppercase leading-tight text-foreground",
  location: "font-body text-foreground/40 text-[11px] font-black uppercase tracking-wider",
};

export function GymCard({ gym, index }: GymCardProps) {
  const imageUrl = gym.mainPhoto || DEFAULT_GYM_IMAGE;

  return (
    <Link
      href={`/gyms/${gym.id}` as any}
      className={styles.card}
      style={{ animationDelay: `${0.1 * (index % 4)}s` }}
    >
      <div className={styles.banner}>
        <div className={styles.bannerPattern} />
        <div className={styles.logoWrap}>
          <div className={styles.logoFrame}>
            <div className={styles.logoInner}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={gym.gymName}
                className={styles.logoImg}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{gym.gymName}</span>
        <span className={styles.location}>{gym.location}</span>
      </div>
    </Link>
  );
}
