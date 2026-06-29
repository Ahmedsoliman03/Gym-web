"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, X, Check, Trash2 } from "lucide-react";
import type { ProfilePlan } from "@/features/profile/types";

const styles = {
  section: "space-y-8 pt-8 border-t border-white/5",
  sectionTitle: "text-sm font-black text-primary uppercase mb-6",

  grid: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  planCard: "bg-white/5 rounded-3xl border border-white/5 p-6 space-y-6 relative group",
  deleteBtn: (isRtl: boolean) =>
    "absolute top-4 " + (isRtl ? "left-4" : "right-4") +
    " p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all",

  fieldGroup: "grid grid-cols-2 gap-4",
  inputWrapper: "flex flex-col gap-2",
  label: "text-[10px] font-black text-foreground/40 uppercase ml-1",
  input:
    "w-full min-w-0 bg-surface py-3 border border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm",
  inputError:
    "w-full min-w-0 bg-surface py-3 border border-red-500/40 rounded-xl px-4 text-foreground focus:outline-none focus:border-red-500 transition-colors text-sm",
  errorText: "text-[10px] font-black text-red-400 ml-1 uppercase",
  currencySuffix:
    "pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 text-[10px] font-black text-foreground/40 uppercase tracking-wider",
  // Bump the clear button left so it doesn't overlap the EGP suffix.
  priceClearBtn:
    "absolute right-10 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-red-500 opacity-0 group-hover/field:opacity-100 transition-all",

  featuresSection: "space-y-4",
  featureHeader: "flex items-center justify-between",
  featureList: "grid grid-cols-1 sm:grid-cols-2 gap-2",
  featureItem:
    "flex items-center gap-2 bg-surface/50 p-2 rounded-lg border border-white/5 relative overflow-hidden",
  featureText: "text-xs font-bold text-foreground/60 flex-1 min-w-0",
  removeFeature: "text-foreground/20 hover:text-red-500 transition-colors",

  addFeatureBtn:
    "flex items-center gap-2 text-[10px] font-black text-primary uppercase hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all",
  addPlanBtn:
    "w-full py-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 text-foreground/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group active:scale-95",
};

// ── Validation helpers ─────────────────────────────────────────────────────────

export type PlanFieldErrors = {
  name?: boolean;
  duration?: boolean;
  price?: boolean;
};
export type PlanErrors = Record<number, PlanFieldErrors>;

export const isPlanRowEmpty = (p: ProfilePlan): boolean => {
  const featuresEmpty = !p.features || p.features.every((f) => !f?.trim());
  return (
    !p.name?.trim() &&
    !p.duration?.trim() &&
    !p.price?.trim() &&
    !p.salePrice?.trim() &&
    featuresEmpty
  );
};

export const validatePlans = (
  plans: ProfilePlan[],
): { sanitized: ProfilePlan[]; errors: PlanErrors; hasErrors: boolean } => {
  const errors: PlanErrors = {};
  const sanitized: ProfilePlan[] = [];

  plans.forEach((p, idx) => {
    if (isPlanRowEmpty(p)) return;

    const fieldErrors: PlanFieldErrors = {};
    if (!p.name?.trim()) fieldErrors.name = true;
    if (!p.duration?.trim()) fieldErrors.duration = true;
    if (!p.price?.trim()) fieldErrors.price = true;
    if (Object.keys(fieldErrors).length > 0) {
      errors[idx] = fieldErrors;
    }

    sanitized.push({
      ...p,
      features: (p.features ?? [])
        .map((f) => f?.trim() ?? "")
        .filter(Boolean),
    });
  });

  return {
    sanitized,
    errors,
    hasErrors: Object.keys(errors).length > 0,
  };
};

// ── Component ──────────────────────────────────────────────────────────────────

interface PlansEditorProps {
  plans: ProfilePlan[];
  onChange: (plans: ProfilePlan[]) => void;
  errors?: PlanErrors;
}

export const PlansEditor = ({ plans, onChange, errors }: PlansEditorProps) => {
  const t = useTranslations("Profile");

  const [shakingRows, setShakingRows] = useState<Set<number>>(new Set());
  useEffect(() => {
    if (!errors) return;
    const errorRows = Object.keys(errors).map((k) => Number(k));
    if (errorRows.length === 0) return;
    setShakingRows(new Set(errorRows));
    const timer = setTimeout(() => setShakingRows(new Set()), 500);
    return () => clearTimeout(timer);
  }, [errors]);

  const handleAddPlan = () => {
    onChange([
      ...plans,
      { name: "", duration: "", price: "", features: [] },
    ]);
  };

  const handleRemovePlan = (index: number) => {
    onChange(plans.filter((_, i) => i !== index));
  };

  const handleUpdatePlan = (
    index: number,
    field: keyof ProfilePlan,
    value: string,
  ) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    onChange(newPlans);
  };

  const handleAddFeature = (planIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex] = {
      ...newPlans[planIndex],
      features: [...newPlans[planIndex].features, ""],
    };
    onChange(newPlans);
  };

  const handleUpdateFeature = (
    planIndex: number,
    featureIndex: number,
    value: string,
  ) => {
    const newPlans = [...plans];
    const features = [...newPlans[planIndex].features];
    features[featureIndex] = value;
    newPlans[planIndex] = { ...newPlans[planIndex], features };
    onChange(newPlans);
  };

  const handleRemoveFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex] = {
      ...newPlans[planIndex],
      features: newPlans[planIndex].features.filter(
        (_, i) => i !== featureIndex,
      ),
    };
    onChange(newPlans);
  };

  const locale = useLocale();
  const isRtl = locale === "ar";

  const fieldClass = (hasError?: boolean) =>
    hasError ? styles.inputError : styles.input;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("Plans")}</h2>

      <div className={styles.grid}>
        {plans.map((plan, pIdx) => {
          const rowErrors = errors?.[pIdx];
          const isShaking = shakingRows.has(pIdx);
          return (
            <div
              key={pIdx}
              className={`${styles.planCard} ${isShaking ? 'animate-card-shake' : ''}`}
            >
              <button
                onClick={() => handleRemovePlan(pIdx)}
                className={styles.deleteBtn(isRtl)}
                title={t("removePlan")}
              >
                <Trash2 size={18} />
              </button>

              <div className={styles.fieldGroup}>
                <div className={styles.inputWrapper}>
                  <label className={styles.label}>{t("planName")}</label>
                  <div className="relative group/field w-full">
                    <input
                      type="text"
                      placeholder="e.g. Early Bird"
                      value={plan.name}
                      onChange={(e) =>
                        handleUpdatePlan(pIdx, "name", e.target.value)
                      }
                      className={fieldClass(rowErrors?.name)}
                    />
                    {plan.name && (
                      <button
                        onClick={() => handleUpdatePlan(pIdx, "name", "")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-red-500 opacity-0 group-hover/field:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {rowErrors?.name && (
                    <span className={styles.errorText}>{t("required")}</span>
                  )}
                </div>
                <div className={styles.inputWrapper}>
                  <label className={styles.label}>{t("duration")}</label>
                  <div className="relative group/field w-full">
                    <input
                      type="text"
                      placeholder="e.g. 1 Year"
                      value={plan.duration}
                      onChange={(e) =>
                        handleUpdatePlan(pIdx, "duration", e.target.value)
                      }
                      className={fieldClass(rowErrors?.duration)}
                    />
                    {plan.duration && (
                      <button
                        onClick={() => handleUpdatePlan(pIdx, "duration", "")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-red-500 opacity-0 group-hover/field:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {rowErrors?.duration && (
                    <span className={styles.errorText}>{t("required")}</span>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.inputWrapper}>
                  <label className={styles.label}>{t("originalPrice")}</label>
                  <div className="relative group/field w-full">
                    <input
                      type="text"
                      placeholder="12,000"
                      value={plan.price}
                      onChange={(e) =>
                        handleUpdatePlan(pIdx, "price", e.target.value)
                      }
                      className={`${fieldClass(rowErrors?.price)} pr-14`}
                    />
                    {plan.price && (
                      <button
                        onClick={() => handleUpdatePlan(pIdx, "price", "")}
                        className={styles.priceClearBtn}
                      >
                        <X size={14} />
                      </button>
                    )}
                    <span className={styles.currencySuffix}>
                      {t("priceCurrency")}
                    </span>
                  </div>
                  {rowErrors?.price && (
                    <span className={styles.errorText}>{t("required")}</span>
                  )}
                </div>
                <div className={styles.inputWrapper}>
                  <label className={styles.label}>{t("salePrice")}</label>
                  <div className="relative group/field w-full">
                    <input
                      type="text"
                      placeholder="9,000"
                      value={plan.salePrice || ""}
                      onChange={(e) =>
                        handleUpdatePlan(pIdx, "salePrice", e.target.value)
                      }
                      className={`${styles.input} pr-14`}
                    />
                    {plan.salePrice && (
                      <button
                        onClick={() => handleUpdatePlan(pIdx, "salePrice", "")}
                        className={styles.priceClearBtn}
                      >
                        <X size={14} />
                      </button>
                    )}
                    <span className={styles.currencySuffix}>
                      {t("priceCurrency")}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.featuresSection}>
                <div className={styles.featureHeader}>
                  <label className={styles.label}>{t("features")}</label>
                  <button
                    onClick={() => handleAddFeature(pIdx)}
                    className={styles.addFeatureBtn}
                  >
                    <Plus size={12} /> {t("addFeature")}
                  </button>
                </div>

                <div className={styles.featureList}>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className={styles.featureItem}>
                      <Check size={12} className="text-primary shrink-0" />
                      <input
                        type="text"
                        className="bg-transparent text-xs font-bold text-foreground/80 outline-none flex-1 min-w-0 pr-6"
                        value={feature}
                        onChange={(e) =>
                          handleUpdateFeature(pIdx, fIdx, e.target.value)
                        }
                      />
                      <button
                        onClick={() => handleRemoveFeature(pIdx, fIdx)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={handleAddPlan} className={styles.addPlanBtn}>
          <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
            <Plus className="text-primary" size={24} />
          </div>
          <span className="text-sm font-black uppercase tracking-wider">
            {t("addNewPlan")}
          </span>
        </button>
      </div>

      <style jsx global>{`
        @keyframes card-shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .animate-card-shake {
          animation: card-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
};
