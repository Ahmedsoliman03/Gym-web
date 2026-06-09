"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { GLoader } from "@/components/ui/g-loader";
import { Users, Building2, Briefcase, Inbox, User, ArrowRight } from "lucide-react";
import type { UserProfile } from "@/features/profile/types";
import type { ComponentType } from "react";

const subscribeMount = () => () => {};
const getMountedClient = () => true;
const getMountedServer = () => false;

const styles = {
  page: "min-h-screen bg-background text-foreground",
  loaderWrapper: "min-h-screen flex items-center justify-center bg-background text-primary",
  main: "pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto",
  hero: "relative overflow-hidden rounded-3xl border border-white/5 bg-surface p-8 md:p-12 mb-12",
  heroGlow: "absolute -top-32 -right-32 w-96 h-96 bg-primary/10 blur-3xl rounded-full -z-0",
  heroContent: "relative z-10",
  greeting: "text-primary text-xs font-black uppercase tracking-widest mb-4",
  headline: "text-3xl md:text-5xl font-black uppercase leading-tight mb-4",
  subtitle: "text-foreground/60 text-base md:text-lg font-bold max-w-2xl",
  ctaGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  ctaCard: "group bg-surface border border-white/5 rounded-2xl p-6 hover:border-primary/40 hover:-translate-y-1 transition-all shadow-2xl flex flex-col gap-3",
  ctaIconWrapper: "w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary",
  ctaTitle: "text-lg font-black uppercase",
  ctaDesc: "text-foreground/50 text-sm font-bold",
  ctaArrow: "mt-auto pt-2 text-primary text-xs font-black uppercase flex items-center gap-1 group-hover:gap-2 transition-all",
};

interface CtaItem {
  href: string;
  icon: ComponentType<{ size?: number }>;
  titleKey: string;
  descKey: string;
}

function ctasForUserType(userType: UserProfile["userType"] | undefined): CtaItem[] {
  switch (userType) {
    case "coach":
      return [
        { href: "/jobs", icon: Briefcase, titleKey: "viewJobs", descKey: "viewJobsDesc" },
        { href: "/gyms", icon: Building2, titleKey: "exploreGyms", descKey: "exploreGymsDesc" },
        { href: "/profile", icon: User, titleKey: "manageProfile", descKey: "manageProfileDesc" },
      ];
    case "gym":
      return [
        { href: "/applications", icon: Inbox, titleKey: "viewApplications", descKey: "viewApplicationsDesc" },
        { href: "/jobs", icon: Briefcase, titleKey: "viewJobs", descKey: "viewJobsDesc" },
        { href: "/coaches", icon: Users, titleKey: "exploreCoaches", descKey: "exploreCoachesDesc" },
        { href: "/profile", icon: User, titleKey: "manageProfile", descKey: "manageProfileDesc" },
      ];
    case "client":
    default:
      return [
        { href: "/coaches", icon: Users, titleKey: "exploreCoaches", descKey: "exploreCoachesDesc" },
        { href: "/gyms", icon: Building2, titleKey: "exploreGyms", descKey: "exploreGymsDesc" },
        { href: "/profile", icon: User, titleKey: "manageProfile", descKey: "manageProfileDesc" },
      ];
  }
}

function headlineKeyFor(userType: UserProfile["userType"] | undefined) {
  switch (userType) {
    case "coach":
      return { headline: "coachHeadline", subtitle: "coachSubtitle" } as const;
    case "gym":
      return { headline: "gymHeadline", subtitle: "gymSubtitle" } as const;
    case "client":
    default:
      return { headline: "clientHeadline", subtitle: "clientSubtitle" } as const;
  }
}

export default function HomePage() {
  const t = useTranslations("Home");
  const { profile, isLoading } = useProfileUser();
  // The profile query is gated on a client-only cookie check, so SSR sees
  // `isLoading=false` while the client (when logged in) sees `isLoading=true`
  // on first render — a classic hydration mismatch. Use a sync external
  // store-backed mount flag (false on SSR, true after hydration) so both
  // renders show the loader and swap to the page once mounted.
  const mounted = useSyncExternalStore(subscribeMount, getMountedClient, getMountedServer);

  if (!mounted || isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <GLoader size={72} />
      </div>
    );
  }

  const firstName = profile?.fullName ? profile.fullName.trim().split(/\s+/)[0] : "";
  const { headline, subtitle } = headlineKeyFor(profile?.userType);
  const ctas = ctasForUserType(profile?.userType);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroContent}>
            <p className={styles.greeting}>
              {firstName ? t("welcomeBack", { name: firstName }) : t("welcome")}
            </p>
            <h1 className={styles.headline}>{t(headline)}</h1>
            <p className={styles.subtitle}>{t(subtitle)}</p>
          </div>
        </section>

        <div className={styles.ctaGrid}>
          {ctas.map((cta) => {
            const Icon = cta.icon;
            return (
              <Link key={cta.href} href={cta.href as any} className={styles.ctaCard}>
                <div className={styles.ctaIconWrapper}>
                  <Icon size={22} />
                </div>
                <h2 className={styles.ctaTitle}>{t(cta.titleKey)}</h2>
                <p className={styles.ctaDesc}>{t(cta.descKey)}</p>
                <span className={styles.ctaArrow}>
                  <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
