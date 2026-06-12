'use client';

import { Link } from '@/i18n/routing';
import { styles } from './navbar.styles';

interface BrandLogoProps {
  /** Render as a static element (no link) — used in the mobile menu header. */
  asLink?: boolean;
  onClick?: () => void;
}

export function BrandLogo({ asLink = true, onClick }: BrandLogoProps) {
  const inner = (
    <>
      <div className={styles.logoIcon}>G</div>
      <div className={styles.logoTextWrapper}>
        <span className={styles.logoTitle}>GymSpot</span>
      </div>
    </>
  );

  if (!asLink) return <div className={styles.logo}>{inner}</div>;

  return (
    <Link href="/" className={styles.logo} onClick={onClick}>
      {inner}
    </Link>
  );
}
