"use client"
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Bell, Search, Menu, User, LogOut, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  // Check if current page is an auth page
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
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 px-6 md:px-12 py-4
         ${scrolled
          ? " backdrop-blur-xl shadow-2xl shadow-black/50"
          : "bg-transparent"
        }
        `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-primary-foreground transform group-hover:rotate-6 transition-transform shadow-lg shadow-primary/20">
            G
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter leading-none">GYM ELITE</span>
            <span className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase leading-none">Inner Circle</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-8">
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
                  className={`text-sm font-bold transition-all tracking-wide uppercase relative group/nav ${
                    isActive ? "text-primary" : "text-foreground/60 hover:text-primary"
                  }`}
                >
                  {link.label}
                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  )}
                  {/* Hover Indicator Line */}
                  {!isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-center opacity-50" />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Language Switcher (Always visible) */}
          <button
            onClick={toggleLanguage}
            className="p-2.5 text-foreground/40 hover:text-primary hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10 flex items-center gap-2"
            title="Switch Language"
          >
            <Globe size={18} />
            <span className="text-xs font-black uppercase">{locale}</span>
          </button>

          {!isAuthPage && (
            <>
              <button className="hidden sm:flex p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10">
                <Search size={20} />
              </button>

              <button className="relative p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10">
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
                <Bell size={20} />
              </button>

              <div className="h-8 w-[1px] bg-white/5 mx-2 hidden sm:block" />

              <Link
                href="/coach-profile"
                className={`flex items-center gap-3 pl-1 pr-4 py-1 transition-all group rounded-full border ${
                  pathname === '/coach-profile'
                    ? "bg-primary/20 border-primary/40 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    : "bg-white/5 border-white/10 hover:bg-white/10 overflow-hidden"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  pathname === '/coach-profile' ? "bg-primary text-primary-foreground" : "bg-primary/20 border border-primary/30 text-primary"
                }`}>
                  <User size={18} />
                </div>
                <span className={`text-sm font-bold group-hover:text-foreground hidden sm:block ${
                  pathname === '/coach-profile' ? "text-primary" : "text-foreground/80"
                }`}>Marcus</span>
              </Link>

              <Link
                href="/login"
                className="p-2.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all border border-transparent hover:border-red-500/10 group"
                title="Logout"
              >
                <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button className="md:hidden p-2.5 text-foreground/40 hover:text-foreground hover:bg-white/5 rounded-xl transition-all">
                <Menu size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
