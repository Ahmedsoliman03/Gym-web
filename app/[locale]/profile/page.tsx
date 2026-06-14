"use client";

import { Suspense } from "react";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
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
        // `specialization` and `specializations` are both present on the API
        // payload; fall back across them so the header chip + credentials
        // section both have something to render.
        const specs =
          coachProfile.specializations ?? coachProfile.specialization ?? [];
        // No mock fallbacks. Each section's empty-state renders when its
        // field is missing/empty, and on this page (`isOwner=true`) the
        // empty-state shows a CTA back to /profile/edit.
        const mappedCoach: CoachProfileViewModel = {
          id: profile.id,
          // `/api/me` returns `User.id` at the top level — chat-target id.
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
            },
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
        // No mock fallbacks: each empty field flows into the section's
        // empty-state, which on the own profile shows a CTA back to edit.
        const mappedGym: GymProfileViewModel = {
          id: profile.id,
          // `/api/me` returns `User.id` at the top level — chat-target id.
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
