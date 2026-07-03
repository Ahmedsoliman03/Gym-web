"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { ExerciseExplorer } from "@/features/exercises/components/exercise-explorer";
import { CalorieBmiCalculator } from "@/features/exercises/components/calorie-bmi-calculator";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

const styles = {
  container: "pt-20 sm:pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto",
  tabRow: "flex items-center justify-center gap-2 mb-10 bg-surface/40 p-1.5 border border-white/5 rounded-2xl max-w-md mx-auto backdrop-blur-xl",
  tabBtn: "flex-1 text-center py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
  tabActive: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-black",
  tabIdle: "text-foreground/60 hover:text-foreground hover:bg-white/[0.02]",
};

export default function ExercisesPage() {
  const t = useTranslations("Exercises");
  const tCalc = useTranslations("Calculator");
  const [activeTab, setActiveTab] = useState<"explorer" | "calculator">("explorer");

  // Restore the saved tab AFTER mount so the server and first client render
  // agree (reading localStorage during render causes a hydration mismatch).
  useEffect(() => {
    const savedTab = localStorage.getItem("gymspot_exercises_active_tab");
    if (savedTab === "explorer" || savedTab === "calculator") {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: "explorer" | "calculator") => {
    setActiveTab(tab);
    localStorage.setItem("gymspot_exercises_active_tab", tab);
  };
  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChangesWarning(isDirty);

  return (
    <div className={styles.container}>
      <PageHeader
        title={activeTab === "explorer" ? t("title") : tCalc("title")}
        highlight={activeTab === "explorer" ? t("highlight") : ""}
        description={activeTab === "explorer" ? t("description") : tCalc("desc")}
      />

      {/* Tabs */}
      <div className={styles.tabRow}>
        <button
          type="button"
          onClick={() => handleTabChange("explorer")}
          className={`${styles.tabBtn} ${activeTab === "explorer" ? styles.tabActive : styles.tabIdle}`}
        >
          {t("title")}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("calculator")}
          className={`${styles.tabBtn} ${activeTab === "calculator" ? styles.tabActive : styles.tabIdle}`}
        >
          {tCalc("title")}
        </button>
      </div>

      {/* Content */}
      <div className={activeTab === "explorer" ? "" : "hidden"}>
        <ExerciseExplorer />
      </div>
      <div className={activeTab === "calculator" ? "" : "hidden"}>
        <CalorieBmiCalculator onDirtyChange={setIsDirty} />
      </div>
    </div>
  );
}
