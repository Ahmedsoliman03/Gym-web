'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Gym } from '../types';

interface GymCardProps {
  gym: Gym;
  index: number;
}

const styles = {
  card: "group bg-surface rounded-2xl overflow-hidden transition-all duration-500 border border-white/5 shadow-2xl block hover:border-primary/30 hover:-translate-y-1",
  imageContainer: "relative aspect-video overflow-hidden",
  image: "object-cover transition-all duration-700 scale-105 group-hover:scale-110",
  imageOverlay: "absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-6",
  content: "p-6",
  name: "font-headline text-2xl font-black block mb-2 leading-none uppercase text-foreground",
  location: "font-body text-foreground/40 text-xs font-black uppercase",
};

export function GymCard({ gym, index }: GymCardProps) {
  const imageUrl = gym.mainPhoto || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop';

  return (
    <Link
      href={`/gyms/${gym.id}` as any}
      className={styles.card}
      style={{ animationDelay: `${0.1 * (index % 4)}s` }}
    >
      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={gym.gymName}
          fill
          className={styles.image}
          unoptimized
        />
        <div className={styles.imageOverlay}>
          <span className={styles.location}>{gym.location}</span>
        </div>
      </div>

      <div className={styles.content}>
        <span className={styles.name}>{gym.gymName}</span>
      </div>
    </Link>
  );
}
