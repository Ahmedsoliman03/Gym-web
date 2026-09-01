'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, LifeBuoy, LogOut, MoreHorizontal, User, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { SUPPORT_WHATSAPP_URL } from '@/components/shared/contact-support';
import { styles } from './navbar.styles';
import { BrandLogo } from './brand-logo';
import type { AccountEntry, NavEntry } from './types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  entries: NavEntry[];
  accountLinks: AccountEntry[];
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
  const [openMoreGroup, setOpenMoreGroup] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setMoreOpen(false);
      setOpenMoreGroup(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const closeAll = () => {
    onClose();
    setMoreOpen(false);
    setOpenMoreGroup(null);
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
                if (entry.disabled) {
                  return (
                    <div
                      key={entry.href}
                      className={`${styles.mobileNavLink(false)} opacity-40 cursor-not-allowed pointer-events-none flex items-center gap-2`}
                    >
                      <div className={styles.mobileLinkDot} />
                      {entry.label}
                      {entry.badge && (
                        <span className="bg-primary/20 text-primary border border-primary/30 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          {entry.badge}
                        </span>
                      )}
                    </div>
                  );
                }
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

              return (
                <div key={entry.label} className="flex flex-col gap-4">
                  <span className={styles.mobileGroupLabel}>{entry.label}</span>
                  {entry.items.map((item) => {
                    if (item.disabled) {
                      return (
                        <div
                          key={item.href}
                          className={`${styles.mobileNavLink(false)} opacity-40 cursor-not-allowed pointer-events-none flex items-center gap-2`}
                        >
                          <div className={styles.mobileLinkDot} />
                          {item.label}
                          {item.badge && (
                            <span className="bg-primary/20 text-primary border border-primary/30 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href as never}
                        className={styles.mobileNavLink(pathname === item.href)}
                        onClick={onClose}
                      >
                        <div className={styles.mobileLinkDot} />
                        {item.label}
                      </Link>
                    );
                  })}
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
                      {accountLinks.map((entry) => {
                        if (entry.type === 'link') {
                          const Icon = entry.icon;
                          return (
                            <Link
                              key={entry.href}
                              href={entry.href as never}
                              onClick={closeAll}
                              className={styles.mobileMoreItem}
                            >
                              <Icon size={16} />
                              {entry.label}
                            </Link>
                          );
                        }

                        const GroupIcon = entry.icon;
                        const isGroupOpen = openMoreGroup === entry.label;
                        return (
                          <div key={entry.label}>
                            <button
                              type="button"
                              onClick={() => setOpenMoreGroup(isGroupOpen ? null : entry.label)}
                              aria-expanded={isGroupOpen}
                              className={styles.mobileMoreGroupTrigger}
                            >
                              <span className="flex items-center gap-3">
                                <GroupIcon size={16} />
                                {entry.label}
                              </span>
                              <ChevronDown size={14} className={styles.mobileMoreGroupChevron(isGroupOpen)} />
                            </button>
                            <div className={styles.mobileMoreSubPanel(isGroupOpen)}>
                              <div className="overflow-hidden">
                                {entry.items.map((item) => {
                                  const ItemIcon = item.icon;
                                  return (
                                    <Link
                                      key={item.href}
                                      href={item.href as never}
                                      onClick={closeAll}
                                      className={styles.mobileMoreSubItem}
                                    >
                                      <ItemIcon size={16} />
                                      {item.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <a
                        href={SUPPORT_WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeAll}
                        className={styles.mobileMoreItem}
                      >
                        <LifeBuoy size={16} />
                        {t('contactSupport')}
                      </a>
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

