"use client";

import type { GymProfileViewModel } from "../types";
import { MapPin, Users, MessageSquare, Settings } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { TransformationGallery } from "@/components/shared/transformation-gallery";
import { Plans } from "@/components/shared/membership-plans";
import { EmptySection } from "@/components/shared/empty-section";
import { useRef } from "react";
import { triggerChatOpen } from "@/features/chat/hooks/use-chat";
import { StoryAvatarBadge } from "@/features/stories/components/story-avatar-badge";
import { SPECIALIZATIONS } from "@/constants/specializations";
import type { Story } from "@/features/stories/types";
import { ProfilePosts } from "./profile-posts";

const styles = {
  container: "space-y-8",
  header: "bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center",
  // Avatar block — mirrors the coach profile header so the gym avatar shares
  // the same round photo + primary ring + story-state overlay UI.
  avatarWrapper: "relative",
  avatarBorder: "w-40 h-40 rounded-full border-4 border-primary p-1 overflow-hidden",
  avatarInner: "w-full h-full rounded-full overflow-hidden relative",
  avatarImage: "object-cover",
  statusBadge: "absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full border-4 border-surface",
  infoWrapper: "flex-1 text-center md:text-left",
  title: "text-4xl font-bold mb-2",
  statsList: "flex flex-wrap justify-center md:justify-start gap-4 text-foreground/60 text-sm",
  statItem: "flex items-center gap-1",
  ratingStar: "text-yellow-500",
  actionsWrapper: "flex flex-row md:flex-col gap-3 w-full md:w-auto",
  primaryBtn: "flex-1 md:w-44 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20",
  secondaryBtn: "flex-1 md:w-44 bg-white/5 hover:bg-white/10 text-foreground font-bold py-3 px-6 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
  card: "bg-surface p-8 rounded-3xl border border-white/5",
  sectionTitle: "text-xl font-bold mb-4 text-primary uppercase",
  description: "text-foreground/70 leading-relaxed",
  programsGrid: "grid grid-cols-2 md:grid-cols-4 gap-4",
  programTag: "p-4 bg-white/5 rounded-2xl border border-white/10 text-center font-bold text-sm",
  plansGrid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6",
  planCard: "bg-surface p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all",
  planHeader: "mb-6",
  planName: "text-2xl font-bold mb-1",
  planDuration: "text-primary text-sm font-bold uppercase tracking-wider",
  planFeatures: "space-y-3 mb-8 w-full",
  featureItem: "flex items-center justify-center gap-2 text-foreground/60 text-sm",
  planPricing: "mt-auto space-y-1 w-full pt-6 border-t border-white/5",
  oldPrice: "text-foreground/30 line-through text-sm",
  currentPrice: "text-2xl font-black text-foreground",
  buyBtn: "w-full mt-4 bg-white/5 hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all py-3 rounded-xl font-bold text-sm",
  textBtn: "text-primary hover:text-primary/80 font-bold text-sm transition-all flex items-center gap-1 group"
};

export const GymProfileView = ({
  data,
  isOwner = true,
  stories,
  profileId,
  postsViewAllHref,
}: {
  data: GymProfileViewModel;
  isOwner?: boolean;
  stories?: Story[];
  /** The role-specific GymProfile.id used to fetch authored community posts.
   *  Distinct from `data.id`, which holds the User.id for chat/messaging. */
  profileId?: string;
  /** Where the inline "See all posts" link points. Defaults inside
   *  `ProfilePosts` to `/my-posts` (right for the owner's own /profile page);
   *  detail pages should pass e.g. `/gyms/{id}/posts`. */
  postsViewAllHref?: string;
}) => {
  const t = useTranslations("Profile");
  const t_root = useTranslations();
  const plansRef = useRef<HTMLDivElement>(null);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Map gym images to look like "transformations" for the gallery component
  const galleryImages = data.images.map((img, i) => ({
    clientName: `${t('facilityView')} ${i + 1}`,
    duration: t('peakState'),
    image: img
  }));

  // Translate each program by looking it up in SPECIALIZATIONS. Anything the
  // table doesn't know about falls through as the raw API value so we don't
  // accidentally hide custom programs the gym set up.
  const translatedPrograms = (data.programs ?? []).map((program) => {
    const match = SPECIALIZATIONS.find((s) => s.value === program);
    return match ? t_root(match.label as any) : program;
  });

  return (
    <div className={styles.container}>
      {/* Gym Header */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatarBorder}>
            <div className={styles.avatarInner}>
              <Image
                src={data.image}
                alt={data.name}
                fill
                className={styles.avatarImage}
                unoptimized
              />
            </div>
          </div>
          <StoryAvatarBadge
            profileImage={data.image}
            profileName={data.name}
            isOwner={isOwner}
            authorId={data.id}
            authorUserType="gym"
            stories={stories}
          />
          {!isOwner && <div className={styles.statusBadge} />}
        </div>
        <div className={styles.infoWrapper}>
          <h1 className={styles.title}>{data.name}</h1>
          <div className={styles.statsList}>
            <span className={styles.statItem}><MapPin size={16} /> {data.location}</span>
            <span className={styles.statItem}><Users size={16} /> {data.memberCount} {t('members')}</span>
          </div>
        </div>
        <div className={styles.actionsWrapper}>
          {/* Chat is only useful when viewing someone else's gym — the owner
              has no one to chat with on their own page. Mirrors the coach
              profile header, which already hides chat for the owner. */}
          {!isOwner && (
            <button className={styles.primaryBtn} onClick={triggerChatOpen}>
              <MessageSquare size={18} />
              {t('chat')}
            </button>
          )}
          {isOwner && (
            <Link href="/profile/edit" className={styles.secondaryBtn}>
              <Settings size={18} />
              {t('editProfile')}
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* About */}
        <div className={styles.card}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={styles.sectionTitle}>{t('aboutFacility')}</h2>
            <button onClick={scrollToPlans} className={styles.textBtn}>
              {t('goToPlans')}
            </button>
          </div>
          {data.description?.trim() ? (
            <p className={styles.description}>{data.description}</p>
          ) : (
            <EmptySection
              isOwner={isOwner}
              visitorMessage={t('noAboutYet')}
              variant="compact"
            />
          )}
        </div>

        {/* Slider of Gym Images */}
        <TransformationGallery
          transformations={galleryImages}
          title={t('facilityGallery')}
          hideOverlay={true}
          isOwner={isOwner}
          emptyVisitorMessage={t('noGalleryYet')}
        />

        {/* Recent posts — surfaced after the about + gallery cards so the
            visitor sees content before scrolling further into programs. */}
        {profileId && (
          <ProfilePosts
            profileType="gym"
            profileId={profileId}
            ownerName={data.name}
            isOwner={isOwner}
            viewAllHref={postsViewAllHref}
          />
        )}

        {/* Programs — translated from API specializations */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>{t('activePrograms')}</h2>
          {translatedPrograms.length === 0 ? (
            <EmptySection
              isOwner={isOwner}
              visitorMessage={t('noProgramsYet')}
              variant="compact"
            />
          ) : (
            <div className={styles.programsGrid}>
              {translatedPrograms.map((program, idx) => (
                <div key={`${program}-${idx}`} className={styles.programTag}>
                  {program}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Plans ref={plansRef} plans={data.plans} isOwner={isOwner} />
    </div>
  );
};

