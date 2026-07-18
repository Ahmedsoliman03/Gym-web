// Pure fitness math + input validation.
//
// Everything here is a plain function with no React / DOM dependencies, so each
// piece can be reasoned about, logged, and unit-tested in isolation. The React
// layer (use-calorie-calculator) only orchestrates these.

import type {
  ActivityLevel,
  BmiCategory,
  CalculatorErrors,
  CalculatorInputs,
  CalculatorResults,
  Gender,
  Goal,
  Macros,
  MacroSplit,
  NumericField,
} from "./types";

/** TDEE activity multipliers (Mifflin-St Jeor). */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

/** Calorie adjustment applied to TDEE for each goal (kcal). */
export const GOAL_CALORIE_DELTA: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 500,
};

/** Macro ratios per split — protein / carbs / fat as fractions of total calories. */
export const MACRO_SPLITS: Record<MacroSplit, { protein: number; carbs: number; fat: number }> = {
  balanced: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  highProtein: { protein: 0.4, carbs: 0.3, fat: 0.3 },
  lowCarb: { protein: 0.3, carbs: 0.1, fat: 0.6 },
};

/** kcal per gram for each macronutrient. */
const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

/**
 * Sex-aware floor for target calories so weight-loss goals never go dangerously
 * low. 1200 kcal is the accepted minimum for women, but guidelines put the male
 * floor at 1500 kcal (2013 AHA/ACC/TOS Obesity Guidelines).
 */
const MIN_TARGET_CALORIES: Record<Gender, number> = {
  male: 1500,
  female: 1200,
};

/** Validation bounds for the numeric inputs. */
export const AGE_MAX = 100;

const NUMERIC_FIELDS: readonly NumericField[] = ["weight", "height", "age"];

export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  return "obese";
}

/**
 * Validate numeric inputs. Returns a map of `field -> error code`; an empty
 * object means the form is valid. All fields are required, must be positive
 * numbers, and age must not exceed {@link AGE_MAX}.
 */
export function validateInputs(inputs: CalculatorInputs): CalculatorErrors {
  const errors: CalculatorErrors = {};

  for (const field of NUMERIC_FIELDS) {
    const raw = inputs[field].trim();
    if (raw === "") {
      errors[field] = "required";
      continue;
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      errors[field] = "invalid";
    }
  }

  if (!errors.age && Number(inputs.age) > AGE_MAX) {
    errors.age = "ageMax";
  }

  return errors;
}

/**
 * Compute BMI / BMR / TDEE / target calories. Assumes `inputs` already passed
 * {@link validateInputs}.
 */
export function calculateResults(inputs: CalculatorInputs): CalculatorResults {
  const weight = Number(inputs.weight);
  const height = Number(inputs.height);
  const age = Number(inputs.age);

  const heightInM = height / 100;
  const bmi = Number((weight / (heightInM * heightInM)).toFixed(1));

  // BMR — Mifflin-St Jeor.
  const genderOffset = inputs.gender === "male" ? 5 : -161;
  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + genderOffset);

  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[inputs.activity]);
  const calories = Math.max(MIN_TARGET_CALORIES[inputs.gender], tdee + GOAL_CALORIE_DELTA[inputs.goal]);

  return { bmi, bmiCategory: classifyBmi(bmi), bmr, tdee, calories };
}

/** Break a calorie target into protein / carbs / fat grams for a given split. */
export function calculateMacros(calories: number, split: MacroSplit): Macros {
  const ratios = MACRO_SPLITS[split];
  return {
    protein: Math.round((calories * ratios.protein) / KCAL_PER_GRAM.protein),
    carbs: Math.round((calories * ratios.carbs) / KCAL_PER_GRAM.carbs),
    fat: Math.round((calories * ratios.fat) / KCAL_PER_GRAM.fat),
    pPct: ratios.protein,
    cPct: ratios.carbs,
    fPct: ratios.fat,
  };
}
