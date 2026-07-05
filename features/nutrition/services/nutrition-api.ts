export interface Ingredient {
  id?: string | number;
  name: string;
  energy: number; // kcal per 100g
  protein: number; // grams per 100g
  carbohydrates: number; // grams per 100g
  fat: number; // grams per 100g
}

export interface MealItem {
  id: string;
  ingredient: Ingredient;
  amount: number; // grams
}

export interface Meal {
  id: string;
  name: string;
  items: MealItem[];
}

export interface NutritionPlan {
  id: string;
  name: string;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  meals: Meal[];
  description?: string;
  createdAt: string;
  wgerId?: number; // associated wger plan id if synced
}

const LOCAL_STORAGE_KEY = "gymspot_nutrition_plans";
const WGER_TOKEN_KEY = "gymspot_cloud_sync_token";

// Get token from client side
export function getWgerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WGER_TOKEN_KEY);
}

export function setWgerToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WGER_TOKEN_KEY, token);
}

export function removeWgerToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WGER_TOKEN_KEY);
}

// Local storage plan CRUD
export function getLocalPlans(): NutritionPlan[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalPlans(plans: NutritionPlan[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
}

// Search ingredients on wger
export async function searchIngredients(query: string): Promise<Ingredient[]> {
  try {
    const url = `/api/wger/ingredient/?search=${encodeURIComponent(query)}`;
    const headers: Record<string, string> = {};
    const token = getWgerToken();
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Search failed");
    const data = await response.json();
    
    // wger ingredient model:
    // name: string, energy: number, protein: float, carbohydrates: float, fat: float
    // Results might contain ingredients list.
    const results = data.results || [];
    return results.map((item: any) => ({
      id: item.id,
      name: item.name,
      energy: item.energy || 0,
      protein: parseFloat(item.protein || 0),
      carbohydrates: parseFloat(item.carbohydrates || 0),
      fat: parseFloat(item.fat || 0),
    }));
  } catch (error) {
    console.error("Ingredient Search Error:", error);
    return [];
  }
}

// Main API interface (hybrid)
export async function getNutritionPlans(): Promise<NutritionPlan[]> {
  const token = getWgerToken();
  const localPlans = getLocalPlans();

  if (!token) {
    return localPlans;
  }

  try {
    // If token exists, fetch plans from wger
    const response = await fetch("/api/wger/nutritionplan/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch wger plans");
    }

    const data = await response.json();
    const wgerPlans = data.results || [];

    // Formulate into our structure. Each plan's detail is fetched in parallel
    // (previously a serial 1+N waterfall — one blocking round-trip per plan).
    const plans: NutritionPlan[] = await Promise.all(
      wgerPlans.map(async (wPlan: { id: number; name?: string; description?: string }): Promise<NutritionPlan> => {
      // Fetch plan meals (wger has nutritionplaninfo which includes detailed plan)
      // or we can query nutritionplaninfo detail
      let meals: Meal[] = [];
      try {
        const infoRes = await fetch(`/api/wger/nutritionplaninfo/${wPlan.id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (infoRes.ok) {
          const infoData = await infoRes.json();
          // wger maps plan info to meals
          meals = (infoData.meals || []).map((m: any) => ({
            id: String(m.id),
            name: m.name || "Meal",
            items: (m.meal_items || []).map((item: any) => ({
              id: String(item.id),
              amount: item.amount || 100,
              ingredient: {
                id: item.ingredient.id,
                name: item.ingredient.name,
                energy: item.ingredient.energy || 0,
                protein: parseFloat(item.ingredient.protein || 0),
                carbohydrates: parseFloat(item.ingredient.carbohydrates || 0),
                fat: parseFloat(item.ingredient.fat || 0),
              },
            })),
          }));
        }
      } catch (err) {
        console.error(`Error loading details for wger plan ${wPlan.id}:`, err);
      }

      // Check if we have target macros in description (often saved as JSON or text)
      let targetCalories = 2000;
      let targetProtein = 150;
      let targetCarbs = 200;
      let targetFat = 70;

      if (wPlan.description) {
        try {
          const parsed = JSON.parse(wPlan.description);
          if (parsed.targetCalories) {
            targetCalories = parsed.targetCalories;
            targetProtein = parsed.targetProtein || 150;
            targetCarbs = parsed.targetCarbs || 200;
            targetFat = parsed.targetFat || 70;
          }
        } catch {
          // Fallback parsing if description has key-values
        }
      }

      return {
        id: `wger-${wPlan.id}`,
        wgerId: wPlan.id,
        name: wPlan.name || "Unnamed Plan",
        description: wPlan.description,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        meals,
        createdAt: new Date().toISOString(), // wger doesn't always expose creation date directly
      };
      }),
    );

    // Merge wger plans and local plans (avoiding duplicates)
    const merged = [...plans];
    localPlans.forEach((lp) => {
      if (!merged.some((mp) => mp.id === lp.id)) {
        merged.push(lp);
      }
    });

    return merged;
  } catch (error) {
    console.error("Failed to load plans from wger API, using local storage:", error);
    return localPlans;
  }
}

export async function createNutritionPlan(planData: Omit<NutritionPlan, "id" | "createdAt">): Promise<NutritionPlan> {
  const token = getWgerToken();
  const id = `local-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const newPlan: NutritionPlan = {
    ...planData,
    id,
    createdAt,
  };

  if (!token) {
    const plans = getLocalPlans();
    plans.push(newPlan);
    saveLocalPlans(plans);
    return newPlan;
  }

  try {
    // 1. Create plan on wger.de
    const description = JSON.stringify({
      targetCalories: planData.targetCalories,
      targetProtein: planData.targetProtein,
      targetCarbs: planData.targetCarbs,
      targetFat: planData.targetFat,
      notes: planData.description || "",
    });

    const response = await fetch("/api/wger/nutritionplan/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        name: planData.name,
        description: description,
      }),
    });

    if (!response.ok) throw new Error("Failed to create wger plan");
    const wPlan = await response.json();
    newPlan.wgerId = wPlan.id;
    newPlan.id = `wger-${wPlan.id}`;

    // 2. Create meals and meal items
    for (const meal of planData.meals) {
      const mealRes = await fetch("/api/wger/meal/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          plan: wPlan.id,
          name: meal.name,
        }),
      });

      if (mealRes.ok) {
        const wMeal = await mealRes.json();
        for (const item of meal.items) {
          // Check/create ingredient on wger if id doesn't exist
          let ingId = item.ingredient.id;
          if (!ingId) {
            // Create ingredient
            const ingRes = await fetch("/api/wger/ingredient/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
              },
              body: JSON.stringify({
                name: item.ingredient.name,
                energy: item.ingredient.energy,
                protein: item.ingredient.protein,
                carbohydrates: item.ingredient.carbohydrates,
                fat: item.ingredient.fat,
              }),
            });
            if (ingRes.ok) {
              const wIng = await ingRes.json();
              ingId = wIng.id;
            }
          }

          if (ingId) {
            // Create meal item
            await fetch("/api/wger/mealitem/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
              },
              body: JSON.stringify({
                meal: wMeal.id,
                ingredient: ingId,
                amount: item.amount,
              }),
            });
          }
        }
      }
    }

    return newPlan;
  } catch (error) {
    console.error("Failed to save to wger API, saving locally:", error);
    const plans = getLocalPlans();
    plans.push(newPlan);
    saveLocalPlans(plans);
    return newPlan;
  }
}

export async function deleteNutritionPlan(id: string, wgerId?: number): Promise<void> {
  const token = getWgerToken();

  // Always delete from local storage first
  const plans = getLocalPlans();
  const filtered = plans.filter((p) => p.id !== id);
  saveLocalPlans(filtered);

  if (token && wgerId) {
    try {
      await fetch(`/api/wger/nutritionplan/${wgerId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      });
    } catch (error) {
      console.error(`Failed to delete plan ${wgerId} from wger:`, error);
    }
  }
}
