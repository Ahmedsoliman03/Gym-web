'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, LifeBuoy, LogOut, User } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { SUPPORT_WHATSAPP_URL } from '@/components/shared/contact-support';
import { styles } from './navbar.styles';
import type { AccountEntry } from './types';

interface UserMenuProps {
  pathname: string;
  isRtl: boolean;
  firstName: string;
  profilePhoto: string | null;
  accountLinks: AccountEntry[];
  onLogout: () => void | Promise<void>;
}

export function UserMenu({
  pathname,
  isRtl,
  firstName,
  profilePhoto,
  accountLinks,
  onLogout,
}: UserMenuProps) {
  const t = useTranslations('Navbar');
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking anywhere outside it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const closeMenu = () => {
    setOpen(false);
    setOpenGroup(null);
  };

  const isProfileActive = pathname === '/profile';

  return (
    <div className="relative hidden md:block" ref={menuRef}>
      <button
        className={styles.profileLink(isProfileActive, isRtl)}
        onClick={() => (open ? closeMenu() : setOpen(true))}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className={styles.profileIconWrapper(isProfileActive)}>
          {profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profilePhoto} alt={firstName} className={styles.profilePhotoImg} />
          ) : (
            <User size={18} />
          )}
        </div>
        <span className={styles.profileName(isProfileActive)}>{firstName}</span>
      </button>

      {open && (
        <div className={styles.userMenuPanel} role="menu">
          <Link
            href="/profile"
            onClick={closeMenu}
            className={styles.userMenuItem}
            role="menuitem"
          >
            <User size={16} />
            {t('profile')}
          </Link>

          {accountLinks.map((entry) => {
            if (entry.type === 'link') {
              const Icon = entry.icon;
              return (
                <Link
                  key={entry.href}
                  href={entry.href as never}
                  onClick={closeMenu}
                  className={styles.userMenuItem}
                  role="menuitem"
                >
                  <Icon size={16} />
                  {entry.label}
                </Link>
              );
            }

            const GroupIcon = entry.icon;
            const isGroupOpen = openGroup === entry.label;
            return (
              <div
                key={entry.label}
                onMouseEnter={() => setOpenGroup(entry.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button
                  type="button"
                  className={styles.userMenuGroupTrigger}
                  aria-haspopup="menu"
                  aria-expanded={isGroupOpen}
                  onClick={() => setOpenGroup(isGroupOpen ? null : entry.label)}
                >
                  <span className="flex items-center gap-3">
                    <GroupIcon size={16} />
                    {entry.label}
                  </span>
                  <ChevronDown size={14} className={styles.userMenuGroupChevron(isGroupOpen)} />
                </button>
                <div className={styles.userMenuSubPanel(isGroupOpen)}>
                  <div className="overflow-hidden">
                    {entry.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href as never}
                          onClick={closeMenu}
                          className={styles.userMenuSubItem}
                          role="menuitem"
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
            onClick={closeMenu}
            className={styles.userMenuItem}
            role="menuitem"
          >
            <LifeBuoy size={16} />
            {t('contactSupport')}
          </a>

          <div className={styles.userMenuDivider} />
          <button
            onClick={async () => {
              closeMenu();
              await onLogout();
            }}
            className={styles.userMenuDanger}
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
