'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, LogOut, MoreHorizontal, User, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { styles } from './navbar.styles';
import { BrandLogo } from './brand-logo';
import type { AccountLink, NavEntry } from './types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  entries: NavEntry[];
  accountLinks: AccountLink[];
  isLoggedIn: boolean;
  firstName: string;
  profilePhoto: string | null;
  pathname: string;
  onLogout: () => void | Promise<void>;
}

export function MobileMenu({
  isOpen,
  onClose,
  entries,
  accountLinks,
  isLoggedIn,
  firstName,
  profilePhoto,
  pathname,
  onLogout,
}: MobileMenuProps) {
  const t = useTranslations('Navbar');
  const [moreOpen, setMoreOpen] = useState(false);

  // Lock body scroll while the drawer is open; collapse "More" once closed so
  // the next open starts tidy.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setMoreOpen(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const closeAll = () => {
    onClose();
    setMoreOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className={styles.mobileOverlay(isOpen)} onClick={onClose} />

      {/* Drawer */}
      <div className={styles.mobileMenu(isOpen)}>
        <div className={styles.mobileMenuHeader}>
          <BrandLogo asLink={false} />
          <button className={styles.mobileCloseBtn} onClick={onClose} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {/* Logged-in "who am I" chip — mirrors the desktop avatar pill. */}
          {isLoggedIn && (
            <Link href="/profile" onClick={onClose} className={styles.mobileProfileChip}>
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

          {/* Primary navigation */}
          <div className={styles.mobileNav}>
            {entries.map((entry) => {
              if (entry.type === 'link') {
                return (
                  <Link
                    key={entry.href}
                    href={entry.href as never}
                    className={styles.mobileNavLink(pathname === entry.href)}
                    onClick={onClose}
                  >
                    <div className={styles.mobileLinkDot} />
                    {entry.label}
                  </Link>
                );
              }

              // Grouped entry: a section label with its links listed beneath it
              // (always expanded on mobile for one-tap reach).
              return (
                <div key={entry.label} className="flex flex-col gap-4">
                  <span className={styles.mobileGroupLabel}>{entry.label}</span>
                  {entry.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href as never}
                      className={styles.mobileNavLink(pathname === item.href)}
                      onClick={onClose}
                    >
                      <div className={styles.mobileLinkDot} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Account section — signed-in only. Secondary links collapse into a
              single "More" tile; Logout stays one tap away. */}
          {isLoggedIn && (
            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-2">
              <div
                className="group/more rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden"
                onMouseEnter={() => setMoreOpen(true)}
                onMouseLeave={() => setMoreOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-expanded={moreOpen}
                  className="flex items-center justify-between w-full px-3 py-3 text-base font-black uppercase text-foreground/70 hover:text-primary transition-all"
                >
                  <span className="flex items-center gap-3">
                    <MoreHorizontal size={18} />
                    {t('more')}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${moreOpen ? 'rotate-180 text-primary' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                    moreOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-1 pb-2 flex flex-col">
                      {accountLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href as never}
                          onClick={closeAll}
                          className={styles.mobileMoreItem}
                        >
                          <Icon size={16} />
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  closeAll();
                  await onLogout();
                }}
                className={styles.mobileLogout}
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
                onClick={onClose}
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
}
