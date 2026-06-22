

export type PlanAudience = 'gym' | 'coach';

export interface PlanFeature {
  id: string;
  feature: {
    name: string;
  };
  daily_limit: number;
  monthly_limit: number;
}
export interface PlatformPlan {
  id: string;
  name: string;
  plan_type: 'COACH' | 'GYM';
  price: string;
  sale_price: string;
  features: PlanFeature[];
}

export type PlatformPlansResponse = PlatformPlan[];

// ── Current subscription ──────────────────────────────────────────────────────
// GET /api/v1/platform/subscriptions/current/ — the user's active subscription.
// Only the keys the UI reads are typed; `plan` reuses {@link PlatformPlan}.

export interface CurrentSubscription {
  id: string;
  plan: PlatformPlan;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
}


export interface SubscribeRequest {
  plan_id: string;
  apply_referral_discount?: boolean;
  promo_code?: string;
}

export interface SubscribeArgs {
  planId: string;
  promoCode?: string;
  applyReferralDiscount?: boolean;
}

// ── Validate promo ────────────────────────────────────────────────────────────
// POST /api/v1/platform/subscriptions/validate-promo/ — checks a promo code
// against a plan before subscribing. The backend's exact response keys aren't
// documented, so both the valid flag and the discount value are read leniently.

export interface ValidatePromoArgs {
  planId: string;
  promoCode: string;
}

export interface ValidatePromoResponse {
  valid?: boolean;
  is_valid?: boolean;
  detail?: string;
  message?: string;
  discount_value?: string | number;
  discount?: string | number;
  discount_percent?: string | number;
  discount_amount?: string | number;
}

// ── Component props ───────────────────────────────────────────────────────────

export interface PlanCardProps {
  name: string;
  tagline?: string;
  features: string[];
  priceAfter: number;
  priceBefore?: number;
  currency: string;
  perMonth: string;
  billedLabel: string;
  saveLabel: string;
  ctaLabel: string;
  free?: boolean;
  freeLabel?: string;
  popular?: boolean;
  popularLabel?: string;
  /** Highlight this card as the user's active subscription. */
  isCurrent?: boolean;
  /** Badge / CTA text shown when {@link isCurrent} is true. */
  currentLabel?: string;
  onSelect?: () => void;
}


export interface SubscribeModalProps {
  plan: PlatformPlan | null;
  onClose: () => void;
  currency: string;
}