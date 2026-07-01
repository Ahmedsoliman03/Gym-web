"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Dumbbell, Flame, ListChecks, Target } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export interface ExerciseDetail {
  slug: string;
  name: string;
  tip: string;
  sets: string;
  description: string;
  failureTip: string;
  image?: string;
}

const styles = {
  imageWrap: "relative w-full aspect-video rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 mb-5",
  image: "object-contain p-2",
  placeholder: "absolute inset-0 flex flex-col items-center justify-center gap-3 text-foreground/30 bg-gradient-to-br from-primary/10 via-transparent to-transparent",
  placeholderText: "text-[11px] font-black uppercase tracking-widest",
  targetBadge: "absolute top-3 ltr:right-3 rtl:left-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-black/50 backdrop-blur border border-primary/30 rounded-full px-3 py-1.5 z-10",

  section: "mb-5",
  label: "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-foreground/40 mb-2",
  howTo: "text-foreground/80 text-sm leading-relaxed font-medium",

  failureBox: "rounded-2xl border border-primary/25 bg-primary/[0.07] p-4",
  failureLabel: "flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-2",
  failureText: "text-foreground/80 text-sm leading-relaxed font-medium",
};

interface ExerciseModalProps {
  exercise: ExerciseDetail | null;
  onClose: () => void;
}

export function ExerciseModal({ exercise, onClose }: ExerciseModalProps) {
  const t = useTranslations("Exercises");
  const [failedSlug, setFailedSlug] = useState<string | null>(null);

  if (!exercise) return null;

  const showImage = !!exercise.image && failedSlug !== exercise.slug;

  return (
    <Modal isOpen={!!exercise} onClose={onClose} title={exercise.name}>
      <div className={styles.imageWrap}>
        {showImage ? (
          <Image
            src={exercise.image!}
            alt={exercise.name}
            fill
            sizes="(max-width: 640px) 100vw, 480px"
            className={styles.image}
            onError={() => setFailedSlug(exercise.slug)}
          />
        ) : (
          <div className={styles.placeholder}>
            <Dumbbell size={36} />
            <span className={styles.placeholderText}>{t("modal.imageSoon")}</span>
          </div>
        )}
        <span className={styles.targetBadge}>
          <Target size={12} />
          {exercise.sets}
        </span>
      </div>

      <div className={styles.section}>
        <p className={styles.label}>
          <ListChecks size={14} />
          {t("modal.howTo")}
        </p>
        <p className={styles.howTo}>{exercise.description}</p>
      </div>

      <div className={styles.failureBox}>
        <p className={styles.failureLabel}>
          <Flame size={14} />
          {t("modal.toFailure")}
        </p>
        <p className={styles.failureText}>{exercise.failureTip}</p>
      </div>
    </Modal>
  );
}
