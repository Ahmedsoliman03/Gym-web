// Static plan tiers shown on the public /plans page. Prices (EGP) live here —
// numbers aren't translated; the tier name, tagline, and feature list come from
// the `Plans` message namespace by audience + tier id. The same three tiers
// (free / pro / premium) are offered to both gyms and coaches, with
// audience-specific pricing and features.
//
// Paid tiers carry a launch discount: `priceBefore` is the regular price shown
// struck-through, `priceAfter` is the current launch price the user pays.

export type PlanAudience = 'gym' | 'coach';
export type PlanTierId = 'free' | 'pro' | 'premium';

export interface PlanTier {
  id: PlanTierId;
  /** Regular (struck-through) monthly price in EGP. Omitted for the free tier. */
  priceBefore?: number;
  /** Monthly price in EGP the user actually pays (0 for the free tier). */
  priceAfter: number;
  /** Free tier — rendered without a price/sale badge. */
  free?: boolean;
  /** Highlight this tier as the recommended one. */
  popular?: boolean;
}

export const GYM_PLANS: PlanTier[] = [
  { id: 'free', priceAfter: 0, free: true },
  { id: 'pro', priceBefore: 700, priceAfter: 500, popular: true },
  { id: 'premium', priceBefore: 1400, priceAfter: 1000 },
];

export const COACH_PLANS: PlanTier[] = [
  { id: 'free', priceAfter: 0, free: true },
  { id: 'pro', priceBefore: 400, priceAfter: 300, popular: true },
  { id: 'premium', priceBefore: 800, priceAfter: 600 },
];

/** Discount percentage, rounded, for the "Save X%" badge (paid tiers only). */
export const savePercent = (tier: PlanTier) =>
  tier.priceBefore
    ? Math.round(((tier.priceBefore - tier.priceAfter) / tier.priceBefore) * 100)
    : 0;
