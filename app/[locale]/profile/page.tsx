"use client";

import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { mockProfiles } from "@/features/profile/mock-data";
import { CoachProfileView } from "@/features/profile/components/coach-profile-view";
import { GymProfileView } from "@/features/profile/components/gym-profile-view";
import { ClientProfileView } from "@/features/profile/components/client-profile-view";
import { SpinnerIos20Regular } from "@fluentui/react-icons";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-4 md:px-8 pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary"
};

export default function ProfilePage() {
  const { profile, isLoading, error } = useProfileUser();

  if (isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <SpinnerIos20Regular className="animate-spin text-primary" style={{ width: 40, height: 40 }} />
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
        const mockCoach = {
          ...mockProfiles["marcus-thorne"],
          id: profile.id,
          name: profile.fullName,
          image: profile.profile.photo || "/images/profile/marcus.png",
          type: "coach" as const
        };
        return <CoachProfileView data={mockCoach} />;
      }
      case 'gym': {
        const mockGym = {
          ...mockProfiles["elite-hq"],
          id: profile.id,
          name: profile.fullName,
          image: profile.profile.photo || "/images/profile/gym-logo.png",
          type: "gym" as const
        };
        return <GymProfileView data={mockGym} />;
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
        {renderProfile()}
      </div>
    </main>
  );
}
