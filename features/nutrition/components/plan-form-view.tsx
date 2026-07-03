"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Search, Info, Sparkles, Plus, Trash2, X } from "lucide-react";
import { searchIngredients, type Meal, type MealItem, type Ingredient } from "../services/nutrition-api";

interface PlanFormProps {
  planName: string;
  setPlanName: (name: string) => void;
  targetCalories: number;
  setTargetCalories: (val: number) => void;
  targetProtein: number;
  setTargetProtein: (val: number) => void;
  targetCarbs: number;
  setTargetCarbs: (val: number) => void;
  targetFat: number;
  setTargetFat: (val: number) => void;
  meals: Meal[];
  setMeals: (meals: Meal[]) => void;
  onCancel: () => void;
  onSave: () => void;
  t: (key: string) => string;
}

const styles = {
  section: "bg-surface/50 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl text-left rtl:text-right",
  label: "block text-xs font-black uppercase tracking-widest text-foreground/50 mb-2",
  input: "w-full bg-[#0D121F] border border-white/5 focus:border-primary/50 text-foreground px-4 py-3 rounded-xl outline-none transition-all text-sm font-bold",
  btn: "bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2",
  btnOutline: "bg-white/5 border border-white/10 text-foreground hover:bg-white/10 font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2",
  
  infoBox: "bg-primary/5 border border-primary/10 rounded-2xl p-4 text-xs leading-relaxed text-foreground/80 flex gap-3 items-start",
  infoIcon: "text-primary shrink-0 mt-0.5",
  
  mealBlock: "bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-4",
  mealHeader: "flex justify-between items-center border-b border-white/5 pb-3 mb-3",
  
  searchResultRow: "p-3 hover:bg-primary/10 rounded-xl cursor-pointer transition-colors border-b border-white/5 last:border-b-0 text-left",
  searchResultName: "text-xs font-bold text-white",
  searchResultMacros: "text-[10px] text-foreground/50 font-medium",
};

export function PlanFormView({
  planName,
  setPlanName,
  targetCalories,
  setTargetCalories,
  targetProtein,
  setTargetProtein,
  targetCarbs,
  setTargetCarbs,
  targetFat,
  setTargetFat,
  meals,
  setMeals,
  onCancel,
  onSave,
  t,
}: PlanFormProps) {
  // Search subform state
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  const [customIngName, setCustomIngName] = useState<string>("");
  const [customIngCalories, setCustomIngCalories] = useState<string>("");
  const [customIngProtein, setCustomIngProtein] = useState<string>("");
  const [customIngCarbs, setCustomIngCarbs] = useState<string>("");
  const [customIngFat, setCustomIngFat] = useState<string>("");
  const [customIngAmount, setCustomIngAmount] = useState<string>("100");

  // Handle meal actions
  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      name: `Meal ${meals.length + 1}`,
      items: [],
    };
    setMeals([...meals, newMeal]);
  };

  const handleRemoveMeal = (mealId: string) => {
    setMeals(meals.filter((m) => m.id !== mealId));
  };

  // Search ingredients from API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchIngredients(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchIngredient = (ing: Ingredient) => {
    setCustomIngName(ing.name);
    setCustomIngCalories(String(ing.energy));
    setCustomIngProtein(String(ing.protein));
    setCustomIngCarbs(String(ing.carbohydrates));
    setCustomIngFat(String(ing.fat));
    setSearchResults([]);
    setSearchQuery("");
  };

  // Add meal item
  const handleAddMealItem = (mealId: string) => {
    if (!customIngName.trim()) return;

    const newItem: MealItem = {
      id: `item-${Date.now()}`,
      ingredient: {
        name: customIngName,
        energy: parseFloat(customIngCalories) || 0,
        protein: parseFloat(customIngProtein) || 0,
        carbohydrates: parseFloat(customIngCarbs) || 0,
        fat: parseFloat(customIngFat) || 0,
      },
      amount: parseFloat(customIngAmount) || 100,
    };

    setMeals(
      meals.map((m) => {
        if (m.id === mealId) {
          return { ...m, items: [...m.items, newItem] };
        }
        return m;
      })
    );

    // Reset item input form
    setCustomIngName("");
    setCustomIngCalories("");
    setCustomIngProtein("");
    setCustomIngCarbs("");
    setCustomIngFat("");
    setCustomIngAmount("100");
    setActiveMealId(null);
  };

  const handleRemoveMealItem = (mealId: string, itemId: string) => {
    setMeals(
      meals.map((m) => {
        if (m.id === mealId) {
          return { ...m, items: m.items.filter((item) => item.id !== itemId) };
        }
        return m;
      })
    );
  };

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onCancel} className={styles.btnOutline} aria-label={t("cancel")}>
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-xl font-black uppercase text-white leading-none">{t("createPlan")}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Left side: Targets */}
        <div className="flex flex-col gap-4">
          <div>
            <label className={styles.label}>{t("planName")}</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder={t("planNamePlaceholder")}
              className={styles.input}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={styles.label}>{t("targetCalories")}</label>
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>{t("targetProtein")}</label>
              <input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(parseInt(e.target.value) || 0)}
                className={styles.input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={styles.label}>{t("targetCarbs")}</label>
              <input
                type="number"
                value={targetCarbs}
                onChange={(e) => setTargetCarbs(parseInt(e.target.value) || 0)}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>{t("targetFat")}</label>
              <input
                type="number"
                value={targetFat}
                onChange={(e) => setTargetFat(parseInt(e.target.value) || 0)}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Right side: Instructions */}
        <div className={styles.infoBox}>
          <Info size={18} className={styles.infoIcon} />
          <div>
            <h4 className="font-bold text-white uppercase mb-1">{t("instructionsTitle")}</h4>
            <p className="text-foreground/60 leading-relaxed mb-2">
              {t("instructionsBody")}
            </p>
            <span className="text-[10px] uppercase font-black tracking-widest text-primary flex items-center gap-1">
              <Sparkles size={11} /> {t("cloudSyncReady")}
            </span>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="border-t border-white/5 pt-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-black uppercase text-white tracking-wider">{t("meals")}</h3>
          <button type="button" onClick={handleAddMeal} className={styles.btnOutline}>
            <Plus size={14} />
            {t("addMeal")}
          </button>
        </div>

        {meals.map((meal) => (
          <div key={meal.id} className={styles.mealBlock}>
            {/* Meal Header */}
            <div className={styles.mealHeader}>
              <input
                type="text"
                value={meal.name}
                onChange={(e) => {
                  setMeals(meals.map((m) => (m.id === meal.id ? { ...m, name: e.target.value } : m)));
                }}
                placeholder={t("addMealPlaceholder")}
                className="bg-transparent border-none text-primary font-black uppercase text-sm outline-none w-1/2"
              />
              <button type="button" onClick={() => handleRemoveMeal(meal.id)} className="text-foreground/45 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-2 mb-3">
              {meal.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs font-bold bg-white/[0.01] border border-white/5 rounded-xl p-3 text-left rtl:text-right">
                  <div>
                    <span className="text-white uppercase">{item.ingredient.name}</span>
                    <span className="text-foreground/40 font-medium ml-2">({item.amount}g)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-foreground/50">{Math.round((item.ingredient.energy * item.amount) / 100)} kcal</span>
                    <button type="button" onClick={() => handleRemoveMealItem(meal.id, item.id)} className="text-foreground/30 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Item adder panel */}
            {activeMealId === meal.id ? (
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 mt-3 flex flex-col gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-foreground/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className={`${styles.input} pl-9`}
                  />
                </div>

                {/* Search suggestions */}
                {searchQuery.trim() && (
                  <div className="bg-[#0D121F] border border-white/5 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    {searching ? (
                      <div className="p-3 text-xs text-foreground/40 font-bold text-center">{t("searching")}</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-xs text-foreground/40 font-bold text-center">{t("noMatches")}</div>
                    ) : (
                      searchResults.map((ing) => (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => handleSelectSearchIngredient(ing)}
                          className={styles.searchResultRow}
                        >
                          <div className={styles.searchResultName}>{ing.name}</div>
                          <div className={styles.searchResultMacros}>
                            {ing.energy} kcal · {t("protein")}: {ing.protein}g · {t("carbs").split(" (")[0]}: {ing.carbohydrates}g · {t("fat")}: {ing.fat}g (per 100g)
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Custom inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left rtl:text-right">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">{t("ingredientName")}</label>
                    <input
                      type="text"
                      value={customIngName}
                      onChange={(e) => setCustomIngName(e.target.value)}
                      placeholder="Custom ingredient..."
                      className={styles.input}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">{t("amountG")}</label>
                    <input
                      type="number"
                      value={customIngAmount}
                      onChange={(e) => setCustomIngAmount(e.target.value)}
                      placeholder="100"
                      className={styles.input}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">{t("calories100g")}</label>
                    <input
                      type="number"
                      value={customIngCalories}
                      onChange={(e) => setCustomIngCalories(e.target.value)}
                      placeholder="kcal"
                      className={styles.input}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">{t("protein100g")}</label>
                    <input
                      type="number"
                      value={customIngProtein}
                      onChange={(e) => setCustomIngProtein(e.target.value)}
                      placeholder="g"
                      className={styles.input}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">{t("carbsFat100g")}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={customIngCarbs}
                        onChange={(e) => setCustomIngCarbs(e.target.value)}
                        placeholder="C"
                        className={styles.input}
                      />
                      <input
                        type="number"
                        value={customIngFat}
                        onChange={(e) => setCustomIngFat(e.target.value)}
                        placeholder="F"
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2 justify-end">
                  <button type="button" onClick={() => setActiveMealId(null)} className={styles.btnOutline}>
                    {t("cancel")}
                  </button>
                  <button type="button" onClick={() => handleAddMealItem(meal.id)} className={styles.btn}>
                    {t("addIngredientBtn")}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setActiveMealId(meal.id)} className={`${styles.btnOutline} w-full mt-2`}>
                <Plus size={12} />
                {t("addItem")}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
        <button type="button" onClick={onCancel} className={styles.btnOutline}>
          {t("cancel")}
        </button>
        <button type="button" onClick={onSave} className={styles.btn} disabled={!planName.trim()}>
          {t("savePlan")}
        </button>
      </div>
    </div>
  );
}
