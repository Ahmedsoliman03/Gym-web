"use client";

import { CoachProfileHeader } from "./coach-profile-header";
import { CoachPhilosophy } from "./coach-philosophy";
import { TransformationGallery } from "./transformation-gallery";
import { CoachCredentials } from "./coach-credentials";
import { CoachContact } from "./coach-contact";
import { CoachProfile } from "../mock-data";

export const CoachProfileView = ({ data }: { data: CoachProfile }) => {
  return (
    <div className="space-y-8 animate-premium-in">
      <CoachProfileHeader
        name={data.name}
        title={data.title}
        tier={data.tier}
        stats={data.stats}
        image={data.image}
      />
      <div className="space-y-6">
        <CoachPhilosophy
          title={data.philosophy.title}
          description={data.philosophy.description}
        />
        <TransformationGallery transformations={data.transformations} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CoachCredentials
            certifications={data.credentials.certifications}
            specializations={data.credentials.specializations}
          />
        </div>
        <div className="lg:col-span-1">
          <CoachContact coachName={data.name} />
        </div>
      </div>
    </div>
  );
};
