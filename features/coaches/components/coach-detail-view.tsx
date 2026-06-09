"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { GLoader } from "@/components/ui/g-loader";
import { CoachProfileView } from "@/features/profile/components/coach-profile-view";
import { mockProfiles, CoachProfile } from "@/features/profile/mock-data";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { useCoach } from "../services/coaches.service";
import { CoachDetailViewProps } from "../types";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-20 sm:pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
};

export function CoachDetailView({ id }: CoachDetailViewProps) {
  const router = useRouter();
  const { profile } = useProfileUser();
  const { data: coach, isLoading, error } = useCoach(id);

  // If the detail page id matches the logged-in user, send them to /profile.
  // The backend echoes either the user account id or the inner profile id in
  // `coach.id` depending on endpoint, so match either one (mirrors the same
  // dual-id check used in job-card.tsx for gym ownership).
  const myUserId = profile?.id;
  const myCoachProfileId =
    profile?.userType === 'coach' ? profile.profile?.id : undefined;
  const isMe =
    profile?.userType === 'coach' &&
    !!id &&
    (id === myUserId || id === myCoachProfileId);

  useEffect(() => {
    if (isMe) router.replace('/profile');
  }, [isMe, router]);

  if (isMe || isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <GLoader size={72} />
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
