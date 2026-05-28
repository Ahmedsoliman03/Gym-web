"use client"
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Menu, User, LogOut, Globe, X, Bookmark, Zap, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChangePasswordModal } from "./change-password-modal";
import { NotificationsMenu } from "@/features/notification/components/notifications-menu";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";

const styles = {
  // ... existing styles ...
  nav: (scrolled: boolean) => `
    fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 md:px-12 py-4
    ${scrolled ? "backdrop-blur-xl shadow-2xl shadow-black/50" : "bg-transparent"}
  `,
  container: "max-w-7xl mx-auto flex items-center justify-between",
  logo: "flex items-center gap-2 group",
  logoIcon: "w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-primary-foreground transform group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20",
  logoTextWrapper: "flex flex-col",
  logoTitle: "font-black text-xl leading-none",
  desktopNav: "hidden md:flex items-center gap-8",
  navLink: (isActive: boolean) => `
    text-sm font-bold transition-all uppercase relative group/nav 
    ${isActive ? "text-primary" : "text-foreground/60 hover:text-primary"}
  `,
  activeIndicator: "absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]",
  hoverIndicator: "absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-center opacity-50",
  rightActions: "flex items-center gap-2",
  langButton: "p-2 text-foreground/40 hover:text-primary hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 flex items-center gap-1",
  langText: "text-xs font-black uppercase",
  actionButton: "hidden sm:flex p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  notifButton: "relative p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  notifBadge: "absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse",
  divider: "h-8 w-[1px] bg-white/5 mx-2 hidden sm:block",
  profileLink: (isActive: boolean, isRtl: boolean) => `
    flex items-center gap-3 ${isRtl ? "sm:pl-4 sm:pr-1" : "sm:pl-1 sm:pr-4"} sm:py-1 transition-all group rounded-full border 
    ${isActive ? "bg-primary/20 border-primary/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]" : "bg-white/5 border-white/10 hover:bg-white/10 overflow-hidden"}
  `,
  profileIconWrapper: (isActive: boolean) => `
    w-8 h-8 rounded-full flex items-center justify-center transition-all 
    ${isActive ? "bg-primary text-primary-foreground" : "bg-primary/20 border border-primary/30 text-primary"}
  `,
  profileName: (isActive: boolean) => `
    text-sm font-bold hidden sm:block 
    ${isActive ? "text-primary" : "text-foreground/80"}
  `,
  logoutButton: "hidden md:flex p-2.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all border border-transparent hover:border-red-500/10 group",
  logoutIcon: "group-hover:translate-x-0.5 transition-transform",
  mobileMenuBtn: (isOpen: boolean) => `
    md:hidden p-2.5 rounded-xl transition-all z-[110] relative
    ${isOpen ? "text-primary bg-primary/10" : "text-foreground/40 hover:text-foreground hover:bg-white/5"}
  `,
  mobileOverlay: (isOpen: boolean) => `
    fixed inset-0 bg-background/80 backdrop-blur-xl z-[100] transition-all duration-500
    ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
  `,
  mobileMenu: (isOpen: boolean) => `
    md:hidden fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl p-8 flex flex-col transition-all duration-500
    ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
  `,
  mobileMenuHeader: "mb-12 flex items-center justify-between",
  mobileCloseBtn: "p-2.5 text-foreground/40 hover:text-primary hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  mobileNav: "flex flex-col gap-6",
  mobileNavLink: (active: boolean) => `
    text-xl font-black transition-all uppercase flex items-center gap-4 group/mobile 
    ${active ? 'text-primary' : 'text-foreground/40 hover:text-foreground'}
  `,
  mobileLinkDot: "w-3 h-3 rounded-full bg-primary transform scale-0 group-hover/mobile:scale-100 transition-transform",
  mobileLogoutLink: "mt-8 pt-8 border-t border-white/5 text-xl font-black transition-all uppercase flex items-center gap-4 group/mobile text-red-500/60 hover:text-red-500",
  mobileFooter: "mt-auto pt-12 border-t border-white/5 opacity-50 text-xs font-bold uppercase"
};

export const Navbar = () => {
  const t = useTranslations('Navbar');
  const { logout } = useAuthUser();
  const { profile } = useProfileUser();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [changePassOpen, setChangePassOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  const firstName = profile?.fullName ? profile.fullName.trim().split(/\s+/)[0] : "User";

  const handleLogout = async () => {
    try {
      await logout();

    } catch (err) {
      console.error('Logout failed:', err);
    }
    router.push('/login');
  };
  const isRtl = locale === 'ar';
  const isAuthPage = pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/request-access') ||
    pathname.includes('/activate');

  const userType = profile?.userType;

  const navLinks = [
    { label: t('coaches'), href: "/coaches" },
    { label: t('gyms'), href: "/gyms" },
    ...(userType === 'coach' || userType === 'gym' ? [{ label: t('jobBoard'), href: "/jobs" }] : []),
    ...(userType === 'gym' ? [{ label: t('applications'), href: "/applications" }] : []),
    { label: t('about'), href: "/about" },
  ];

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    // window.location.href = `/${nextLocale}${pathname}`;
    router.replace(pathname, { locale: nextLocale });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <nav className={styles.nav(scrolled)}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo} onClick={() => setIsOpen(false)}>
            <div className={styles.logoIcon}>G</div>
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoTitle}>GymSpot</span>

            </div>
          </Link>

          {/* Desktop Navigation */}
          {!isAuthPage && (
            <div className={styles.desktopNav}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
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
            <button onClick={toggleLanguage} className={styles.langButton} title={t('switchLanguage')}>
              <Globe size={18} />
              <span className={styles.langText}>{locale === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {!isAuthPage && (
              <>
                <NotificationsMenu
                  buttonClassName={styles.notifButton}
                  badgeClassName={styles.notifBadge}
                />

                <div className={styles.divider} />

                <div className="relative" ref={userMenuRef}>
                  <button
                    className={styles.profileLink(pathname === '/profile', isRtl)}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className={styles.profileIconWrapper(pathname === '/profile')}>
                      <User size={18} />
                    </div>
                    <span className={styles.profileName(pathname === '/profile')}>{firstName}</span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-white/10 rounded-2xl shadow-2xl z-[120] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all"
                      >
                        <User size={16} />
                        {t('profile')}
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); setChangePassOpen(true); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all"
                      >
                        <Lock size={16} />
                        {t('changePassword')}
                      </button>
                      <Link
                        href="/saved-posts"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all"
                      >
                        <Bookmark size={16} />
                        {t('savedPosts')}
                      </Link>
                      <Link
                        href="/your-posts"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all"
                      >
                        <Zap size={16} />
                        {t('yourPosts')}
                      </Link>
                      <div className="h-[1px] bg-white/5 my-1" />
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await handleLogout();
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/5 transition-all cursor-pointer text-left"
                      >
                        <LogOut size={16} />
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className={styles.mobileMenuBtn(isOpen)}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <ChangePasswordModal
        isOpen={changePassOpen}
        onClose={() => setChangePassOpen(false)}
      />

      {/* Mobile Menu Overlay */}
      <div
        className={styles.mobileOverlay(isOpen)}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Content */}
      <div className={styles.mobileMenu(isOpen)}>
        <div className={styles.mobileMenuHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>G</div>
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoTitle}>GymSpot</span>
            </div>
          </div>
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className={styles.mobileNav}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href as any}
                className={styles.mobileNavLink(isActive)}
                onClick={() => setIsOpen(false)}
              >
                <div className={styles.mobileLinkDot} />
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={async () => {
              setIsOpen(false);
              await handleLogout();
            }}
            className={`${styles.mobileLogoutLink} cursor-pointer w-full text-left`}
          >
            <LogOut size={24} />
            {t('logout')}
          </button>
        </div>

        {/* <div className={styles.mobileFooter}>
          Gym Elite Inner Circle © 2026
        </div> */}
      </div>
    </>
  );
};

