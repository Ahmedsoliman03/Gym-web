// Shared types for the Fitness (Calorie / BMI) calculator feature.

export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";
export type Goal = "lose" | "maintain" | "gain";
export type MacroSplit = "balanced" | "highProtein" | "lowCarb";
export type BmiCategory = "underweight" | "normal" | "overweight" | "obese";

/** Raw form inputs. Numeric fields stay as strings while the user types. */
export interface CalculatorInputs {
  weight: string;
  height: string;
  age: string;
  gender: Gender;
  activity: ActivityLevel;
  goal: Goal;
}

/** Numeric fields that get validated on submit. */
export type NumericField = "weight" | "height" | "age";

/** Validation error codes — mapped to translated copy in the UI. */
export type FieldErrorCode = "required" | "invalid" | "ageMax";

export type CalculatorErrors = Partial<Record<NumericField, FieldErrorCode>>;

export interface CalculatorResults {
  bmi: number;
  bmiCategory: BmiCategory;
  bmr: number;
  tdee: number;
  calories: number;
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  /** Protein / carbs / fat share of total calories (0–1). */
  pPct: number;
  cPct: number;
  fPct: number;
}
