"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { CoachProfileHeader } from "./coach-profile-header";
import { CoachPhilosophy } from "./coach-philosophy";
import { TransformationGallery } from "@/components/shared/transformation-gallery";
import { CoachCredentials } from "./coach-credentials";
import { Plans } from "@/components/shared/membership-plans";
import type { CoachProfileViewModel } from "../types";
import type { Story } from "@/features/stories/types";
import { ProfilePosts } from "./profile-posts";

const styles = {
  container: "space-y-8",
  philosophyWrapper: "space-y-6",
  gridWrapper: "flex flex-wrap gap-6 items-start",
  mainColumn: "",
  sideColumn: ""
};

export const CoachProfileView = ({
  data,
  isOwner = true,
  stories,
  profileId,
  postsViewAllHref,
  promocode,
  email,
}: {
  data: CoachProfileViewModel;
  isOwner?: boolean;
  stories?: Story[];
  profileId?: string;
  postsViewAllHref?: string;
  promocode?: string;
  email?: string;
}) => {
  const t = useTranslations("Profile");
  const plansRef = useRef<HTMLDivElement>(null);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.container}>
      <CoachProfileHeader
        name={data.name}
        stats={data.stats}
        image={data.image}
        isOwner={isOwner}
        coachId={data.id}
        coachUserId={data.userId}
        stories={stories}
        promocode={promocode}
    
        specializations={isOwner ? data.specializations : undefined}
        email={isOwner ? email : undefined}
      />

      <div className={styles.philosophyWrapper}>
        <CoachPhilosophy
          description={data.description}
          onGoToPlans={scrollToPlans}
          isOwner={isOwner}
        />
        <TransformationGallery
          transformations={data.transformations}
          isOwner={isOwner}
          emptyVisitorMessage={t('noTransformationsYet')}
        />
      </div>
      {/* Recent posts — placed after the philosophy + transformations cards
          so the visitor reads the coach's pitch before browsing posts. */}
      {profileId && (
        <ProfilePosts
          profileType="coach"
          profileId={profileId}
          ownerName={data.name}
          isOwner={isOwner}
          viewAllHref={postsViewAllHref}
        />
      )}
      <TransformationGallery
        title={t('certifications')}
        hideOverlay
        transformations={data.credentials.certifications.map(cert => ({
          clientName: t('certification'),
          duration: "",
          image: cert
        }))}
        isOwner={isOwner}
        emptyVisitorMessage={t('noCertificationsYet')}
      />
      <Plans ref={plansRef} plans={data.plans} isOwner={isOwner} />


      <div className={styles.gridWrapper}>
        <CoachCredentials
          specializations={data.credentials.specializations}
          isOwner={isOwner}
        />
      </div>

    </div>
  );
};
