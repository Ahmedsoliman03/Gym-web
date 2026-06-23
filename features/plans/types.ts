

export type PlanAudience = 'gym' | 'coach';

/**
 * Known platform feature codes. Typed as a union for autocomplete while still
 * accepting any string the backend may add later (`string & {}` keeps the
 * literal suggestions without collapsing the type to plain `string`).
 */
export type FeatureCode =
  | 'job_post'
  | 'see_applicants'
  | 'edit_profile'
  | 'profile_images'
  | 'transformation_photos'
  | 'certifications'
  | 'apply_job'
  | 'gymspot_ai'
  | (string & {});

export interface PlanFeature {
  id: string;
  feature: {
    id?: string;
    code?: FeatureCode;
    name: string;
    description?: string;
  };
  daily_limit: number;
  monthly_limit: number;
}
export interface PlatformPlan {
  id: string;
  name: string;
  /** Backend slug, e.g. `warm_up_gym` / `power_set_coach`. Optional. */
  code?: string;
  plan_type: 'COACH' | 'GYM';
  trial_days?: number;
  price: string;
  sale_price: string;
  features: PlanFeature[];
}

export type PlatformPlansResponse = PlatformPlan[];

// ── Subscription usage ────────────────────────────────────────────────────────
// GET /api/v1/platform/subscriptions/usage/ — per-feature consumption for the
// user's active subscription. Same shape across all plans; only the set of
// feature codes and limits differ (paid plans add e.g. `gymspot_ai`).
// A limit of -1 means unlimited.

export interface FeatureUsage {
  feature_code: FeatureCode;
  feature_name: string;
  daily_limit: number;
  monthly_limit: number;
  daily_used: number;
  monthly_used: number;
}

export type PlatformUsageResponse = FeatureUsage[];

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
  /** Badge text shown when {@link isCurrent} is true. */
  currentLabel?: string;
  /** CTA text for the cancel-subscription button on the active paid plan. */
  cancelLabel?: string;
  onSelect?: () => void;
}


export interface SubscribeModalProps {
  plan: PlatformPlan | null;
  onClose: () => void;
  currency: string;
}