export type PlanAudience = 'gym' | 'coach';

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
  code?: string;
  plan_type: 'COACH' | 'GYM';
  trial_days?: number;
  price: string;
  sale_price: string;
  features: PlanFeature[];
}

export type PlatformPlansResponse = PlatformPlan[];



export interface FeatureUsage {
  feature_code: FeatureCode;
  feature_name: string;
  daily_limit: number;
  monthly_limit: number;
  daily_used: number;
  monthly_used: number;
}

export type PlatformUsageResponse = FeatureUsage[];

export interface CurrentSubscription {
  id: string;
  plan: PlatformPlan;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
}


export type InvoiceStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Invoice {
  id: string;
  subscription_details: CurrentSubscription;
  plan_price: string;
  prorated_discount: string;
  referral_discount: string;
  amount_paid: string;
  payment_method: string | null;
  status: InvoiceStatus;
  created_at: string;
}

export type InvoicesResponse = Invoice[];


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
  isCurrent?: boolean;
  currentLabel?: string;
  cancelLabel?: string;

  showCta?: boolean;
  onSelect?: () => void;
}


export interface SubscribeModalProps {
  plan: PlatformPlan | null;
  onClose: () => void;
  currency: string;
}
