'use client';

import { Search } from 'lucide-react';

interface GymsFilterProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

const styles = {
  container: "relative group animate-premium-in z-20 max-w-2xl mx-auto mb-12",
  glow: "absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl blur-xl opacity-25 group-focus-within:opacity-100 transition duration-1000",
  content: "relative flex items-center bg-surface/40 backdrop-blur-md rounded-2xl p-2 gap-2 border border-white/5 shadow-2xl",
  searchWrapper: "flex flex-1 items-center bg-[#0D121F] rounded-xl px-4 gap-3 border border-white/5 focus-within:border-primary/30 transition-all",
  searchIcon: "text-foreground/30",
  searchInput: "bg-transparent border-none focus:ring-0 outline-none w-full text-foreground font-body text-base py-3.5 placeholder:text-foreground/20",
  resetButton: "bg-primary text-primary-foreground font-headline font-black px-8 py-4 rounded-xl active:scale-95 transition-all whitespace-nowrap shadow-xl shadow-primary/10 uppercase tracking-widest text-xs hover:brightness-110"
};

export function GymsFilter({
  searchQuery,
  setSearchQuery,
}: GymsFilterProps) {
  return (
    <div className={styles.container} style={{ animationDelay: '0.2s' }}>
      <div className={styles.glow} />
      <div className={styles.content}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            placeholder="Search for facilities, boxes, or studios..."
          />
        </div>

        <button
          className={styles.resetButton}
          onClick={() => setSearchQuery('')}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
