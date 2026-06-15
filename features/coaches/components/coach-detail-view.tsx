"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { GLoader } from "@/components/ui/g-loader";
import { CoachProfileView } from "@/features/profile/components/coach-profile-view";
import type { CoachProfileViewModel } from "@/features/profile/types";
import { useProfileLink } from "@/features/profile/hooks/useProfileLink";
import { useCoach } from "../services/coaches.service";
import { CoachDetailViewProps } from "../types";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-20 sm:pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
};

export function CoachDetailView({ id }: CoachDetailViewProps) {
  const router = useRouter();
  const { data: coach, isLoading, error } = useCoach(id);
  // Dual-id self-check lives in the hook (matches user-id or inner profile id).
  // We only act on it when the URL belongs to a coach detail page.
  const { isSelf } = useProfileLink(id, 'coach');

  useEffect(() => {
    if (isSelf) router.replace('/profile');
  }, [isSelf, router]);

  if (isSelf || isLoading) {
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


  const mappedCoach: CoachProfileViewModel = {
    // `data.id` carries the User.id (used for chat + story-author links).
    // `/api/coaches/{id}` is keyed by profile id, so we read the dedicated
    // `userId` field the backend exposes for messaging.
    id: coach.id,
    userId: coach.userId,
    type: "coach",
    name: coach.fullName || "",
    image: coach.photo || "/images/profile/marcus.png",
    status: coach.status,
    description: coach.description || "",
    stats: [
      {
        label: "EXP",
        value: coach.experienceYears != null ? `${coach.experienceYears}y` : "—",
      },
      {
        label: "CLIENTS",
        value:
          coach.numberOfClients != null ? String(coach.numberOfClients) : "—",
      },
    ],
    transformations: (coach.transformations ?? []).map((tr) => ({
      clientName: tr.clientName,
      duration: tr.duration ?? '',
      image: typeof tr.image === 'string' ? tr.image : '',
    })),
    credentials: {

      certifications: (coach.certifications ?? []).map((cert) => cert.file),
      specializations: coach.specialization ?? [],
    },
    plans: coach.plans ?? [],
    socialMedia: coach.socialMedia ?? [],
    // Specialization-next-to-name indicator is intentionally left blank on
    // the visitor-facing detail page; that chip is owner-profile-only.
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <CoachProfileView
          data={mappedCoach}
          isOwner={false}
          stories={coach.stories}
          profileId={coach.id}
          postsViewAllHref={`/coaches/${coach.id}/posts`}
        />
      </div>
    </main>
  );
}
