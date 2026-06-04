"use client";

import Image from "next/image";
import { MessageSquare, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { triggerChatOpen } from "@/features/chat/hooks/use-chat";
import { StoryAvatarBadge } from "@/features/stories/components/story-avatar-badge";

const styles = {
  // ... existing styles ...
  container: "relative w-full rounded-3xl bg-surface p-8 overflow-hidden border border-white/5",
  contentWrapper: "flex flex-col md:flex-row items-center  gap-8",
  avatarWrapper: "relative",
  avatarBorder: "w-40 h-40 rounded-full border-4 border-primary p-1 overflow-hidden",
  avatarInner: "w-full h-full rounded-full overflow-hidden relative",
  avatarImage: "object-cover",
  statusBadge: "absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full border-4 border-surface",
  infoWrapper: "flex-1 text-center md:text-left",
  titleAndTier: "flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2",
  name: "text-4xl font-bold text-foreground",
  tier: "bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30 uppercase",
  title: "text-foreground/40 font-bold",
  statsGrid: "flex flex-wrap justify-center md:justify-start gap-8",
  statItem: "flex flex-col",
  statValue: "text-2xl font-bold text-foreground",
  statLabel: "text-xs text-foreground/40 uppercase",
  actionsWrapper: "flex flex-row md:flex-col gap-3 w-full md:w-auto",
  primaryBtn: "flex-1 md:w-44 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20",
  secondaryBtn: "flex-1 md:w-44 bg-white/5 hover:bg-white/10 text-foreground font-bold py-3 px-6 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
};

interface CoachProfileHeaderProps {
  name: string;
  stats: {
    label: string;
    value: string;
  }[];
  image: string;
  isOwner?: boolean;
  coachId?: string;
}

export const CoachProfileHeader = ({
  name,
  stats,
  image,
  isOwner = true,
  coachId,
}: CoachProfileHeaderProps) => {
  const t = useTranslations("Profile");

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Profile Picture */}
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarBorder}>
            <div className={styles.avatarInner}>
              <Image
                src={image}
                alt={name}
                fill
                className={styles.avatarImage}
                unoptimized
              />
            </div>
          </div>
          <StoryAvatarBadge
            profileImage={image}
            profileName={name}
            isOwner={isOwner}
            authorId={coachId}
            authorUserType="coach"
          />
          {!isOwner && <div className={styles.statusBadge} />}
        </div>

        {/* Info */}
        <div className={styles.infoWrapper}>
          <div className={styles.titleAndTier}>
            <h1 className={styles.name}>{name}</h1>
           
          </div>

          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>
                  {t.has(stat.label.toLowerCase()) ? t(stat.label.toLowerCase()) : stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionsWrapper}>
           {!isOwner ?
          <button className={styles.primaryBtn} onClick={triggerChatOpen}>
            <MessageSquare size={18} />
            {t('chat')}
          </button>
         :
            <Link href="/profile/edit" className={styles.secondaryBtn}>
              <Settings size={18} />
              {t('editProfile')}
            </Link>
}
        </div>
      </div>
    </div>
  );
};
