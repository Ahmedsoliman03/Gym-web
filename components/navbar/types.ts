import type { LucideIcon } from 'lucide-react';

export type UserType = 'client' | 'coach' | 'gym' | undefined;

export type NavItem = { label: string; href: string };

/**
 * A top-level navbar entry: either a single link, or a labelled group that
 * expands into a dropdown (desktop) / section (mobile) of related links.
 */
export type NavEntry =
  | { type: 'link'; label: string; href: string }
  | { type: 'group'; label: string; items: NavItem[] };

/** A link in the signed-in account menu (desktop dropdown + mobile "More"). */
export type AccountLink = { href: string; label: string; icon: LucideIcon };
