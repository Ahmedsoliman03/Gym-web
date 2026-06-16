"use client";

import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptySection } from "@/components/shared/empty-section";
import type { SocialMediaLink } from "../types";

interface SocialMediaLinksProps {
  links?: SocialMediaLink[];
  isOwner?: boolean;
}

const styles = {
  card: "bg-surface p-8 rounded-3xl border border-white/5",
  title: "text-xl font-bold mb-4 text-primary uppercase",
  grid: "flex flex-wrap gap-3",
  link:
    "inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-foreground/75 hover:border-primary/40 hover:text-primary transition-colors",
};

const externalHref = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

export const SocialMediaLinks = ({ links = [], isOwner = false }: SocialMediaLinksProps) => {
  const t = useTranslations("Profile");
  const visibleLinks = links.filter((link) => link.platform.trim() && link.url.trim());

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{t("socialMedia")}</h2>
      {visibleLinks.length === 0 ? (
        <EmptySection
          isOwner={isOwner}
          visitorMessage={t("noSocialLinksYet")}
          ownerMessage={t("addSocialLinksPrompt")}
          variant="compact"
        />
      ) : (
        <div className={styles.grid}>
          {visibleLinks.map((link, index) => (
            <a
              key={`${link.platform}-${index}`}
              href={externalHref(link.url.trim())}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <ExternalLink size={16} />
              {link.platform.trim()}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
