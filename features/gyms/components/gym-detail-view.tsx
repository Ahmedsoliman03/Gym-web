"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { GLoader } from "@/components/ui/g-loader";
import { GymProfileView } from "@/features/profile/components/gym-profile-view";
import { mockProfiles, GymProfile } from "@/features/profile/mock-data";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { useGym } from "../services/gyms.service";
import { GymDetailViewProps } from "../types";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-20 sm:pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
};

export function GymDetailView({ id }: GymDetailViewProps) {
  const router = useRouter();
  const { profile } = useProfileUser();
  const { data: gym, isLoading, error } = useGym(id);

  // Self-route guard: if the logged-in gym is opening its own detail page,
  // send them to /profile. Backends echo either the user account id or the
  // inner gym profile id in `gym.id`, so match either.
  const myUserId = profile?.id;
  const myGymProfileId =
    profile?.userType === 'gym' ? profile.profile?.id : undefined;
  const isMe =
    profile?.userType === 'gym' &&
    !!id &&
    (id === myUserId || id === myGymProfileId);

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

  if (error || !gym) {
    return (
      <div className={styles.loaderWrapper}>
        <span className="text-red-500 font-bold uppercase tracking-wider">Failed to load gym.</span>
      </div>
    );
  }

  const baseGym = mockProfiles["elite-hq"] as GymProfile;
  const mappedGym: GymProfile = {
    ...baseGym,
    id: gym.id,
    name: gym.gymName || baseGym.name,
    location: gym.location || baseGym.location,
    memberCount: gym.memberCount !== undefined && gym.memberCount !== null
      ? gym.memberCount.toString()
      : baseGym.memberCount,
    image: gym.mainPhoto || baseGym.image,
    type: "gym" as const,
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <GymProfileView data={mappedGym} isOwner={false} stories={gym.stories} />
      </div>
    </main>
  );
}
