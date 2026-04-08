import { EditProfileForm } from "@/features/profile/components/edit-profile-form";

export default function EditProfilePage() {
  return (
    <main className="pt-24 pb-12 min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6">
        <EditProfileForm />
      </div>
    </main>
  );
}
