"use client";

import { Instagram, Linkedin, Facebook, Phone as WhatsApp } from "lucide-react";
import { useTranslations } from "next-intl";

const styles = {
  container: "bg-surface p-8 rounded-3xl border border-white/5 flex-1 space-y-4",
  title: "text-base font-bold text-foreground mb-4 uppercase text-primary",
  whatsappBtn: "w-full bg-transparent outline-2 outline-primary text-white text-sm font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#25D366]/10",
  socialsWrapper: "flex items-center gap-3",
  socialBtn: (color: string) => `w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-foreground/60 transition-all ${color}`
};

interface CoachContactProps {
  coachName: string;
}

export const CoachContact = ({ coachName }: CoachContactProps) => {
  const t = useTranslations("Profile");

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {t('directContact')}
      </h2>

      <button className={styles.whatsappBtn}>
        <WhatsApp size={22} />
        {t('whatsapp')} {coachName.split(' ')[0]}
      </button>

      <div className={styles.socialsWrapper}>
        {[
          { icon: Instagram, color: "hover:bg-pink-500/10 hover:text-pink-500" },
          { icon: Linkedin, color: "hover:bg-blue-500/10 hover:text-blue-500" },
          { icon: Facebook, color: "hover:bg-blue-600/10 hover:text-blue-600" },
        ].map((item, index) => (
          <button
            key={index}
            className={styles.socialBtn(item.color)}
          >
            <item.icon size={20} />
          </button>
        ))}
      </div>
    </div>
  );
};
