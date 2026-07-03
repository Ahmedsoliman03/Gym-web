"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Utensils, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { CloudSyncPanel } from "./cloud-sync-panel";
import { PlanCard } from "./plan-card";
import { PlanDetailsView } from "./plan-details-view";
import { PlanFormView } from "./plan-form-view";
import { 
  getNutritionPlans, createNutritionPlan, deleteNutritionPlan, 
  getWgerToken, setWgerToken, removeWgerToken,
  type NutritionPlan, type Meal 
} from "../services/nutrition-api";

const styles = {
  container: "flex flex-col gap-8",
  grid: "grid md:grid-cols-2 lg:grid-cols-3 gap-6",
  btn: "bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2",
  btnOutline: "bg-white/5 border border-white/10 text-foreground hover:bg-white/10 font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2",
};

export function NutritionDashboard() {
  const t = useTranslations("Nutrition");
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Navigation / Views: "list" | "create" | "detail"
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedPlan, setSelectedPlan] = useState<NutritionPlan | null>(null);

  // Auth State
  const [wgerToken, setTokenState] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Create Form State
  const [planName, setPlanName] = useState<string>("");
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [targetProtein, setTargetProtein] = useState<number>(150);
  const [targetCarbs, setTargetCarbs] = useState<number>(200);
  const [targetFat, setTargetFat] = useState<number>(70);
  const [meals, setMeals] = useState<Meal[]>([]);

  // Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [planToDelete, setPlanToDelete] = useState<NutritionPlan | null>(null);

  // Load plans & token initially
  useEffect(() => {
    const token = getWgerToken();
    if (token) {
      setTokenState(token);
      setIsConnected(true);
    }
    loadPlans();

    // Check for draft plan from Fitness Calculator
    const draftStr = localStorage.getItem("gymspot_draft_nutrition_plan");
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setPlanName(draft.name || "");
        setTargetCalories(draft.targetCalories || 2000);
        setTargetProtein(draft.targetProtein || 150);
        setTargetCarbs(draft.targetCarbs || 200);
        setTargetFat(draft.targetFat || 70);
        setMeals([
          { id: "meal-1", name: "Breakfast", items: [] },
          { id: "meal-2", name: "Lunch", items: [] },
          { id: "meal-3", name: "Dinner", items: [] }
        ]);
        
        setView("create");
      } catch (err) {
        console.error("Error loading draft nutrition plan:", err);
      }
    }
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await getNutritionPlans();
      setPlans(data);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWger = () => {
    if (!wgerToken.trim()) return;
    setWgerToken(wgerToken);
    setIsConnected(true);
    loadPlans();
  };

  const handleDisconnectWger = () => {
    removeWgerToken();
    setTokenState("");
    setIsConnected(false);
    loadPlans();
  };

  // Create plan triggers
  const initCreateForm = () => {
    setPlanName("");
    setTargetCalories(2000);
    setTargetProtein(150);
    setTargetCarbs(200);
    setTargetFat(70);
    setMeals([
      { id: "meal-1", name: "Breakfast", items: [] },
      { id: "meal-2", name: "Lunch", items: [] },
      { id: "meal-3", name: "Dinner", items: [] }
    ]);
    setView("create");
  };

  const handleCancelCreate = () => {
    localStorage.removeItem("gymspot_draft_nutrition_plan");
    setView("list");
  };

  // Save full nutrition plan
  const handleSavePlan = async () => {
    if (!planName.trim()) return;

    const planData = {
      name: planName,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      meals,
      description: `Target Calories: ${targetCalories} kcal`
    };

    setLoading(true);
    await createNutritionPlan(planData);
    localStorage.removeItem("gymspot_draft_nutrition_plan");
    await loadPlans();
    setView("list");
  };

  // Trigger Delete Confirmation Modal
  const triggerDeleteConfirm = (e: React.MouseEvent, plan: NutritionPlan) => {
    e.stopPropagation();
    setPlanToDelete(plan);
    setDeleteConfirmOpen(true);
  };

  // Plan Calculations
  const calculatePlanTotals = (plan: NutritionPlan) => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    plan.meals.forEach(m => {
      m.items.forEach(item => {
        const factor = item.amount / 100;
        calories += (item.ingredient.energy || 0) * factor;
        protein += (item.ingredient.protein || 0) * factor;
        carbs += (item.ingredient.carbohydrates || 0) * factor;
        fat += (item.ingredient.fat || 0) * factor;
      });
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    };
  };

  return (
    <div className={styles.container}>
      {/* 1. LIST VIEW */}
      {view === "list" && (
        <>
          <CloudSyncPanel 
            wgerToken={wgerToken}
            setTokenState={setTokenState}
            isConnected={isConnected}
            handleConnect={handleConnectWger}
            handleDisconnect={handleDisconnectWger}
            t={t}
          />

          {/* List Header */}
          <div className="flex justify-between items-center mt-4">
            <h2 className="text-xl font-black uppercase text-white tracking-wide">{t("meals")}</h2>
            <button type="button" onClick={initCreateForm} className={styles.btn}>
              <Plus size={16} />
              {t("createPlan")}
            </button>
          </div>

          {/* Dashboard Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : plans.length === 0 ? (
            /* Empty State */
            <div className="bg-surface/50 border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground/30 animate-pulse">
                <Utensils size={28} />
              </div>
              <p className="text-foreground/50 font-bold max-w-sm text-xs leading-relaxed uppercase tracking-wider">
                {t("emptyState")}
              </p>
              <button type="button" onClick={initCreateForm} className={`${styles.btn} mt-2`}>
                <Plus size={16} />
                {t("createPlan")}
              </button>
            </div>
          ) : (
            /* Plans Grid */
            <div className={styles.grid}>
              {plans.map((plan) => {
                const totals = calculatePlanTotals(plan);
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    totals={totals}
                    onSelect={() => {
                      setSelectedPlan(plan);
                      setView("detail");
                    }}
                    onDelete={(e) => triggerDeleteConfirm(e, plan)}
                    t={t}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 2. PLAN CREATION FORM */}
      {view === "create" && (
        <PlanFormView
          planName={planName}
          setPlanName={setPlanName}
          targetCalories={targetCalories}
          setTargetCalories={setTargetCalories}
          targetProtein={targetProtein}
          setTargetProtein={setTargetProtein}
          targetCarbs={targetCarbs}
          setTargetCarbs={setTargetCarbs}
          targetFat={targetFat}
          setTargetFat={setTargetFat}
          meals={meals}
          setMeals={setMeals}
          onCancel={handleCancelCreate}
          onSave={handleSavePlan}
          t={t}
        />
      )}

      {/* 3. PLAN DETAIL VIEW */}
      {view === "detail" && selectedPlan && (
        <PlanDetailsView 
          plan={selectedPlan}
          totals={calculatePlanTotals(selectedPlan)}
          onBack={() => setView("list")}
          onDelete={(e) => triggerDeleteConfirm(e, selectedPlan)}
          t={t}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setPlanToDelete(null);
        }}
        title={t("deletePlan")}
      >
        <div className="flex flex-col gap-4 text-left rtl:text-right">
          <div className="flex items-center gap-3 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-xs font-bold leading-normal">
              {t("confirmDelete")}
            </p>
          </div>
          
          <div className="flex gap-3 justify-end mt-4">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setPlanToDelete(null);
              }}
              className={styles.btnOutline}
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (planToDelete) {
                  setLoading(true);
                  setDeleteConfirmOpen(false);
                  await deleteNutritionPlan(planToDelete.id, planToDelete.wgerId);
                  setPlanToDelete(null);
                  await loadPlans();
                  setView("list");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all"
            >
              {t("deletePlan")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
