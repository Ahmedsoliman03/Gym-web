import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import type {
  CurrentSubscription,
  PlatformPlansResponse,
  PlatformUsageResponse,
  SubscribeArgs,
  SubscribeRequest,
  ValidatePromoArgs,
  ValidatePromoResponse,
} from '../types';

export const plansKeys = {
  all: ['platform-plans'] as const,
  subscription: ['platform-subscription'] as const,
  usage: ['platform-usage'] as const,
};

export const getPlatformPlans = async (): Promise<PlatformPlansResponse> => {
  const { data } = await api.get<PlatformPlansResponse>(
    '/api/v1/platform/plans/',
  );
  return data;
};

export const usePlatformPlansQuery = () => {
  return useQuery({
    queryKey: plansKeys.all,
    queryFn: getPlatformPlans,
    staleTime: 5 * 60_000,
  });
};

export const subscribeToPlan = async ({
  planId,
  promoCode,
  applyReferralDiscount,
}: SubscribeArgs) => {
  const trimmedPromo = promoCode?.trim();
  const body: SubscribeRequest = trimmedPromo
    ? { plan_id: planId, promo_code: trimmedPromo }
    : { plan_id: planId, apply_referral_discount: Boolean(applyReferralDiscount) };

  const { data } = await api.post(
    '/api/v1/platform/subscriptions/subscribe/',
    body,
  );
  return data;
};


export const getCurrentSubscription = async (): Promise<CurrentSubscription> => {
  const { data } = await api.get<CurrentSubscription>(
    '/api/v1/platform/subscriptions/current/',
  );
  return data;
};

export const useCurrentSubscriptionQuery = (enabled = true) => {
  return useQuery({
    queryKey: plansKeys.subscription,
    queryFn: getCurrentSubscription,
    enabled,
    retry: false,
    staleTime: 60_000,
  });
};

/**
 * GET /api/v1/platform/subscriptions/usage/ — per-feature consumption for the
 * user's active subscription. Returns an array of {@link FeatureUsage}.
 */
export const getSubscriptionUsage = async (): Promise<PlatformUsageResponse> => {
  const { data } = await api.get<PlatformUsageResponse>(
    '/api/v1/platform/subscriptions/usage/',
  );
  return data;
};

export const useSubscriptionUsageQuery = (enabled = true) => {
  return useQuery({
    queryKey: plansKeys.usage,
    queryFn: getSubscriptionUsage,
    enabled,
    retry: false,
    staleTime: 60_000,
  });
};

/**
 * POST /api/v1/platform/subscriptions/validate-promo/ — validate a promo code
 * against a plan. Returns the backend payload as-is; the caller normalizes the
 * valid flag / discount value (see {@link isPromoValid}).
 */
export const validatePromoCode = async ({
  planId,
  promoCode,
}: ValidatePromoArgs): Promise<ValidatePromoResponse> => {
  const { data } = await api.post<ValidatePromoResponse>(
    '/api/v1/platform/subscriptions/validate-promo/',
    { plan_id: planId, promo_code: promoCode.trim() },
  );
  return data;
};

/** Lenient read of the "is this code valid" flag across possible key names. */
export const isPromoValid = (res: ValidatePromoResponse): boolean =>
  Boolean(res.valid ?? res.is_valid);

/** First discount value the response exposes, as a display string, or null. */
export const promoDiscountValue = (res: ValidatePromoResponse): string | null => {
  const raw =
    res.discount_value ??
    res.discount ??
    res.discount_percent ??
    res.discount_amount;
  return raw === undefined || raw === null ? null : String(raw);
};

export const useValidatePromoMutation = () => {
  return useMutation({ mutationFn: validatePromoCode });
};

export const useSubscribeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subscribeToPlan,
    onSuccess: () => {
      // The active subscription and the user's editCount/limits may change.
      queryClient.invalidateQueries({ queryKey: plansKeys.subscription });
      queryClient.invalidateQueries({ queryKey: plansKeys.usage });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
  });
};
