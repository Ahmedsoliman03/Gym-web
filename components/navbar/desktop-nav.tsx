'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { styles } from './navbar.styles';
import type { NavEntry } from './types';

interface DesktopNavProps {
  entries: NavEntry[];
  /** Locale-stripped current path, for active-state highlighting. */
  pathname: string;
}

export function DesktopNav({ entries, pathname }: DesktopNavProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  return (
    <div className={styles.desktopNav}>
      {entries.map((entry) => {
        if (entry.type === 'link') {
          const isActive = pathname === entry.href;
          if (entry.disabled) {
            return (
              <div
                key={entry.href}
                className={`${styles.navLink(false)} opacity-40 cursor-not-allowed pointer-events-none flex items-center gap-1.5`}
              >
                {entry.label}
                {entry.badge && (
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-[0.85] origin-left">
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
              className={styles.navLink(isActive)}
            >
              {entry.label}
              {isActive ? (
                <div className={styles.activeIndicator} />
              ) : (
                <div className={styles.hoverIndicator} />
              )}
            </Link>
          );
        }

        const groupActive = entry.items.some((i) => pathname === i.href);
        const isGroupOpen = openGroup === entry.label;
        return (
          <div
            key={entry.label}
            className={styles.navGroup}
            onMouseEnter={() => setOpenGroup(entry.label)}
            onMouseLeave={() => setOpenGroup(null)}
          >
            <button
              type="button"
              className={styles.navGroupTrigger(groupActive)}
              aria-haspopup="menu"
              aria-expanded={isGroupOpen}
              onClick={() => setOpenGroup(isGroupOpen ? null : entry.label)}
            >
              {entry.label}
              <ChevronDown size={14} className={styles.navGroupChevron(isGroupOpen)} />
              {groupActive ? (
                <div className={styles.activeIndicator} />
              ) : (
                <div className={styles.hoverIndicator} />
              )}
            </button>
            {isGroupOpen && (
              <div className={styles.navDropdownWrap}>
                <div className={styles.navDropdownPanel} role="menu">
                  {entry.items.map((item) => {
                    if (item.disabled) {
                      return (
                        <div
                          key={item.href}
                          className={`${styles.navDropdownItem(false)} opacity-40 cursor-not-allowed pointer-events-none flex items-center justify-between gap-2`}
                        >
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
                        className={styles.navDropdownItem(pathname === item.href)}
                        role="menuitem"
                        onClick={() => setOpenGroup(null)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
