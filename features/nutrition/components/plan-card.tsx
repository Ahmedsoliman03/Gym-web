"use client";

import { Trash2 } from "lucide-react";
import type { NutritionPlan } from "../services/nutrition-api";

interface PlanCardProps {
  plan: NutritionPlan;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  t: (key: string) => string;
}

const styles = {
  card: "bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-primary/30 hover:bg-white/[0.05] transition-all flex flex-col justify-between cursor-pointer group relative text-left rtl:text-right",
  cardTitle: "font-black uppercase text-base text-white tracking-wide mb-1",
  cardSub: "text-foreground/40 text-xs font-bold mb-4",
  cardStatRow: "grid grid-cols-4 gap-2 border-t border-white/5 pt-4 mt-4 text-center",
  cardStatVal: "text-sm font-black text-white",
  cardStatLbl: "text-[9px] text-foreground/40 uppercase font-black tracking-widest",
  deleteBtn: "absolute top-4 right-4 p-2 text-foreground/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all z-10",
};

export function PlanCard({ plan, totals, onSelect, onDelete, t }: PlanCardProps) {
  return (
    <div className={styles.card} onClick={onSelect}>
      <div>
        <h3 className={styles.cardTitle}>{plan.name}</h3>
        <span className={styles.cardSub}>
          {plan.meals.length} {t("meals")} · {plan.meals.reduce((acc, m) => acc + m.items.length, 0)} {t("items")}
        </span>
      </div>

      <button 
        type="button" 
        onClick={onDelete} 
        className={styles.deleteBtn}
        aria-label={t("deletePlan")}
      >
        <Trash2 size={16} />
      </button>

      <div className={styles.cardStatRow}>
        <div>
          <div className={styles.cardStatVal}>{totals.calories}</div>
          <div className={styles.cardStatLbl}>kcal</div>
        </div>
        <div>
          <div className={`${styles.cardStatVal} text-primary`}>{totals.protein}g</div>
          <div className={styles.cardStatLbl}>{t("protein").substring(0, 5)}</div>
        </div>
        <div>
          <div className={`${styles.cardStatVal} text-sky-400`}>{totals.carbs}g</div>
          <div className={styles.cardStatLbl}>{t("carbs").substring(0, 5)}</div>
        </div>
        <div>
          <div className={`${styles.cardStatVal} text-amber-400`}>{totals.fat}g</div>
          <div className={styles.cardStatLbl}>{t("fat").substring(0, 5)}</div>
        </div>
      </div>
    </div>
  );
}
