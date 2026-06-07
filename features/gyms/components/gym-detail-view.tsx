"use client";

import { SpinnerIos20Regular } from "@fluentui/react-icons";
import { GymProfileView } from "@/features/profile/components/gym-profile-view";
import { mockProfiles, GymProfile } from "@/features/profile/mock-data";
import { useGym } from "../services/gyms.service";
import { GymDetailViewProps } from "../types";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-4 md:px-8 pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
};

export function GymDetailView({ id }: GymDetailViewProps) {
  const { data: gym, isLoading, error } = useGym(id);

  if (isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <SpinnerIos20Regular className="animate-spin text-primary" style={{ width: 40, height: 40 }} />
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
