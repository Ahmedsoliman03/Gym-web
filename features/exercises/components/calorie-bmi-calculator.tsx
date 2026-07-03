"use client";

import { useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calculator, Target, Activity, Flame, Sparkles, Download } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { usePdfExport } from "@/hooks/use-pdf-export";
import { AGE_MAX } from "../fitness-math";
import { useCalorieCalculator } from "../hooks/use-calorie-calculator";
import type { ActivityLevel, FieldErrorCode, Gender, Goal } from "../types";
import { FitnessReport } from "./fitness-report";

const styles = {
  layout: "grid lg:grid-cols-5 gap-6 sm:gap-8 items-start",
  formPanel: "lg:col-span-2 bg-surface/50 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col gap-5",
  resultsPanel: "lg:col-span-3 bg-surface/50 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl min-h-[420px] flex flex-col gap-6",

  label: "block text-xs font-black uppercase tracking-widest text-foreground/50 mb-2",
  inputBase: "w-full bg-[#0D121F] border text-foreground px-4 py-3 rounded-xl outline-none transition-all text-sm font-bold",
  inputIdle: "border-white/5 focus:border-primary/50",
  inputInvalid: "border-red-500/70 focus:border-red-500",
  error: "text-red-500 text-[10px] mt-1.5 px-1 font-black uppercase tracking-wider",
  btn: "w-full bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs py-4 px-6 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4",

  genderRow: "grid grid-cols-2 gap-3",
  genderBtn: "py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
  genderActive: "bg-primary/10 border-primary/40 text-primary",
  genderIdle: "bg-[#0D121F] border-white/5 text-foreground/50 hover:text-foreground",

  metricCard: "bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4",
  metricIcon: "w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0",
  metricTitle: "text-2xl font-black text-white",
  metricLabel: "text-[10px] text-foreground/40 uppercase font-black tracking-widest",

  bmiGauge: "h-2 w-full bg-white/10 rounded-full overflow-hidden mt-2 relative",
  bmiIndicator: "h-full bg-primary transition-all duration-500",

  macroSelector: "flex gap-2 p-1 bg-[#0D121F] border border-white/5 rounded-xl mb-4 overflow-x-auto",
  macroTab: "flex-1 text-center py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all",
  macroTabActive: "bg-primary/15 text-primary border border-primary/25",
  macroTabIdle: "text-foreground/50 hover:text-foreground",

  macroProgressRow: "flex flex-col gap-2 mt-3",
  macroBar: "h-2 bg-white/5 rounded-full overflow-hidden w-full relative",
  macroFill: "h-full rounded-full transition-all duration-500",
  macroDetails: "flex justify-between items-center text-xs font-bold",

  infoBox: "bg-primary/5 border border-primary/10 rounded-2xl p-4 text-xs leading-relaxed text-foreground/80 flex gap-3 items-start",
  infoIcon: "text-primary shrink-0 mt-0.5",
};

const BMI_GAUGE_COLORS = {
  underweight: "#60A5FA",
  normal: "#22C55E",
  overweight: "#F59E0B",
  obese: "#EF4444",
} as const;

const ACTIVITY_VALUES: readonly ActivityLevel[] = ["sedentary", "light", "moderate", "active", "veryActive"];
const GOAL_VALUES: readonly Goal[] = ["lose", "maintain", "gain"];
const MACRO_VALUES = ["balanced", "highProtein", "lowCarb"] as const;

interface CalorieBmiCalculatorProps {
  onDirtyChange?: (isDirty: boolean) => void;
}

export function CalorieBmiCalculator({ onDirtyChange }: CalorieBmiCalculatorProps) {
  const t = useTranslations("Calculator");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const reportRef = useRef<HTMLDivElement>(null);
  const { exportToPdf } = usePdfExport();

  const {
    inputs,
    setField,
    errors,
    results,
    macros,
    macroSplit,
    setMacroSplit,
    calculate,
    markSaved,
  } = useCalorieCalculator(onDirtyChange);

  const errorText = (code?: FieldErrorCode) => (code ? t(`errors.${code}`) : "");

  const inputClass = (hasError: boolean) =>
    `${styles.inputBase} ${hasError ? styles.inputInvalid : styles.inputIdle}`;

  const activityOptions = ACTIVITY_VALUES.map((value) => ({ value, label: t(value) }));
  const goalOptions = GOAL_VALUES.map((value) => ({ value, label: t(value) }));

  const downloadPdfReport = () => {
    void exportToPdf(reportRef, {
      fileName: `gymspot-assessment-${locale}.pdf`,
      scale: 2,
    });
    markSaved();
  };

  return (
    <div className={styles.layout}>
      {/* Left Input Form */}
      <div className={styles.formPanel}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Calculator size={18} />
          </div>
          <h2 className="text-lg font-black uppercase text-white leading-none">{t("title")}</h2>
        </div>

        {/* Gender Selection */}
        <div>
          <span className={styles.label}>{t("gender")}</span>
          <div className={styles.genderRow}>
            {(["male", "female"] as const).map((g: Gender) => (
              <button
                key={g}
                type="button"
                onClick={() => setField("gender", g)}
                className={`${styles.genderBtn} ${inputs.gender === g ? styles.genderActive : styles.genderIdle}`}
              >
                {t(g)}
              </button>
            ))}
          </div>
        </div>

        {/* Weight & Height Input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={styles.label} htmlFor="calc-weight">{t("weight")}</label>
            <input
              id="calc-weight"
              type="number"
              min={0}
              value={inputs.weight}
              onChange={(e) => setField("weight", e.target.value)}
              className={inputClass(!!errors.weight)}
              placeholder="e.g. 70"
              aria-invalid={!!errors.weight}
              aria-describedby={errors.weight ? "calc-weight-error" : undefined}
            />
            {errors.weight && (
              <p id="calc-weight-error" className={styles.error}>{errorText(errors.weight)}</p>
            )}
          </div>
          <div>
            <label className={styles.label} htmlFor="calc-height">{t("height")}</label>
            <input
              id="calc-height"
              type="number"
              min={0}
              value={inputs.height}
              onChange={(e) => setField("height", e.target.value)}
              className={inputClass(!!errors.height)}
              placeholder="e.g. 175"
              aria-invalid={!!errors.height}
              aria-describedby={errors.height ? "calc-height-error" : undefined}
            />
            {errors.height && (
              <p id="calc-height-error" className={styles.error}>{errorText(errors.height)}</p>
            )}
          </div>
        </div>

        {/* Age Input */}
        <div>
          <label className={styles.label} htmlFor="calc-age">{t("age")}</label>
          <input
            id="calc-age"
            type="number"
            min={0}
            max={AGE_MAX}
            value={inputs.age}
            onChange={(e) => setField("age", e.target.value)}
            className={inputClass(!!errors.age)}
            placeholder="e.g. 25"
            aria-invalid={!!errors.age}
            aria-describedby={errors.age ? "calc-age-error" : undefined}
          />
          {errors.age && (
            <p id="calc-age-error" className={styles.error}>{errorText(errors.age)}</p>
          )}
        </div>

        {/* Activity Level Selector */}
        <div>
          <span className={styles.label}>{t("activityLevel")}</span>
          <CustomSelect
            value={inputs.activity}
            onChange={(value) => setField("activity", value as ActivityLevel)}
            options={activityOptions}
            placeholder={t("activityLevel")}
            aria-label={t("activityLevel")}
          />
        </div>

        {/* Fitness Goal Selector */}
        <div>
          <span className={styles.label}>{t("goal")}</span>
          <CustomSelect
            value={inputs.goal}
            onChange={(value) => setField("goal", value as Goal)}
            options={goalOptions}
            placeholder={t("goal")}
            aria-label={t("goal")}
          />
        </div>

        <button type="button" onClick={calculate} className={styles.btn}>
          <Sparkles size={16} />
          {t("calculate")}
        </button>
      </div>

      {/* Right Output Panel */}
      <div className={styles.resultsPanel}>
        {results && macros ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Target size={18} />
              </div>
              <h2 className="text-lg font-black uppercase text-white leading-none">{t("resultsTitle")}</h2>
            </div>

            {/* Results Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* BMI Card */}
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>
                  <Activity size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={styles.metricLabel}>{t("bmiLabel")}</span>
                  <h3 className={styles.metricTitle}>{results.bmi}</h3>
                  <div className="text-[10px] font-bold text-foreground/50 uppercase">
                    {t("bmiCategory")}: <span className="text-primary">{t(`bmiRanges.${results.bmiCategory}`)}</span>
                  </div>
                  {/* Gauge */}
                  <div className={styles.bmiGauge}>
                    <div
                      className={styles.bmiIndicator}
                      style={{
                        width: `${Math.min(100, Math.max(10, ((results.bmi - 15) / 25) * 100))}%`,
                        backgroundColor: BMI_GAUGE_COLORS[results.bmiCategory],
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Calories Card */}
              <div className={`${styles.metricCard} border-primary/25 bg-primary/5`}>
                <div className={styles.metricIcon}>
                  <Flame size={20} />
                </div>
                <div>
                  <span className={styles.metricLabel}>{t("targetCalories")}</span>
                  <h3 className="text-3xl font-black text-primary">{results.calories} <span className="text-xs text-foreground/50 font-normal">kcal</span></h3>
                  <span className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">
                    {t("tdeeLabel")}: {results.tdee} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className={styles.infoBox}>
              <Sparkles size={16} className={styles.infoIcon} />
              <p>
                {t("recommendationText", {
                  bmi: results.bmi,
                  category: t(`bmiRanges.${results.bmiCategory}`),
                  goalName: t(inputs.goal).toLowerCase(),
                  calories: results.calories,
                })}
              </p>
            </div>

            {/* Macronutrients Section */}
            <div className="mt-2 border-t border-white/5 pt-6">
              <span className={styles.label}>{t("macrosTitle")}</span>

              {/* Macro Tab Selector */}
              <div className={styles.macroSelector}>
                {MACRO_VALUES.map((split) => (
                  <button
                    key={split}
                    type="button"
                    onClick={() => setMacroSplit(split)}
                    className={`${styles.macroTab} ${macroSplit === split ? styles.macroTabActive : styles.macroTabIdle}`}
                  >
                    {t(split).split(" (")[0]}
                  </button>
                ))}
              </div>

              {/* Macros Breakdown Bars */}
              <div className="flex flex-col gap-4">
                <MacroBar label={t("protein")} grams={macros.protein} pct={macros.pPct} valueClass="text-primary" fillClass="bg-primary" />
                <MacroBar label={t("carbs")} grams={macros.carbs} pct={macros.cPct} valueClass="text-sky-400" fillClass="bg-sky-400" />
                <MacroBar label={t("fat")} grams={macros.fat} pct={macros.fPct} valueClass="text-amber-400" fillClass="bg-amber-400" />
              </div>
            </div>

            {/* Action Button */}
            <button type="button" onClick={downloadPdfReport} className={styles.btn}>
              <Download size={16} />
              {t("downloadReport")}
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground/30 animate-pulse">
              <Calculator size={28} />
            </div>
            <p className="text-foreground/40 font-bold max-w-xs uppercase text-xs tracking-wider">
              {t("desc")}
            </p>
          </div>
        )}
      </div>

      {results && macros && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: "-10000px",
            width: 794,
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <FitnessReport
            ref={reportRef}
            isRtl={isRtl}
            t={t}
            data={{ ...inputs, results, macros }}
          />
        </div>
      )}
    </div>
  );
}

interface MacroBarProps {
  label: string;
  grams: number;
  /** Fraction of total calories (0–1). */
  pct: number;
  valueClass: string;
  fillClass: string;
}

function MacroBar({ label, grams, pct, valueClass, fillClass }: MacroBarProps) {
  return (
    <div className={styles.macroProgressRow}>
      <div className={styles.macroDetails}>
        <span className="text-white uppercase font-black text-[11px] tracking-wider">{label}</span>
        <span className={`${valueClass} font-black`}>
          {grams}g <span className="text-foreground/40 font-bold">({Math.round(pct * 100)}%)</span>
        </span>
      </div>
      <div className={styles.macroBar}>
        <div className={`${styles.macroFill} ${fillClass}`} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}
