"use client";

import { GymProfile } from "../mock-data";
import { MapPin, Star, Users, Clock } from "lucide-react";
import Image from "next/image";

const styles = {
  container: "space-y-8 animate-premium-in",
  header: "bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center",
  logoWrapper: "w-32 h-32 rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden relative",
  logoImage: "object-cover p-4",
  infoWrapper: "flex-1 text-center md:text-left",
  title: "text-4xl font-bold mb-2",
  statsList: "flex flex-wrap justify-center md:justify-start gap-4 text-foreground/60 text-sm",
  statItem: "flex items-center gap-1",
  ratingStar: "text-yellow-500",
  primaryBtn: "bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20",
  gridWrapper: "grid grid-cols-1 lg:grid-cols-3 gap-8",
  mainColumn: "lg:col-span-2 space-y-8",
  card: "bg-surface p-8 rounded-3xl border border-white/5",
  sectionTitle: "text-xl font-bold mb-4 text-primary uppercase tracking-wider",
  description: "text-foreground/70 leading-relaxed italic",
  programsGrid: "grid grid-cols-2 md:grid-cols-4 gap-4",
  programTag: "p-4 bg-white/5 rounded-2xl border border-white/10 text-center font-bold text-sm",
  sideColumn: "bg-surface p-8 rounded-3xl border border-white/5",
  facilitiesList: "space-y-4",
  facilityItem: "flex items-center gap-3 text-foreground/80 font-medium",
  facilityDot: "w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgb(34,197,94)]"
};

export const GymProfileView = ({ data }: { data: GymProfile }) => {
  return (
    <div className={styles.container}>
      {/* Gym Header */}
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
           <Image 
                src={data.image} 
                alt={data.name} 
                fill 
                className={styles.logoImage}
            />
        </div>
        <div className={styles.infoWrapper}>
          <h1 className={styles.title}>{data.name}</h1>
          <div className={styles.statsList}>
            <span className={styles.statItem}><MapPin size={16} /> {data.location}</span>
            <span className={styles.statItem}><Star size={16} className={styles.ratingStar} /> {data.rating} Rating</span>
            <span className={styles.statItem}><Users size={16} /> {data.memberCount} Members</span>
            <span className={styles.statItem}><Clock size={16} /> {data.workingHours}</span>
          </div>
        </div>
        <button className={styles.primaryBtn}>
          Book a Tour
        </button>
      </div>

      <div className={styles.gridWrapper}>
        <div className={styles.mainColumn}>
          {/* About */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>About our facility</h2>
            <p className={styles.description}>{data.description}</p>
          </div>
          
          {/* Programs */}
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Active Programs</h2>
            <div className={styles.programsGrid}>
              {data.programs.map(program => (
                <div key={program} className={styles.programTag}>
                  {program}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className={styles.sideColumn}>
          <h2 className={styles.sectionTitle}>Facilities</h2>
          <ul className={styles.facilitiesList}>
            {data.facilities.map(facility => (
              <li key={facility} className={styles.facilityItem}>
                <div className={styles.facilityDot} />
                {facility}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
