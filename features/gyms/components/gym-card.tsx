'use client';

import Image from 'next/image';

interface GymCardProps {
  gym: {
    id: number;
    name: string;
    location: string;
    image: string;
    rating: number;
    memberCount: string;
  };
  index: number;
}

const styles = {
  card: "group bg-surface rounded-2xl overflow-hidden hover:translate-y-[-12px] transition-all duration-500 border border-white/5 shadow-2xl animate-premium-in",
  imageContainer: "relative aspect-video overflow-hidden",
  image: "object-cover transition-all duration-700 scale-105 group-hover:scale-110",
  imageOverlay: "absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-6",
  content: "p-6",
  name: "font-headline text-2xl font-black block mb-2 leading-none uppercase text-foreground group-hover:text-primary transition-colors",
  location: "font-body text-foreground/40 text-xs font-black tracking-[0.2em] uppercase",
};

export function GymCard({ gym, index }: GymCardProps) {
  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${0.1 * (index % 4)}s` }}
    >
      <div className={styles.imageContainer}>
        <Image
          src={gym.image}
          alt={gym.name}
          fill
          className={styles.image}
        />
        <div className={styles.imageOverlay}>
           <span className={styles.location}>{gym.location}</span>
        </div>
      </div>

      <div className={styles.content}>
        <span className={styles.name}>{gym.name}</span>
      </div>
    </div>
  );
}
