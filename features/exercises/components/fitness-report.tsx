"use client";

import { forwardRef, memo } from "react";
import type { CalculatorInputs, CalculatorResults, Macros } from "../types";

export interface FitnessReportData extends CalculatorInputs {
  results: CalculatorResults;
  macros: Macros;
}

interface FitnessReportProps {
  data: FitnessReportData;
  isRtl: boolean;
  t: (key: string) => string;
}

const C = {
  primary: "#22C55E",
  dark: "#111827",
  gray: "#6B7280",
  line: "#E5E7EB",
  accent: "#3B82F6",
  warning: "#F59E0B",
  danger: "#EF4444",
  soft: "#F9FAFB",
};

const APP_NAME = "GymSpot";
const LOGO_URL = "/images/Gymspot-logo.png";

// Helper to format numbers into Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) if isRtl is true
const formatNumber = (num: number | string, isRtl: boolean) => {
  const numStr = String(num);
  if (!isRtl) return numStr;
  const arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return numStr.replace(/[0-9]/g, (w) => arabicNums[+w]);
};

const fmtDate = (iso: string, isRtl: boolean) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(isRtl ? "ar-EG" : "en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const FitnessReportBase = forwardRef<HTMLDivElement, FitnessReportProps>(function FitnessReport(
  { data, isRtl, t },
  ref
) {
  const L = (en: string, ar: string) => (isRtl ? ar : en);
  const kg = L("kg", "كجم");
  const cm = L("cm", "سم");
  const align = isRtl ? "right" : "left";

  const { gender, weight, height, age, activity, goal, results, macros } = data;

  const getBmiColor = (cat: string) => {
    if (cat === "underweight") return C.accent;
    if (cat === "normal") return C.primary;
    if (cat === "overweight") return C.warning;
    return C.danger;
  };

  const adviceText =
    goal === "lose"
      ? L(
          "To achieve healthy fat loss, aim for a consistent daily deficit of 500 calories while prioritizing protein intake to preserve lean muscle tissue. Pair this nutrition strategy with at least 3-4 strength training sessions weekly and moderate cardiovascular activity.",
          "لتحقيق خسارة صحية للدهون، احرص على عجز يومي ثابت قدره 500 سعرة حرارية مع إعطاء الأولوية لتناول البروتين للحفاظ على الأنسجة العضلية الصافية. ادمج هذه الاستراتيجية مع 3-4 حصص تدريب مقاوة أسبوعياً وتمارين كارديو معتدلة."
        )
      : goal === "maintain"
      ? L(
          "To maintain your current body weight and optimize overall health, focus on balancing clean whole foods. Adjust calorie levels with changes in daily activity, and combine strength and metabolic conditioning programs to maintain energy level peaks.",
          "للحفاظ على وزن جسمك الحالي وتحسين الصحة العامة، ركز على موازنة الأطعمة الكاملة والنظيفة. اضبط مستويات السعرات الحرارية مع التغيرات في النشاط اليومي، وادمج بين برامج القوة والتكييف الأيضي للحفاظ على مستويات الطاقة."
        )
      : L(
          "To build clean lean muscle mass, support your heavy strength workouts with a mild caloric surplus of 500 calories daily. Maintain higher protein ratios to fuel muscle repair, and limit high-intensity cardio exercises to preserve calories.",
          "لبناء كتلة عضلية صافية ونظيفة، ادعم تمارين القوة الثقيلة بفائض سعرات حرارية معتدل قدره 500 سعرة حرارية يومياً. حافظ على نسب بروتين أعلى لتغذية استشفاء العضلات، وحد من تمارين الكارديو عالية الكثافة للحفاظ على السعرات."
        );

  return (
    <div
      ref={ref}
      dir={isRtl ? "rtl" : "ltr"}
      style={{
        boxSizing: "border-box",
        width: 794,
        background: "#fff",
        color: C.dark,
        padding: 40,
        textAlign: align,
      }}
    >
      {/* Header — brand always pinned left, even in RTL */}
      <div
        style={{
          display: "flex",
          direction: "ltr",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: 10,
          marginBottom: 26,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} width={34} height={34} alt="GymSpot" style={{ borderRadius: 8 }} />
        <span style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>{APP_NAME}</span>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 25 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: C.dark, margin: 0 }}>
          {L("Fitness Assessment Report", "تقرير تقييم اللياقة البدنية")}
        </h2>
        <div style={{ fontSize: 12, color: C.gray, marginTop: 4 }}>
          {L("Generated", "تاريخ الإنشاء")}: {fmtDate(new Date().toISOString(), isRtl)}
        </div>
      </div>

      {/* Grid of Input Metrics - Structured using explicit rows to prevent overlaps */}
      <h3 style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 10, textTransform: "uppercase" }}>
        {L("1. Input Profile", "1. البيانات المدخلة")}
      </h3>
      <div
        style={{
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: 16,
          background: C.soft,
          marginBottom: 25,
        }}
      >
        {/* Row 1: Gender, Weight, Height */}
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("gender")}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginTop: 3 }}>{t(gender)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("weight")}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginTop: 3 }}>
              {formatNumber(weight, isRtl)} {kg}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("height")}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginTop: 3 }}>
              {formatNumber(height, isRtl)} {cm}
            </div>
          </div>
        </div>

        {/* Row 2: Age, Activity Level, Goal */}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("age")}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginTop: 3 }}>
              {formatNumber(age, isRtl)} {L("years", "سنة")}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("activityLevel")}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginTop: 3, lineHeight: "1.4" }}>
              {t(activity)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("goal")}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark, marginTop: 3 }}>{t(goal)}</div>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <h3 style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 10, textTransform: "uppercase" }}>
        {L("2. Energy & BMI Summary", "2. خلاصة مؤشر الجسم والطاقة")}
      </h3>
      <div style={{ display: "flex", gap: 16, marginBottom: 25 }}>
        {/* BMI Card */}
        <div
          style={{
            flex: 1,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: 16,
            background: C.soft,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("bmiLabel")}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: getBmiColor(results.bmiCategory), marginTop: 4 }}>
            {formatNumber(results.bmi, isRtl)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, marginTop: 4 }}>
            {t("bmiCategory")}: <span style={{ color: getBmiColor(results.bmiCategory), fontWeight: 800 }}>{t(`bmiRanges.${results.bmiCategory}`)}</span>
          </div>
        </div>

        {/* Calorie Target Card */}
        <div
          style={{
            flex: 1,
            border: `1px solid ${C.primary}30`,
            borderRadius: 12,
            padding: 16,
            background: `${C.primary}05`,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: C.primary, textTransform: "uppercase" }}>{t("targetCalories")}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.primary, marginTop: 4 }}>
            {formatNumber(results.calories, isRtl)} <span style={{ fontSize: 13, fontWeight: 500, color: C.gray }}>kcal</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, marginTop: 4 }}>
            {t("bmrLabel").split(" (")[0]}: {formatNumber(results.bmr, isRtl)} | {t("tdeeLabel").split(" (")[0]}: {formatNumber(results.tdee, isRtl)}
          </div>
        </div>
      </div>

      {/* Grid of Macros */}
      <h3 style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 10, textTransform: "uppercase" }}>
        {t("macrosTitle")}
      </h3>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 25,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: 16,
          background: C.soft,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("protein")}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.primary, marginTop: 4 }}>{formatNumber(macros.protein, isRtl)} g</div>
          <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>
            {formatNumber(Math.round(macros.pPct * 100), isRtl)}% split
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("carbs")}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, marginTop: 4 }}>{formatNumber(macros.carbs, isRtl)} g</div>
          <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>
            {formatNumber(Math.round(macros.cPct * 100), isRtl)}% split
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gray, textTransform: "uppercase" }}>{t("fat")}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.warning, marginTop: 4 }}>{formatNumber(macros.fat, isRtl)} g</div>
          <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>
            {formatNumber(Math.round(macros.fPct * 100), isRtl)}% split
          </div>
        </div>
      </div>

      {/* Advice section */}
      <h3 style={{ fontSize: 14, fontWeight: 800, color: C.dark, marginBottom: 10, textTransform: "uppercase" }}>
        {L("4. Fitness Advice & Guidelines", "4. نصائح اللياقة البدنية والتعليمات")}
      </h3>
      <div
        style={{
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: 16,
          fontSize: 12,
          lineHeight: "1.6",
          color: C.dark,
          background: C.soft,
        }}
      >
        {formatNumber(adviceText, isRtl)}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${C.line}`,
          marginTop: 40,
          paddingTop: 15,
          fontSize: 9,
          color: C.gray,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>GymSpot Fitness Tracker © {formatNumber(2026, isRtl)}</span>
        <span>{L("Assessment Report", "تقرير تقييم اللياقة")}</span>
      </div>
    </div>
  );
});

export const FitnessReport = memo(FitnessReportBase);
