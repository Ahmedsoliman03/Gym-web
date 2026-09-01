"use client";

import { useState } from "react";
import { Mail, Phone, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import { UserProfile } from "../types";
import { WeightProgress } from "./WeightProgress";
import { WeeklyProgressCardSection } from "./WeeklyProgressCard";

const styles = {
  container: "max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
  header: "bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden group shadow-2xl",
  gradientOverlay: "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 pointer-events-none",
  avatarWrapper: "w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden shadow-lg shadow-primary/10 relative z-10 shrink-0",
  avatarImage: "w-full h-full object-cover",
  avatarFallback: "w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-3xl",
  infoWrapper: "flex-1 text-center md:text-start relative z-10",
  subtitle: "text-primary/80 font-bold text-xs uppercase tracking-widest mb-1.5",
  name: "text-3xl font-black tracking-tight mb-1 text-white",
  contactRow: "flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-1.5 sm:gap-4 text-sm text-foreground/50",
  contactItem: "flex items-center justify-center md:justify-start gap-1.5",
  editBtn: "shrink-0 relative z-10 bg-white/5 hover:bg-white/10 text-foreground font-bold py-3 px-5 rounded-xl border border-white/10 flex items-center justify-center gap-2 whitespace-nowrap transition-all active:scale-[0.98]",
  sectionHeading: "flex items-center gap-3 mb-2",
  sectionLabel: "text-primary/80 font-bold text-xs uppercase tracking-widest",
  sectionLine: "flex-1 h-px bg-white/5",
};

/** Get initials for the fallback avatar (no photo set yet). */
const getInitials = (nameStr: string) => {
  if (!nameStr) return "?";
  return nameStr
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const ClientProfileView = ({ data }: { data: UserProfile }) => {
  const t = useTranslations();
  const [photoOpen, setPhotoOpen] = useState(false);
  const photo = data.profile.photo;

  return (
    <div className={styles.container}>
      {/* Client Header — read-only identity + a link out to the dedicated
          edit page, same pattern the coach/gym headers already use. Photo,
          name and phone used to be editable right here too (with their own
          upload/save flow), duplicating /profile/edit's ClientEditForm —
          removed in favor of that single, existing flow. */}
      <div className={styles.header}>
        <div className={styles.gradientOverlay} />

        <div
          className={`${styles.avatarWrapper} ${photo ? 'cursor-pointer' : ''}`}
          onClick={photo ? () => setPhotoOpen(true) : undefined}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={data.fullName} className={styles.avatarImage} />
          ) : (
            <div className={styles.avatarFallback}>{getInitials(data.fullName)}</div>
          )}
        </div>

        {photo && (
          <ImageLightbox
            isOpen={photoOpen}
            onClose={() => setPhotoOpen(false)}
            images={[photo]}
            currentIndex={0}
          />
        )}

        <div className={styles.infoWrapper}>
          <p className={styles.subtitle}>{t('Profile.client') || 'Client Member'}</p>
          <h1 className={styles.name}>{data.fullName}</h1>
          <div className={styles.contactRow}>
            <span className={styles.contactItem}>
              <Mail size={13} className="text-foreground/30 shrink-0" />
              {data.email}
            </span>
            {data.phone && (
              <span className={styles.contactItem}>
                <Phone size={13} className="text-foreground/30 shrink-0" />
                {data.phone}
              </span>
            )}
          </div>
        </div>

        <Link href="/profile/edit" className={styles.editBtn}>
          <Settings size={18} />
          {t('Profile.editProfile') || 'Edit Profile'}
        </Link>
      </div>

      {/* Fitness Tracking — the only content on this page now. */}
      <div className="space-y-8">
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>{t('Profile.fitnessTrackingSection') || 'Fitness Tracking'}</span>
          <div className={styles.sectionLine} />
        </div>
        <WeightProgress />
        <WeeklyProgressCardSection />
      </div>
    </div>
  );
};
