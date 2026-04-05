"use client"
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Bell, Search, Menu, User, LogOut, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

const styles = {
  nav: (scrolled: boolean) => `
    fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 md:px-12 py-4
    ${scrolled ? "backdrop-blur-xl shadow-2xl shadow-black/50" : "bg-transparent"}
  `,
  container: "max-w-7xl mx-auto flex items-center justify-between",
  logo: "flex items-center gap-2 group",
  logoIcon: "w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-primary-foreground transform group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20",
  logoTextWrapper: "flex flex-col",
  logoTitle: "font-black text-xl tracking-tighter leading-none",
  logoSubtitle: "text-[10px] text-primary font-bold tracking-[0.2em] uppercase leading-none",
  desktopNav: "hidden md:flex items-center gap-8",
  navLink: (isActive: boolean) => `
    text-sm font-bold transition-all tracking-wide uppercase relative group/nav 
    ${isActive ? "text-primary" : "text-foreground/60 hover:text-primary"}
  `,
  activeIndicator: "absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]",
  hoverIndicator: "absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-center opacity-50",
  rightActions: "flex items-center gap-4",
  langButton: "p-2.5 text-foreground/40 hover:text-primary hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 flex items-center gap-2",
  langText: "text-xs font-black uppercase",
  actionButton: "hidden sm:flex p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  notifButton: "relative p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  notifBadge: "absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse",
  divider: "h-8 w-[1px] bg-white/5 mx-2 hidden sm:block",
  profileLink: (isActive: boolean) => `
    flex items-center gap-3 pl-1 pr-4 py-1 transition-all group rounded-full border 
    ${isActive ? "bg-primary/20 border-primary/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "bg-white/5 border-white/10 hover:bg-white/10 overflow-hidden"}
  `,
  profileIconWrapper: (isActive: boolean) => `
    w-8 h-8 rounded-full flex items-center justify-center transition-all 
    ${isActive ? "bg-primary text-primary-foreground" : "bg-primary/20 border border-primary/30 text-primary"}
  `,
  profileName: (isActive: boolean) => `
    text-sm font-bold group-hover:text-foreground hidden sm:block 
    ${isActive ? "text-primary" : "text-foreground/80"}
  `,
  logoutButton: "p-2.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all border border-transparent hover:border-red-500/10 group",
  logoutIcon: "group-hover:translate-x-0.5 transition-transform",
  mobileMenu: "md:hidden p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all"
};

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  const isAuthPage = pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/request-access') ||
    pathname.includes('/activate');

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={styles.nav(scrolled)}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>G</div>
          <div className={styles.logoTextWrapper}>
            <span className={styles.logoTitle}>GYM ELITE</span>
            <span className={styles.logoSubtitle}>Inner Circle</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {!isAuthPage && (
          <div className={styles.desktopNav}>
            {[
              { label: "Coaches", href: "/coaches" },
              { label: "Gyms", href: "/gyms" },
              { label: "Job Board", href: "/jobs" },
              { label: "Plans", href: "/plans" },
            ].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href as any}
                  className={styles.navLink(isActive)}
                >
                  {link.label}
                  {isActive ? (
                    <div className={styles.activeIndicator} />
                  ) : (
                    <div className={styles.hoverIndicator} />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Actions */}
        <div className={styles.rightActions}>
          <button onClick={toggleLanguage} className={styles.langButton} title="Switch Language">
            <Globe size={18} />
            <span className={styles.langText}>{locale}</span>
          </button>

          {!isAuthPage && (
            <>
              <button className={styles.actionButton}>
                <Search size={20} />
              </button>

              <button className={styles.notifButton}>
                <span className={styles.notifBadge} />
                <Bell size={20} />
              </button>

              <div className={styles.divider} />

              <Link
                href="/coach-profile"
                className={styles.profileLink(pathname === '/coach-profile')}
              >
                <div className={styles.profileIconWrapper(pathname === '/coach-profile')}>
                  <User size={18} />
                </div>
                <span className={styles.profileName(pathname === '/coach-profile')}>Marcus</span>
              </Link>

              <Link href="/login" className={styles.logoutButton} title="Logout">
                <LogOut size={20} className={styles.logoutIcon} />
              </Link>

              <button className={styles.mobileMenu}>
                <Menu size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
