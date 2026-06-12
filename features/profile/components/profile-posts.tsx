"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  useCoachPosts,
  useGymPosts,
} from "@/features/community/services/community.service";
import { CommunityPostCard } from "@/features/community/components/community-post-card";
import type { ProfilePostsProps } from "../types";

const styles = {
  card: "bg-surface p-6 md:p-8 rounded-3xl border border-white/5 space-y-6",
  header: "flex items-center justify-between gap-3",
  title: "text-xl font-bold text-primary uppercase",
  link: "text-primary text-xs font-black uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all",
  list: "flex flex-col gap-4 sm:gap-6",
  footer: "flex justify-center pt-2",
  footerBtn:
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-primary hover:text-primary-foreground border border-white/10 text-foreground/70 font-black uppercase text-xs tracking-wider transition-all",
};

/**
 * Inline "Posts of {owner}" strip for the profile page. Shows up to 3 cards
 * from the profile owner's authored posts (coach or gym), with a "See all
 * posts" affordance that routes to the full list. Renders nothing while
 * loading/erroring AND when the owner has no posts — the profile page should
 * not advertise an empty posts section.
 */
export const ProfilePosts = ({
  profileType,
  profileId,
  ownerName,
  viewAllHref = "/my-posts",
}: ProfilePostsProps) => {
  const t = useTranslations("Profile");
  const coachQuery = useCoachPosts(profileType === "coach" ? profileId : null);
  const gymQuery = useGymPosts(profileType === "gym" ? profileId : null);
  const query = profileType === "coach" ? coachQuery : gymQuery;

  const posts = query.data ?? [];
  const visible = posts.slice(0, 3);
  const hasMore = posts.length > 3;

  // Hide the section entirely while loading, on error, OR when there are no
  // posts to show. We don't want an empty "no posts" placeholder taking up
  // space on the profile.
  if (query.isLoading || query.isError || posts.length === 0) return null;

  const headerText = ownerName
    ? t("postsOf", { name: ownerName })
    : t("recentPosts");

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{headerText}</h2>
        {hasMore && (
          <Link href={viewAllHref} className={styles.link}>
            {t("viewAllPosts")}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        )}
      </div>

      <div className={styles.list}>
        {visible.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            href={`/community/${post.id}`}
          />
        ))}
      </div>

      {hasMore && (
        <div className={styles.footer}>
          <Link href={viewAllHref} className={styles.footerBtn}>
            {t("viewAllPosts")}
            <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>
      )}
    </div>
  );
};
