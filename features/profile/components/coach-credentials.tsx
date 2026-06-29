"use client";

import { useTranslations } from "next-intl";
import { SPECIALIZATIONS } from "@/constants/specializations";
import { EmptySection } from "@/components/shared/empty-section";
import type { CoachCredentialsProps } from "../types";

const styles = {
  container: "bg-surface p-8 rounded-3xl border border-white/5 flex-1 min-w-[300px]",
  section: "w-full",
  title: "text-base font-bold text-foreground mb-4 flex items-center gap-2 uppercase text-primary",
  list: "space-y-3",
  listItem: "flex items-center gap-3 text-foreground/80",
  listIcon: "text-primary shrink-0",
  tagsWrapper: "flex flex-wrap gap-2",
  tag: "bg-primary/10 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg border border-primary/20",
};

export const CoachCredentials = ({
  specializations,
  isOwner,
}: CoachCredentialsProps) => {
  const t = useTranslations("Profile");
  const t_root = useTranslations();

  const translated = specializations.map((spec) => {
    const match = SPECIALIZATIONS.find((s) => s.value === spec);
    return match ? t_root(match.label as any) : spec;
  });

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.title}>{t("specializations")}</h2>
        {translated.length === 0 ? (
          <EmptySection
            isOwner={isOwner}
            visitorMessage={t("noSpecializationsYet")}
            variant="compact"
          />
        ) : (
          <div className={styles.tagsWrapper}>
            {translated.map((spec, index) => (
              <span key={index} className={styles.tag}>
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
