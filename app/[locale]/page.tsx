import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Users, Building2, Briefcase, Inbox, User, ArrowRight } from "lucide-react";
import { HomeGreeting } from "./_components/home-greeting";
import type { UserProfile } from "@/features/profile/types";
import type { ComponentType } from "react";

const styles = {
  page: "min-h-screen bg-background text-foreground",
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

type UserType = UserProfile["userType"];

interface CtaItem {
  href: string;
  icon: ComponentType<{ size?: number }>;
  titleKey: string;
  descKey: string;
}

function ctasForUserType(userType: UserType | undefined): CtaItem[] {
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

function headlineKeyFor(userType: UserType | undefined) {
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

// JWT payload is the only trustworthy source for userType (the `user_type`
// cookie is non-HttpOnly and exists for UI convenience only — see middleware.ts
// comment around the same decode). We only need this for picking which CTA
// set to render; access control still lives in middleware.
function userTypeFromJwt(token: string | undefined): UserType | undefined {
  if (!token) return undefined;
  const parts = token.split(".");
  if (parts.length !== 3) return undefined;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(json) as Record<string, unknown>;
    const value = payload.userType ?? payload.user_type ?? payload.role;
    if (value === "coach" || value === "gym" || value === "client") return value;
    return undefined;
  } catch {
    return undefined;
  }
}

export default async function HomePage() {
  const t = await getTranslations("Home");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value || cookieStore.get("token")?.value;
  const userType = userTypeFromJwt(token);

  const { headline, subtitle } = headlineKeyFor(userType);
  const ctas = ctasForUserType(userType);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroContent}>
            <p className={styles.greeting}>
              <HomeGreeting fallback={t("welcome")} />
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
