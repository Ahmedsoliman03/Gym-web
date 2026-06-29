"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Dumbbell, Target, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { BodyMap } from "./body-map";
import { ExerciseModal, type ExerciseDetail } from "./exercise-modal";
import { muscleIdsByView, type BodyView } from "../data";

type Exercise = ExerciseDetail;

const styles = {
  layout: "grid lg:grid-cols-2 gap-6 sm:gap-8 items-start",
  stage: "bg-surface/50 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl",
  toggleRow: "flex items-center justify-center gap-2 mb-6",
  toggleBtn: "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border",
  toggleActive: "bg-primary/15 border-primary/40 text-primary",
  toggleIdle: "bg-white/5 border-white/10 text-foreground/50 hover:text-foreground",
  hint: "text-center text-foreground/40 text-xs font-bold uppercase tracking-widest mt-4",
  chipsRow: "flex flex-wrap justify-center gap-2 mt-6",
  chip: "px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide border transition-all",
  chipActive: "bg-primary/15 border-primary/40 text-primary",
  chipIdle: "bg-white/5 border-white/10 text-foreground/50 hover:border-primary/30 hover:text-foreground",

  panel: "bg-surface/50 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl min-h-[420px] flex flex-col",
  panelHeader: "flex items-center gap-3 mb-1",
  panelIcon: "w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0",
  panelTitle: "text-2xl font-black uppercase leading-none",
  panelSub: "text-foreground/50 text-sm font-bold mt-2 mb-6",
  list: "flex flex-col gap-3",
  card: "group w-full text-start bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-primary/30 hover:bg-white/[0.05] transition-all cursor-pointer",
  cardTop: "flex items-center justify-between gap-3",
  cardName: "font-black uppercase text-sm tracking-wide",
  cardSets: "text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1 whitespace-nowrap",
  cardTip: "text-foreground/50 text-xs font-medium mt-2 leading-relaxed",
  cardMore: "flex items-center gap-1 mt-3 text-[10px] font-black uppercase tracking-widest text-primary/70 group-hover:text-primary transition-colors",

  empty: "flex-1 flex flex-col items-center justify-center text-center gap-4 py-10",
  emptyIcon: "w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground/30",
  emptyText: "text-foreground/40 font-bold max-w-xs",

  cta: "mt-6 pt-6 border-t border-white/5",
  ctaCard: "group flex items-center justify-between gap-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 hover:bg-primary/15 transition-all",
  ctaText: "flex flex-col",
  ctaTitle: "font-black uppercase text-sm text-primary",
  ctaDesc: "text-foreground/50 text-xs font-bold",
  ctaArrow: "text-primary shrink-0 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform",
};

export function ExerciseExplorer() {
  const t = useTranslations("Exercises");
  const [view, setView] = useState<BodyView>("front");
  const [selected, setSelected] = useState<string | null>("chest");
  const [openExercise, setOpenExercise] = useState<Exercise | null>(null);

  // Stable identity so the memoized <BodyMap> doesn't re-render needlessly.
  const labelFor = useCallback((id: string) => t(`muscles.${id}.name`), [t]);

  const handleView = useCallback((next: BodyView) => {
    setView(next);
    setSelected(muscleIdsByView[next][0] ?? null);
  }, []);

  // Only re-read translations when the selected muscle changes.
  const exercises = useMemo<Exercise[]>(
    () => (selected ? (t.raw(`muscles.${selected}.exercises`) as Exercise[]) : []),
    [selected, t],
  );

  return (
    <div className={styles.layout}>
      {/* Left: interactive body */}
      <div className={styles.stage}>
        <div className={styles.toggleRow}>
          {(["front", "back"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleView(v)}
              className={`${styles.toggleBtn} ${view === v ? styles.toggleActive : styles.toggleIdle}`}
            >
              {t(`view.${v}`)}
            </button>
          ))}
        </div>

        <BodyMap view={view} selected={selected} onSelect={setSelected} labelFor={labelFor} />

        <p className={styles.hint}>{t("hint")}</p>

        {/* Accessible muscle chips (also helps on touch) */}
        <div className={styles.chipsRow}>
          {muscleIdsByView[view].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`${styles.chip} ${selected === id ? styles.chipActive : styles.chipIdle}`}
            >
              {t(`muscles.${id}.name`)}
            </button>
          ))}
        </div>
      </div>

      {/* Right: exercises panel */}
      <div className={styles.panel}>
        {selected ? (
          <>
            <div className={styles.panelHeader}>
              <div className={styles.panelIcon}>
                <Target size={22} />
              </div>
              <h2 className={styles.panelTitle}>{t(`muscles.${selected}.name`)}</h2>
            </div>
            <p className={styles.panelSub}>{t(`muscles.${selected}.focus`)}</p>

            <div className={styles.list}>
              {exercises.map((ex, i) => (
                <button key={i} type="button" className={styles.card} onClick={() => setOpenExercise(ex)}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.cardName}>{ex.name}</h3>
                    <span className={styles.cardSets}>{ex.sets}</span>
                  </div>
                  <p className={styles.cardTip}>{ex.tip}</p>
                  <span className={styles.cardMore}>
                    {t("modal.howTo")}
                    <ChevronRight size={13} className="rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                  </span>
                </button>
              ))}
            </div>

            <div className={styles.cta}>
              <Link href="/coaches" className={styles.ctaCard}>
                <div className={styles.ctaText}>
                  <span className={styles.ctaTitle}>{t("ctaTitle")}</span>
                  <span className={styles.ctaDesc}>{t("ctaDesc")}</span>
                </div>
                <ArrowRight size={20} className={styles.ctaArrow} />
              </Link>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Dumbbell size={28} />
            </div>
            <p className={styles.emptyText}>{t("emptyState")}</p>
          </div>
        )}
      </div>

      <ExerciseModal exercise={openExercise} onClose={() => setOpenExercise(null)} />
    </div>
  );
}
