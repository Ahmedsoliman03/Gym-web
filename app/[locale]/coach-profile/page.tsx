import { mockProfiles } from "@/features/profile/mock-data";
import { CoachProfileView } from "@/features/profile/components/coach-profile-view";
import { GymProfileView } from "@/features/profile/components/gym-profile-view";
import { ClientProfileView } from "@/features/profile/components/client-profile-view";
import { notFound } from "next/navigation";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-4 md:px-8 pt-32"
};

// This page currently hardcodes "marcus-thorne" but logic is ready for dynamic routes
export default async function ProfilePage() {
  const profileId = "elite-hq"; // In a real scenario, this comes from params
  const profile = mockProfiles[profileId];

  if (!profile) {
    notFound();
  }

  const renderProfile = () => {
    switch (profile.type) {
      case 'coach':
        return <CoachProfileView data={profile} />;
      case 'gym':
        return <GymProfileView data={profile} />;
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
