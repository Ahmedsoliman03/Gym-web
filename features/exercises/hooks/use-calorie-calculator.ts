"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CalculatorErrors,
  CalculatorInputs,
  CalculatorResults,
  MacroSplit,
  NumericField,
} from "../types";
import { calculateMacros, calculateResults, validateInputs } from "../fitness-math";

const STORAGE_KEY = "gymspot_calculator_state";

const DEFAULT_INPUTS: CalculatorInputs = {
  weight: "",
  height: "",
  age: "",
  gender: "male",
  activity: "moderate",
  goal: "lose",
};

interface PersistedState {
  inputs: CalculatorInputs;
  results: CalculatorResults | null;
  macroSplit: MacroSplit;
}

function loadPersistedState(): PersistedState | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as PersistedState;
  } catch (err) {
    console.error("[calculator] failed to parse saved state:", err);
    return null;
  }
}

/** True once the user has typed any measurement (drives the unsaved-changes guard). */
function hasMeasurements(inputs: CalculatorInputs): boolean {
  return Boolean(inputs.weight || inputs.height || inputs.age);
}

/**
 * Owns all calculator state: form inputs, computed results, macro split,
 * validation errors, and localStorage persistence. The component stays purely
 * presentational and just wires this up.
 */
export function useCalorieCalculator(onDirtyChange?: (dirty: boolean) => void) {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [macroSplit, setMacroSplit] = useState<MacroSplit>("balanced");
  const [errors, setErrors] = useState<CalculatorErrors>({});

  const isLoaded = useRef(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      const merged = { ...DEFAULT_INPUTS, ...persisted.inputs };
      setInputs(merged);
      if (persisted.results) setResults(persisted.results);
      if (persisted.macroSplit) setMacroSplit(persisted.macroSplit);
      onDirtyChange?.(hasMeasurements(merged));
    }
    isLoaded.current = true;
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on any change (skipping the initial hydrate).
  useEffect(() => {
    if (!isLoaded.current) return;
    const state: PersistedState = { inputs, results, macroSplit };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [inputs, results, macroSplit]);

  const setField = <K extends keyof CalculatorInputs>(field: K, value: CalculatorInputs[K]) => {
    const next = { ...inputs, [field]: value };
    setInputs(next);
    onDirtyChange?.(hasMeasurements(next));

    // Clear a field's error as soon as the user edits it.
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const cleared = { ...prev };
      delete cleared[field as NumericField];
      return cleared;
    });
  };

  /** Validate then compute. Returns `true` on success (results updated). */
  const calculate = (): boolean => {
    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setResults(null);
      return false;
    }
    setResults(calculateResults(inputs));
    return true;
  };

  const macros = results ? calculateMacros(results.calories, macroSplit) : null;

  return {
    inputs,
    setField,
    errors,
    results,
    macros,
    macroSplit,
    setMacroSplit,
    calculate,
    /** Clear the unsaved-changes flag (e.g. after exporting the report). */
    markSaved: () => onDirtyChange?.(false),
  };
}
