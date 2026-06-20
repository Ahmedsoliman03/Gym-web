"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RotateCw } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { GLoader } from "@/components/ui/g-loader";
import { GymProfileView } from "@/features/profile/components/gym-profile-view";
import type { GymProfileViewModel } from "@/features/profile/types";
import { useProfileLink } from "@/features/profile/hooks/useProfileLink";
import { useGym } from "../services/gyms.service";
import { GymDetailViewProps } from "../types";

const styles = {
  main: "min-h-screen bg-background text-foreground pb-20",
  container: "max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-20 sm:pt-24",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
};

export function GymDetailView({ id }: GymDetailViewProps) {
  const router = useRouter();
  const t = useTranslations("Gyms");
  const { data: gym, isLoading, error, refetch, isFetching } = useGym(id);
  // Dual-id self-check lives in the hook (matches user-id or inner profile id).
  const { isSelf } = useProfileLink(id, 'gym');

  useEffect(() => {
    if (isSelf) router.replace('/profile');
  }, [isSelf, router]);

  if (isSelf || isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <GLoader size={72} />
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className={styles.loaderWrapper}>
        <div className="flex flex-col items-center gap-4">
          <span className="text-red-500 font-bold uppercase tracking-wider">{t("loadFailed")}</span>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <RotateCw size={14} className={isFetching ? "animate-spin" : ""} />
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  // No mock fallbacks: empty fields render through the section empty-states.
  // `isOwner={false}` below so visitor-facing copy is used instead of the
  // "edit your profile" CTA reserved for the owner's own /profile page.
  const mappedGym: GymProfileViewModel = {
    id: gym.id,
    userId: gym.userId,
    type: "gym",
    name: gym.gymName || "",
    location: gym.location || "",
    memberCount: gym.memberCount != null ? gym.memberCount.toString() : "",
    status: gym.status,
    description: gym.description || "",
    image: gym.mainPhoto || gym.photo || "/images/profile/gym-logo.png",
    images: (gym.images ?? []).map((g) => g.image),
    programs: gym.specializations ?? [],
    plans: gym.plans ?? [],
    socialMedia: gym.socialMedia ?? [],
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <GymProfileView
          data={mappedGym}
          isOwner={false}
          stories={gym.stories}
          profileId={gym.id}
          postsViewAllHref={`/gyms/${gym.id}/posts`}
        />
      </div>
    </main>
  );
}
