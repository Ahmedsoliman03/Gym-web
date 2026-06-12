'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LogOut, User } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { styles } from './navbar.styles';
import type { AccountLink } from './types';

interface UserMenuProps {
  pathname: string;
  isRtl: boolean;
  firstName: string;
  profilePhoto: string | null;
  accountLinks: AccountLink[];
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking anywhere outside it.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isProfileActive = pathname === '/profile';

  return (
    <div className="relative hidden md:block" ref={menuRef}>
      <button
        className={styles.profileLink(isProfileActive, isRtl)}
        onClick={() => setOpen((v) => !v)}
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
            onClick={() => setOpen(false)}
            className={styles.userMenuItem}
            role="menuitem"
          >
            <User size={16} />
            {t('profile')}
          </Link>

          {accountLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href as never}
              onClick={() => setOpen(false)}
              className={styles.userMenuItem}
              role="menuitem"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          <div className={styles.userMenuDivider} />
          <button
            onClick={async () => {
              setOpen(false);
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
