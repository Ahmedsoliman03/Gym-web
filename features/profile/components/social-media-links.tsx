"use client";

import {
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Send,
  Twitch,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
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

const SOCIAL_ICON_RULES: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["youtube", "youtu.be"], icon: Youtube },
  { keywords: ["instagram", "instagr.am"], icon: Instagram },
  { keywords: ["facebook", "fb.com", "fb.me"], icon: Facebook },
  { keywords: ["twitter", "x.com"], icon: Twitter },
  { keywords: ["linkedin", "lnkd.in"], icon: Linkedin },
  { keywords: ["twitch"], icon: Twitch },
  { keywords: ["tiktok"], icon: Music2 },
  { keywords: ["telegram", "t.me"], icon: Send },
  { keywords: ["whatsapp", "wa.me"], icon: MessageCircle },
  { keywords: ["mailto:"], icon: Mail },
];

const getSocialIcon = (url: string, platform: string): LucideIcon => {
  const haystack = `${url} ${platform}`.toLowerCase();
  const match = SOCIAL_ICON_RULES.find((rule) =>
    rule.keywords.some((keyword) => haystack.includes(keyword)),
  );
  return match?.icon ?? ExternalLink;
};

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
          {visibleLinks.map((link, index) => {
            const Icon = getSocialIcon(link.url, link.platform);
            return (
              <a
                key={`${link.platform}-${index}`}
                href={externalHref(link.url.trim())}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Icon size={16} />
                {link.platform.trim()}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
