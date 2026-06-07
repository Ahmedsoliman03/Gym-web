"use client";

import { SpinnerIos20Regular } from "@fluentui/react-icons";
import { CoachProfileView } from "@/features/profile/components/coach-profile-view";
import { mockProfiles, CoachProfile } from "@/features/profile/mock-data";
import { useCoach } from "../services/coaches.service";
import { CoachDetailViewProps } from "../types";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-4 md:px-8 pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
};

export function CoachDetailView({ id }: CoachDetailViewProps) {
  const { data: coach, isLoading, error } = useCoach(id);

  if (isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <SpinnerIos20Regular className="animate-spin text-primary" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className={styles.loaderWrapper}>
        <span className="text-red-500 font-bold uppercase tracking-wider">Failed to load coach.</span>
      </div>
    );
  }

  const baseCoach = mockProfiles["marcus-thorne"] as CoachProfile;
  const mappedCoach: CoachProfile = {
    ...baseCoach,
    id: coach.id,
    name: coach.fullName || baseCoach.name,
    image: coach.photo || baseCoach.image,
    description: coach.description || baseCoach.description,
    stats: [
      {
        label: "EXP",
        value: coach.experienceYears !== undefined && coach.experienceYears !== null
          ? `${coach.experienceYears}y`
          : baseCoach.stats[0].value,
      },
      { label: "CLIENTS", value: baseCoach.stats[1].value },
    ],
    credentials: {
      certifications: coach.certifications && coach.certifications.length > 0
        ? coach.certifications.map((cert) => cert.file)
        : baseCoach.credentials.certifications,
      specializations: coach.specialization && coach.specialization.length > 0
        ? coach.specialization
        : baseCoach.credentials.specializations,
    },
    type: "coach" as const,
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <CoachProfileView data={mappedCoach} isOwner={false} stories={coach.stories} />
      </div>
    </main>
  );
}
