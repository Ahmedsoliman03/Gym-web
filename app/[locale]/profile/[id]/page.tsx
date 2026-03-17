import { mockProfiles } from "@/features/profile/mock-data";
import { CoachProfileView } from "@/features/profile/components/coach-profile-view";
import { GymProfileView } from "@/features/profile/components/gym-profile-view";
import { ClientProfileView } from "@/features/profile/components/client-profile-view";
import { notFound } from "next/navigation";

export default async function DynamicProfilePage({
  params
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id } = await params;
  const profile = mockProfiles[id];

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32">
        {profile.type === 'coach' && <CoachProfileView data={profile} />}
        {profile.type === 'gym' && <GymProfileView data={profile} />}
        {profile.type === 'client' && <ClientProfileView data={profile} />}
      </div>
    </main>
  );
}
