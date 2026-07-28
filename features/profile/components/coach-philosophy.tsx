"use client";

import { useTranslations } from "next-intl";
import { EmptySection } from "@/components/shared/empty-section";
import type { CoachPhilosophyProps } from "../types";
import { useTextTranslation } from "@/hooks/use-text-translation";

const styles = {
  container: "bg-surface py-4 px-6 rounded-3xl border border-white/5 w-full overflow-hidden",
  wrapper: "flex flex-col md:flex-row md:items-start gap-4 md:gap-8 min-w-0",
  header: "shrink-0",
  title: "text-xs font-bold text-foreground uppercase text-primary/60",
  divider: "h-0.5 w-8 bg-primary/20 mt-1 rounded-full",
  description: "min-w-0 flex-1 text-foreground/80 leading-relaxed text-sm md:text-base font-light border-l-0 md:border-l border-white/10 md:pl-8 break-words whitespace-pre-wrap"
};

export const CoachPhilosophy = ({
  description,
  onGoToPlans,
  isOwner,
}: CoachPhilosophyProps) => {
  const t = useTranslations("Profile");
  const hasDescription = !!description?.trim();
  const {
    displayedText,
    isTranslating,
    toggleTranslation,
    buttonLabel,
  } = useTextTranslation(description);

  return (
    <div className={styles.container}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={styles.title}>{t('aboutMe')}</h2>
        {onGoToPlans && (
          <button
            onClick={onGoToPlans}
            className="text-primary hover:text-primary/80 font-bold text-sm transition-all flex items-center gap-1 group"
          >
            {t('goToPlans')}
          </button>
        )}
      </div>
      {hasDescription ? (
        <div className={styles.wrapper}>
          <p className={styles.description}>
            &quot;{displayedText}&quot;
          </p>
          <button
            type="button"
            onClick={toggleTranslation}
            disabled={isTranslating}
            className="shrink-0 text-primary/80 text-xs font-bold hover:text-primary hover:underline disabled:opacity-50"
          >
            {buttonLabel}
          </button>
        </div>
      ) : (
        <EmptySection
          isOwner={isOwner}
          visitorMessage={t('noAboutYet')}
          variant="compact"
        />
      )}
    </div>
  );
};
