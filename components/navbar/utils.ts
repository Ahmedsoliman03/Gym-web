import type { UserProfile } from '@/features/profile/types';

/** First word of the user's name, with a sensible fallback. */
export const getFirstName = (profile: UserProfile | null | undefined) =>
  profile?.fullName ? profile.fullName.trim().split(/\s+/)[0] : 'User';

/** Resolve the avatar photo across the coach/gym/client profile shapes. */
export const getProfilePhoto = (
  profile: UserProfile | null | undefined,
): string | null => {
  const inner = profile?.profile;
  if (!inner) return null;
  if (inner.type === 'coach') return inner.photo ?? inner.profileImage ?? null;
  if (inner.type === 'gym') return inner.photo ?? inner.mainPhoto ?? null;
  return inner.photo ?? null;
};
