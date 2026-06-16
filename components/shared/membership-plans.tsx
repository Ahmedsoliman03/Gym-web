"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import type { ProfilePlan } from "@/features/profile/types";
import { formatPriceWithCurrency } from "@/utils/format";
import { EmptySection } from "./empty-section";

const styles = {
  section: "space-y-6 pt-4 scroll-mt-24",
  sectionTitle: "text-xl font-bold mb-4 text-primary uppercase",
  plansGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-auto-fit gap-6",
  planCard: "bg-surface p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden group hover:border-primary/30 transition-all",
  planHeader: "mb-6",
  planName: "text-2xl font-bold mb-1",
  planDuration: "text-primary text-sm font-bold uppercase tracking-wider",
  planFeatures: "space-y-3 mb-8 w-full",
  featureItem: "flex items-center justify-center gap-2 text-foreground/60 text-sm",
  planPricing: "mt-auto space-y-1 w-full pt-6 border-t border-white/5",
  oldPrice: "text-foreground/30 line-through text-sm",
  currentPrice: "text-2xl font-black text-foreground",
  buyBtn: "w-full mt-4 bg-white/5 hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all py-3 rounded-xl font-bold text-sm",
  interestCount: "mt-4 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-primary",
};

interface PlansProps {
  plans?: ProfilePlan[];
  isOwner?: boolean;
  onGetStarted?: (plan: ProfilePlan) => void;
  pendingPlanId?: string | null;
}

/** Append " EGP" to a price string when the API didn't already include the
 *  currency. The check is case-insensitive so "egp", "EGP", "Egp" all skip
 *  re-adding the suffix. Empty strings are returned unchanged so callers can
 *  decide how to handle "no price set". */
/** Treat a plan as "renderable" only when it has at least one of the
 *  user-facing fields filled. Empty rows are silently dropped from the view
 *  so a junk row returned by the API (all-empty placeholder) doesn't render
 *  an empty card. */
const isPlanRenderable = (p: ProfilePlan): boolean =>
  !!p.name?.trim() ||
  !!p.duration?.trim() ||
  !!p.price?.trim() ||
  !!p.salePrice?.trim() ||
  (Array.isArray(p.features) && p.features.some((f) => !!f?.trim()));

export const Plans = forwardRef<HTMLDivElement, PlansProps>(({
  plans,
  isOwner,
  onGetStarted,
  pendingPlanId,
}, ref) => {
  const t = useTranslations("Profile");

  const visible = (plans ?? []).filter(isPlanRenderable);

  return (
    <div ref={ref} className={styles.section}>
      <h2 className={styles.sectionTitle}>{t('Plans')}</h2>

      {visible.length === 0 ? (
        <EmptySection
          isOwner={isOwner}
          visitorMessage={t('noPlansYet')}
          ownerMessage={t('addPlansPrompt')}
        />
      ) : (
        <div className={styles.plansGrid}>
          {visible.map((plan, idx) => {
            const pending = pendingPlanId === plan.id;

            return (
              <div key={plan.id ?? idx} className={styles.planCard}>
                <div className={styles.planHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <span className={styles.planDuration}>{plan.duration}</span>
                </div>

                <div className={styles.planFeatures}>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className={styles.featureItem}>
                      <Check size={14} className="text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.planPricing}>
                  {plan.salePrice && (
                    <div className={styles.oldPrice}>
                      {formatPriceWithCurrency(plan.price)}
                    </div>
                  )}
                  <div className={styles.currentPrice}>
                    {formatPriceWithCurrency(plan.salePrice || plan.price)}
                  </div>
                  {isOwner ? (
                null
                  ) : (
                    <button
                      className={styles.buyBtn}
                      disabled={!plan.id || !onGetStarted || pending}
                      onClick={() => onGetStarted?.(plan)}
                    >
                      {pending ? (
                        <Loader2 size={16} className="mx-auto animate-spin" />
                      ) : (
                        t('getStarted')
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

Plans.displayName = "Plans";
