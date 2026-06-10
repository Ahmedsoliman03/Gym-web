"use client";

import { useTranslations } from "next-intl";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";

interface HomeGreetingProps {
  /** Rendered on SSR + while the profile query is loading / unauthenticated. */
  fallback: string;
}

export function HomeGreeting({ fallback }: HomeGreetingProps) {
  const t = useTranslations("Home");
  const { profile } = useProfileUser();
  const firstName = profile?.fullName ? profile.fullName.trim().split(/\s+/)[0] : "";

  return <>{firstName ? t("welcomeBack", { name: firstName }) : fallback}</>;
}
