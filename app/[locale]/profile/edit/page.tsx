import { EditProfileForm } from "@/features/profile/components/edit-profile-form";
import { mockProfiles } from "@/features/profile/mock-data";

export default function EditProfilePage() {
  // Simulate getting the current user's profile
  // For demo, we'll use Marcus (Coach) or Elite (Gym)
  const profile = mockProfiles["marcus-thorne"]; // Switch to "elite-hq" to test Gym form

  if (profile.type === 'client') return <div>Access Denied</div>;

  return (
    <main className="pt-18 min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6">
        <EditProfileForm profile={profile} />
      </div>
    </main>
  );
}
