"use client";

import { useTranslations } from "next-intl";

const styles = {
  container: "bg-surface py-4 px-6 rounded-3xl border border-white/5 w-full",
  wrapper: "flex flex-col md:flex-row md:items-center gap-4 md:gap-8",
  header: "shrink-0",
  title: "text-xs font-bold text-foreground uppercase text-primary/60",
  divider: "h-0.5 w-8 bg-primary/20 mt-1 rounded-full",
  description: "text-foreground/80 leading-relaxed text-sm md:text-base italic font-light border-l-0 md:border-l border-white/10 md:pl-8"
};

interface CoachPhilosophyProps {
  title: string;
  description: string;
}

export const CoachPhilosophy = ({ title, description }: CoachPhilosophyProps) => {
  const t = useTranslations("Profile");

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
            <h2 className={styles.title}>
                {title.toLowerCase().includes('philosophy') ? t('philosophy') : title}
            </h2>
            <div className={styles.divider} />
        </div>
        <p className={styles.description}>
          "{description}"
        </p>
      </div>
    </div>
  );
};
