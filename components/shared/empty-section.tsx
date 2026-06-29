"use client";

import { Inbox, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

interface EmptySectionProps {
  /** Sentence shown to non-owners — e.g. `t('noPlansYet')`. */
  visitorMessage: string;
  ownerMessage?: string;
  isOwner?: boolean;
  variant?: "compact" | "default";
}

const styles = {
  base:
    "bg-surface/50 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center",
  pad: {
    default: "p-10 gap-3",
    compact: "p-6 gap-2",
  },
  iconWrap:
    "p-4 bg-white/5 rounded-full text-foreground/30",
  iconWrapOwner:
    "p-4 bg-primary/10 rounded-full text-primary border border-primary/20",
  text: "text-foreground/50 text-sm font-bold uppercase tracking-wider max-w-xs",
  ownerText: "text-foreground/70 text-sm font-bold max-w-sm",
  cta:
    "mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs hover:brightness-110 transition-all",
};

export const EmptySection = ({
  visitorMessage,
  ownerMessage,
  isOwner = false,
  variant = "default",
}: EmptySectionProps) => {
  const t = useTranslations("Profile");
  const padding = styles.pad[variant];

  if (isOwner) {
    return (
      <div className={`${styles.base} ${padding}`}>
        <div className={styles.iconWrapOwner}>
          <Pencil size={18} />
        </div>
        <p className={styles.ownerText}>
          {ownerMessage ?? t("improveProfilePrompt")}
        </p>
        <Link href="/profile/edit" className={styles.cta}>
          <Pencil size={14} />
          {t("editProfile")}
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.base} ${padding}`}>
      <div className={styles.iconWrap}>
        <Inbox size={18} />
      </div>
      <p className={styles.text}>{visitorMessage}</p>
    </div>
  );
};
