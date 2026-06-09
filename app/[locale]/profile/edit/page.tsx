"use client";

import { useTranslations } from "next-intl";
import { GLoader } from "@/components/ui/g-loader";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { EditProfileForm } from "@/features/profile/components/edit-profile-form";

const styles = {
  main: "pt-20 sm:pt-24 min-h-screen bg-background text-foreground",
  inner: "max-w-3xl mx-auto px-4 sm:px-6 pb-20",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
  denied: "min-h-screen flex items-center justify-center text-foreground/60 font-bold uppercase tracking-wider",
};

export default function EditProfilePage() {
  const t = useTranslations("Profile");
  const { profile, isLoading, error } = useProfileUser();

  if (isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <GLoader size={72} />
      </div>
    );
  }

  if (error || !profile) {
    return <div className={styles.denied}>{t('accessDenied')}</div>;
  }

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <EditProfileForm profile={profile} />
      </div>
    </main>
  );
}
