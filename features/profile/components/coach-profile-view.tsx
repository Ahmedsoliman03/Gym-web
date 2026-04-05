"use client";

import { CoachProfileHeader } from "./coach-profile-header";
import { CoachPhilosophy } from "./coach-philosophy";
import { TransformationGallery } from "./transformation-gallery";
import { CoachCredentials } from "./coach-credentials";
import { CoachContact } from "./coach-contact";
import { CoachProfile } from "../mock-data";

const styles = {
  container: "space-y-8 animate-premium-in",
  philosophyWrapper: "space-y-6",
  gridWrapper: "grid grid-cols-1 lg:grid-cols-3 gap-8",
  mainColumn: "lg:col-span-2",
  sideColumn: "lg:col-span-1"
};

export const CoachProfileView = ({ data }: { data: CoachProfile }) => {
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
          title={data.philosophy.title}
          description={data.philosophy.description}
        />
        <TransformationGallery transformations={data.transformations} />
      </div>
      <div className={styles.gridWrapper}>
        <div className={styles.mainColumn}>
          <CoachCredentials
            certifications={data.credentials.certifications}
            specializations={data.credentials.specializations}
          />
        </div>
        <div className={styles.sideColumn}>
          <CoachContact coachName={data.name} />
        </div>
      </div>
    </div>
  );
};
