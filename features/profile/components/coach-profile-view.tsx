"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { CoachProfileHeader } from "./coach-profile-header";
import { CoachPhilosophy } from "./coach-philosophy";
import { TransformationGallery } from "@/components/shared/transformation-gallery";
import { CoachCredentials } from "./coach-credentials";
// import { CoachContact } from "./coach-contact";
import { Plans } from "@/components/shared/membership-plans";
import { CoachProfile } from "../mock-data";

const styles = {
  container: "space-y-8",
  philosophyWrapper: "space-y-6",
  gridWrapper: "flex flex-wrap gap-6 items-start",
  mainColumn: "",
  sideColumn: ""
};

export const CoachProfileView = ({ data }: { data: CoachProfile }) => {
  const t = useTranslations("Profile");
  const plansRef = useRef<HTMLDivElement>(null);

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.container}>
      <CoachProfileHeader
        name={data.name}
        title={data.title}
        tier={data.tier}
        stats={data.stats}
        image={data.image}
      />

      <div className={styles.philosophyWrapper}>
        <CoachPhilosophy
          description={data.description}
          onGoToPlans={scrollToPlans}
        />
        <TransformationGallery transformations={data.transformations} />
      </div>
      <TransformationGallery
        title={t('certifications')}
        hideOverlay
        transformations={data.credentials.certifications.map(cert => ({
          clientName: t('certification'),
          duration: "",
          image: cert
        }))}
      />
      <Plans ref={plansRef} plans={data.plans} />


      <div className={styles.gridWrapper}>
        <CoachCredentials
          specializations={data.credentials.specializations}
        />
        {/* <CoachContact coachName={data.name} /> */}
      </div>

    </div>
  );
};
