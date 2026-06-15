"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { formStyles as styles } from "@/components/shared/form-styles";
import type { SocialMediaLink } from "../types";

interface SocialMediaEditorProps {
  links: SocialMediaLink[];
  onChange: (links: SocialMediaLink[]) => void;
}

const emptyLink = (): SocialMediaLink => ({ platform: "", url: "" });

export const hasIncompleteSocialLinks = (links: SocialMediaLink[]) =>
  links.some((link) => {
    const hasPlatform = link.platform.trim().length > 0;
    const hasUrl = link.url.trim().length > 0;
    return hasPlatform !== hasUrl;
  });

export const SocialMediaEditor = ({ links, onChange }: SocialMediaEditorProps) => {
  const t = useTranslations("Profile");

  const updateLink = (index: number, field: keyof SocialMediaLink, value: string) => {
    onChange(
      links.map((link, currentIndex) =>
        currentIndex === index ? { ...link, [field]: value } : link,
      ),
    );
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className={styles.dividerSection}>
      <div className="flex items-center justify-between gap-4">
        <h2 className={styles.sectionTitle}>{t("socialMedia")}</h2>
        <button
          type="button"
          onClick={() => onChange([...links, emptyLink()])}
          className={styles.addBtn}
        >
          <Plus size={14} />
          {t("addNew")}
        </button>
      </div>

      <div className="space-y-3">
        {links.length === 0 ? (
          <button
            type="button"
            onClick={() => onChange([emptyLink()])}
            className="w-full min-h-24 rounded-2xl border border-dashed border-white/10 bg-white/5 text-foreground/45 text-xs font-black uppercase tracking-wider hover:border-primary/30 hover:text-primary transition-colors"
          >
            {t("addSocialLink")}
          </button>
        ) : (
          links.map((link, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_44px] gap-3 items-end rounded-2xl border border-white/5 bg-white/[0.03] p-4"
            >
              <div className={styles.inputWrapper}>
                <label className={styles.label}>{t("socialPlatform")}</label>
                <input
                  type="text"
                  value={link.platform}
                  onChange={(event) => updateLink(index, "platform", event.target.value)}
                  placeholder={t("socialPlatformPlaceholder")}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>{t("socialUrl")}</label>
                <div className="relative">
                  <ExternalLink
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(event) => updateLink(index, "url", event.target.value)}
                    placeholder={t("socialUrlPlaceholder")}
                    className={`${styles.input} w-full pl-11`}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeLink(index)}
                aria-label={t("removeSocialLink")}
                className="h-12 w-12 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15 flex items-center justify-center transition-colors"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
