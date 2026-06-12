"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { NotificationsMenu } from "@/features/notification/components/notifications-menu";
import { ChatTrigger } from "@/features/chat/components/chat-trigger";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { styles } from "./navbar/navbar.styles";
import { buildAccountLinks, buildNavEntries } from "./navbar/navbar-data";
import { getFirstName, getProfilePhoto } from "./navbar/utils";
import { BrandLogo } from "./navbar/brand-logo";
import { DesktopNav } from "./navbar/desktop-nav";
import { LanguageToggle } from "./navbar/language-toggle";
import { UserMenu } from "./navbar/user-menu";
import { MobileMenu } from "./navbar/mobile-menu";

export const Navbar = () => {
  const t = useTranslations("Navbar");
  const { logout } = useAuthUser();
  const { profile } = useProfileUser();
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isRtl = locale === "ar";
  const isLoggedIn = Boolean(profile);
  const isAuthPage =
    pathname.includes("/login") ||
    pathname.includes("/register") ||
    pathname.includes("/request-access") ||
    pathname.includes("/activate");

  const firstName = getFirstName(profile);
  const profilePhoto = getProfilePhoto(profile);

  const navEntries = buildNavEntries(t, { isLoggedIn, userType: profile?.userType });
  const accountLinks = buildAccountLinks(t, profile?.userType);

  const handleLogout = async () => {
    try {
      await logout();
      // If the current page is protected, send the user home; otherwise stay put
      // and let the UI rerender into its logged-out state. `pathname` from
      // @/i18n/routing is already locale-stripped.
      const publicPaths = ["/", "/gyms", "/coaches"];
      if (!publicPaths.includes(pathname)) {
        router.push("/");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Shadow/blur the bar once the page scrolls.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile drawer whenever the route changes (covers programmatic
  // pushes too). The desktop dropdowns/user-menu close themselves.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={styles.nav(scrolled)}>
        <div className={styles.container}>
          <BrandLogo onClick={() => setMobileOpen(false)} />

          {!isAuthPage && <DesktopNav entries={navEntries} pathname={pathname} />}

          <div className={styles.rightActions}>
            <LanguageToggle />

            {!isAuthPage && !isLoggedIn && (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[11px] sm:text-xs hover:brightness-110 transition-all"
              >
                {t("signIn")}
              </Link>
            )}

            {!isAuthPage && isLoggedIn && (
              <>
                <ChatTrigger
                  buttonClassName={styles.chatButton}
                  badgeClassName={styles.chatBadge}
                />
                <NotificationsMenu
                  buttonClassName={styles.notifButton}
                  badgeClassName={styles.notifBadge}
                />
                <div className={styles.divider} />
                <UserMenu
                  pathname={pathname}
                  isRtl={isRtl}
                  firstName={firstName}
                  profilePhoto={profilePhoto}
                  accountLinks={accountLinks}
                  onLogout={handleLogout}
                />
              </>
            )}

            {/* Hamburger — visible on mobile for everyone (logged in or not). */}
            {!isAuthPage && (
              <button
                className={styles.mobileMenuBtn(mobileOpen)}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Open menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        entries={navEntries}
        accountLinks={accountLinks}
        isLoggedIn={isLoggedIn}
        firstName={firstName}
        profilePhoto={profilePhoto}
        pathname={pathname}
        onLogout={handleLogout}
      />
    </>
  );
};
