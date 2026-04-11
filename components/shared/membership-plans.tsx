"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { GymPlan } from "@/features/profile/mock-data";

const styles = {
  section: "space-y-6 pt-4 scroll-mt-24",
  sectionTitle: "text-xl font-bold mb-4 text-primary uppercase",
  plansGrid: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6",
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
};

interface PlansProps {
  plans?: GymPlan[];
}

export const Plans = forwardRef<HTMLDivElement, PlansProps>(({ plans }, ref) => {
  const t = useTranslations("Profile");

  if (!plans || plans.length === 0) return null;

  return (
    <div ref={ref} className={styles.section}>
      <h2 className={styles.sectionTitle}>{t('Plans')}</h2>
      <div className={styles.plansGrid}>
        {plans.map((plan, idx) => (
          <div key={idx} className={styles.planCard}>
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
                <div className={styles.oldPrice}>{plan.price}</div>
              )}
              <div className={styles.currentPrice}>
                {plan.salePrice || plan.price}
              </div>
              <button className={styles.buyBtn}>
                {t('getStarted')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

Plans.displayName = "Plans";
