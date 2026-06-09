"use client"
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Menu, User, LogOut, Globe, X, Bookmark, Lock, Briefcase, FileText, ChevronDown, MoreHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChangePasswordModal } from "./change-password-modal";
import { NotificationsMenu } from "@/features/notification/components/notifications-menu";
import { useAuthUser } from "@/features/auth/hooks/useAuthUser";
import { useProfileUser } from "@/features/profile/hooks/useProfileUser";

const styles = {
  // ... existing styles ...
  nav: (scrolled: boolean) => `
    fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-4 sm:px-6 md:px-12 py-3 sm:py-4
    ${scrolled ? "backdrop-blur-xl shadow-2xl shadow-black/50 bg-background/80" : "bg-transparent"}
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
    w-8 h-8 rounded-full flex items-center justify-center transition-all overflow-hidden
    ${isActive ? "bg-primary text-primary-foreground" : "bg-primary/20 border border-primary/30 text-primary"}
  `,
  profilePhotoImg: "w-full h-full object-cover",
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
    md:hidden fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl px-6 pt-6 pb-8 flex flex-col transition-all duration-500
    ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
  `,
  mobileMenuHeader: "mb-8 flex items-center justify-between",
  mobileCloseBtn: "p-2.5 text-foreground/40 hover:text-primary hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10",
  mobileNav: "flex flex-col gap-5",
  mobileNavLink: (active: boolean) => `
    text-lg font-black transition-all uppercase flex items-center gap-4 group/mobile
    ${active ? 'text-primary' : 'text-foreground/50 hover:text-foreground'}
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
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  const firstName = profile?.fullName ? profile.fullName.trim().split(/\s+/)[0] : "User";

  const profilePhoto = (() => {
    const inner = profile?.profile;
    if (!inner) return null;
    if (inner.type === 'coach') return inner.photo ?? inner.profileImage ?? null;
    if (inner.type === 'gym') return inner.photo ?? inner.mainPhoto ?? null;
    return inner.photo ?? null;
  })();

  const handleLogout = async () => {
    try {
      await logout();
      // If the current page is protected, send the user home; otherwise stay put
      // and let the UI rerender into its logged-out state. `pathname` from
      // @/i18n/routing is already locale-stripped.
      const publicPaths = ['/', '/gyms', '/coaches'];
      if (!publicPaths.includes(pathname)) {
        router.push('/');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  const isRtl = locale === 'ar';
  const isAuthPage = pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/request-access') ||
    pathname.includes('/activate');

  const isLoggedIn = Boolean(profile);

  // Nav links are mostly visible to everyone; role gating happens in
  // middleware. The two exceptions are mirrored from the middleware's
  // restriction table so the user never sees a link they can't open:
  //   - /applications: gym-only (coach + client are blocked)
  //   - /jobs: allowlist — gyms and coaches only (everyone else hidden)
  const userType = profile?.userType;
  const canSeeApplications = userType === 'gym';
  const canSeeJobs = userType === 'gym' || userType === 'coach';

  const navLinks = [
    { label: t('community'), href: "/community" },
    { label: t('coaches'), href: "/coaches" },
    { label: t('gyms'), href: "/gyms" },
    ...(canSeeJobs ? [{ label: t('jobBoard'), href: "/jobs" }] : []),
    ...(canSeeApplications
      ? [{ label: t('applications'), href: "/applications" }]
      : []),
    { label: t('about'), href: "/about" },
  ];

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    // Preserve the current query string and hash so switching the language only
    // swaps the locale — it must not reset URL-driven page state or content.
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    router.replace(`${pathname}${search}${hash}`, { locale: nextLocale });
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
      // Collapse the "More" group whenever the drawer closes so the next open
      // starts in the tidy default state.
      setMobileMoreOpen(false);
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

            {!isAuthPage && !isLoggedIn && (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black uppercase text-[11px] sm:text-xs hover:brightness-110 transition-all"
              >
                {t('signIn')}
              </Link>
            )}

            {!isAuthPage && isLoggedIn && (
              <>
                <NotificationsMenu
                  buttonClassName={styles.notifButton}
                  badgeClassName={styles.notifBadge}
                />

                <div className={styles.divider} />

                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    className={styles.profileLink(pathname === '/profile', isRtl)}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className={styles.profileIconWrapper(pathname === '/profile')}>
                      {profilePhoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profilePhoto}
                          alt={firstName}
                          className={styles.profilePhotoImg}
                        />
                      ) : (
                        <User size={18} />
                      )}
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
                        href="/my-posts"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all"
                      >
                        <FileText size={16} />
                        {t('myPosts')}
                      </Link>
                      <Link
                        href="/saved-posts"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all"
                      >
                        <Bookmark size={16} />
                        {t('savedPosts')}
                      </Link>


                      {/* My Jobs is gym-only: only gyms can author job posts. */}
                      {profile?.userType === 'gym' && (
                        <Link
                          href="/my-jobs"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all"
                        >
                          <Briefcase size={16} />
                          {t('myJobs')}
                        </Link>
                      )}
                      <Link
                        href="/saved-jobs"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 transition-all"
                      >
                       <Bookmark size={16} />
                        {t('savedJobs')}
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
              </>
            )}

            {/* Hamburger — visible on mobile for everyone (logged in or not) */}
            {!isAuthPage && (
              <button
                className={styles.mobileMenuBtn(isOpen)}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
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

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {/* Logged-in profile chip — gives mobile users the same "who am I"
              affordance that desktop gets from the avatar pill. */}
          {isLoggedIn && (
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 mb-8 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                {profilePhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePhoto} alt={firstName} className="w-full h-full object-cover" />
                ) : (
                  <User size={22} />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-black uppercase text-sm truncate">{firstName}</div>
                <div className="text-xs text-foreground/40 truncate">{t('profile')}</div>
              </div>
            </Link>
          )}

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
          </div>

          {/* Account section — only for signed-in users. The 4 secondary
              account links collapse into a single "More" tile that the user
              taps (or hovers) to expand. Logout stays separate so it's still
              one tap away. */}
          {isLoggedIn && (
            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-2">
              <div
                className="group/more rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden"
                onMouseEnter={() => setMobileMoreOpen(true)}
                onMouseLeave={() => setMobileMoreOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setMobileMoreOpen((v) => !v)}
                  aria-expanded={mobileMoreOpen}
                  className="flex items-center justify-between w-full px-3 py-3 text-base font-black uppercase text-foreground/70 hover:text-primary transition-all"
                >
                  <span className="flex items-center gap-3">
                    <MoreHorizontal size={18} />
                    {t('more')}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${mobileMoreOpen ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    mobileMoreOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-1 pb-2 flex flex-col">
                      <button
                        onClick={() => { setIsOpen(false); setMobileMoreOpen(false); setChangePassOpen(true); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all text-left"
                      >
                        <Lock size={16} />
                        {t('changePassword')}
                      </button>
                      <Link
                        href="/my-posts"
                        onClick={() => { setIsOpen(false); setMobileMoreOpen(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                      >
                        <FileText size={16} />
                        {t('myPosts')}
                      </Link>
                      <Link
                        href="/saved-posts"
                        onClick={() => { setIsOpen(false); setMobileMoreOpen(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                      >
                        <Bookmark size={16} />
                        {t('savedPosts')}
                      </Link>
                      {profile?.userType === 'gym' && (
                        <Link
                          href="/my-jobs"
                          onClick={() => { setIsOpen(false); setMobileMoreOpen(false); }}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Briefcase size={16} />
                          {t('myJobs')}
                        </Link>
                      )}
                      <Link
                        href="/saved-jobs"
                        onClick={() => { setIsOpen(false); setMobileMoreOpen(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                      >
                        <Bookmark size={16} />
                        {t('savedJobs')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  setIsOpen(false);
                  setMobileMoreOpen(false);
                  await handleLogout();
                }}
                className="flex items-center gap-3 w-full px-3 py-3 text-base font-black uppercase text-red-500/80 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all text-left cursor-pointer"
              >
                <LogOut size={18} />
                {t('logout')}
              </button>
            </div>
          )}

          {/* Logged-out CTA */}
          {!isLoggedIn && (
            <div className="mt-8 pt-8 border-t border-white/5">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase text-sm hover:brightness-110 transition-all"
              >
                {t('signIn')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

