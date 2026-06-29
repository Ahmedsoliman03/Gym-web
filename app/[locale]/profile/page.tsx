"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { sectionDomId, type ChecklistKey } from "@/features/profile/checklist-sections";
import type { CoachProfileViewModel, GymProfileViewModel } from "@/features/profile/types";
import { CoachProfileView } from "@/features/profile/components/coach-profile-view";
import { GymProfileView } from "@/features/profile/components/gym-profile-view";
import { ClientProfileView } from "@/features/profile/components/client-profile-view";
import { ProfileTabs } from "@/features/profile/components/profile-tabs";
import { GLoader } from "@/components/ui/g-loader";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-20 sm:pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary"
};

export default function ProfilePage() {
  const { profile, isLoading, error } = useProfileUser();
  const searchParams = useSearchParams();
  const focus = searchParams.get("focus");

  useEffect(() => {
    if (!focus || isLoading || !profile) return;
    const id = sectionDomId(focus as ChecklistKey);
    const raf = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [focus, isLoading, profile]);

  if (isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <GLoader size={72} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.loaderWrapper}>
        <span className="text-red-500 font-bold uppercase tracking-wider">Failed to load profile. Please log in.</span>
      </div>
    );
  }
  const renderProfile = () => {
    switch (profile.userType) {
      case 'coach': {
        const coachProfile = profile.profile;

        const specs =
          coachProfile.specializations ?? coachProfile.specialization ?? [];
        const mappedCoach: CoachProfileViewModel = {
          id: profile.id,
          userId: profile.id,
          type: "coach",
          name: profile.fullName || coachProfile.name || "",
          image: coachProfile.photo || coachProfile.profileImage || "/images/profile/marcus.png",
          description: coachProfile.description || "",
          stats: [
            {
              label: "EXP",
              value: coachProfile.experienceYears != null
                ? `${coachProfile.experienceYears}y`
                : "—"
            },
            {
              label: "CLIENTS",
              value:
                coachProfile.numberOfClients != null
                  ? String(coachProfile.numberOfClients)
                  : "—",
            }
          ],
          transformations: (coachProfile.transformations ?? []).map((tr) => ({
            clientName: tr.clientName,
            duration: tr.duration ?? '',
            image: typeof tr.image === 'string' ? tr.image : '',
          })),
          credentials: {
            certifications: (coachProfile.certifications ?? []).map((c) => c.file),
            specializations: specs,
          },
          plans: coachProfile.plans ?? [],
          specializations: specs,
          socialMedia: coachProfile.socialMedia ?? [],
        };
        return (
          <CoachProfileView
            data={mappedCoach}
            isOwner
            profileId={coachProfile.id}
            promocode={coachProfile.promoCode}
            email={profile.email}
          />
        );
      }
      case 'gym': {
        const gymProfile = profile.profile;
        const mappedGym: GymProfileViewModel = {
          id: profile.id,
          userId: profile.id,
          type: "gym",
          name: gymProfile.gymName || profile.fullName || gymProfile.name || "",
          location: gymProfile.location || "",
          memberCount: gymProfile.memberCount != null
            ? gymProfile.memberCount.toString()
            : "",
          description: gymProfile.description || "",
          image: gymProfile.mainPhoto || gymProfile.photo || "/images/profile/gym-logo.png",
          images: (gymProfile.images ?? []).map((g) => g.image),
          programs: gymProfile.specializations ?? [],
          plans: gymProfile.plans ?? [],
          socialMedia: gymProfile.socialMedia ?? [],
        };
        return (
          <GymProfileView
            data={mappedGym}
            isOwner
            profileId={gymProfile.id}
            promocode={gymProfile.promoCode}
            email={profile.email}
          />
        );
      }
      case 'client':
        return <ClientProfileView data={profile} />;
      default:
        return null;
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Suspense fallback={null}>
          <ProfileTabs userType={profile.userType}>
            {renderProfile()}
          </ProfileTabs>
        </Suspense>
      </div>
    </main>
  );
}
