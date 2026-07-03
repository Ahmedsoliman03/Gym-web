"use client";

import { ArrowLeft, Trash2, Utensils } from "lucide-react";
import type { NutritionPlan } from "../services/nutrition-api";

interface PlanDetailsProps {
  plan: NutritionPlan;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onBack: () => void;
  onDelete: (e: React.MouseEvent) => void;
  t: (key: string) => string;
}

const styles = {
  section: "bg-surface/50 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl",
  btnOutline: "bg-white/5 border border-white/10 text-foreground hover:bg-white/10 font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2",
  btnDanger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2",

  progressRow: "flex flex-col gap-2 mt-4",
  progressBar: "h-2 w-full bg-white/10 rounded-full overflow-hidden relative",
  macroTitle: "text-sm font-black text-white uppercase tracking-wider text-left",
};

export function PlanDetailsView({ plan, totals, onBack, onDelete, t }: PlanDetailsProps) {
  const calPct = Math.min(100, Math.round((totals.calories / plan.targetCalories) * 100)) || 0;
  const protPct = Math.min(100, Math.round((totals.protein / plan.targetProtein) * 100)) || 0;
  const carbPct = Math.min(100, Math.round((totals.carbs / plan.targetCarbs) * 100)) || 0;
  const fatPct = Math.min(100, Math.round((totals.fat / plan.targetFat) * 100)) || 0;

  return (
    <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 items-start">
      {/* Left panel: macro progress vs target goals */}
      <div className={`${styles.section} lg:col-span-2 flex flex-col gap-6`}>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className={styles.btnOutline} aria-label={t("cancel")}>
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-lg font-black uppercase text-white leading-none">{plan.name}</h2>
        </div>

        {/* Target vs Actual Progress Summary */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-4">{t("nutritionSummary")}</h3>

          <div className="flex flex-col gap-5">
            {/* Caloric Intake */}
            <div className={styles.progressRow}>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className={styles.macroTitle}>Calories</span>
                <span className="font-black text-primary">
                  {totals.calories} / {plan.targetCalories} <span className="text-[10px] text-foreground/50 font-normal">kcal ({calPct}%)</span>
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${calPct}%` }} />
              </div>
            </div>

            {/* Protein */}
            <div className={styles.progressRow}>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className={styles.macroTitle}>{t("protein")}</span>
                <span className="font-black text-white">
                  {totals.protein}g / {plan.targetProtein}g <span className="text-[10px] text-foreground/50 font-normal">({protPct}%)</span>
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${protPct}%` }} />
              </div>
            </div>

            {/* Carbs */}
            <div className={styles.progressRow}>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className={styles.macroTitle}>{t("carbs")}</span>
                <span className="font-black text-sky-400">
                  {totals.carbs}g / {plan.targetCarbs}g <span className="text-[10px] text-foreground/50 font-normal">({carbPct}%)</span>
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${carbPct}%` }} />
              </div>
            </div>

            {/* Fat */}
            <div className={styles.progressRow}>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className={styles.macroTitle}>{t("fat")}</span>
                <span className="font-black text-amber-400">
                  {totals.fat}g / {plan.targetFat}g <span className="text-[10px] text-foreground/50 font-normal">({fatPct}%)</span>
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${fatPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <button type="button" onClick={onDelete} className={styles.btnDanger}>
          <Trash2 size={14} />
          {t("deletePlan")}
        </button>
      </div>

      {/* Right panel: meals details */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        {plan.meals.map((meal) => (
          <div key={meal.id} className={styles.section}>
            <h3 className="font-black uppercase text-sm tracking-wide text-primary border-b border-white/5 pb-3 mb-4 flex items-center gap-2 text-left rtl:text-right">
              <Utensils size={16} />
              {meal.name}
            </h3>

            <div className="flex flex-col gap-3">
              {meal.items.length === 0 ? (
                <div className="text-xs text-foreground/30 font-bold uppercase py-2 text-left rtl:text-right">
                  {t("noIngredients")}
                </div>
              ) : (
                meal.items.map((item) => {
                  const factor = item.amount / 100;
                  const itemKcal = Math.round((item.ingredient.energy || 0) * factor);
                  const itemProt = Math.round((item.ingredient.protein || 0) * factor);
                  const itemCarb = Math.round((item.ingredient.carbohydrates || 0) * factor);
                  const itemFat = Math.round((item.ingredient.fat || 0) * factor);

                  return (
                    <div key={item.id} className="flex justify-between items-center border border-white/5 rounded-xl p-4 bg-white/[0.01] text-left rtl:text-right">
                      <div>
                        <h4 className="text-xs font-black uppercase text-white tracking-wide">{item.ingredient.name}</h4>
                        <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                          {t("itemAmount").split(" (")[0]}: {item.amount}g · {t("protein")}: {itemProt}g · {t("carbs").split(" (")[0]}: {itemCarb}g · {t("fat")}: {itemFat}g
                        </span>
                      </div>
                      <div className="text-xs font-black text-primary shrink-0">
                        {itemKcal} kcal
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
