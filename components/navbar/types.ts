import type { LucideIcon } from 'lucide-react';

export type UserType = 'client' | 'coach' | 'gym' | undefined;

export type NavItem = { label: string; href: string; disabled?: boolean; badge?: string };

export type NavEntry =
  | { type: 'link'; label: string; href: string; disabled?: boolean; badge?: string }
  | { type: 'group'; label: string; items: NavItem[] };

export type AccountLink = { href: string; label: string; icon: LucideIcon };
