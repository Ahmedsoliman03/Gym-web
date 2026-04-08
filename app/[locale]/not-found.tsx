"use client"
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Home, MoveLeft } from "lucide-react";

/**
 * Styling object for the Not Found page
 * Adheres to the project's premium dark mode aesthetic
 */
const styles = {
  container: "min-h-[85vh] flex flex-col items-center justify-center p-6 text-center animate-premium-in relative overflow-hidden",
  glow: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-full max-h-[800px] bg-primary/5 blur-[120px] rounded-full -z-10",
  badge: "px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-black uppercase rounded-full mb-8",
  title: "text-[150px] md:text-[220px] font-black leading-none bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent mb-6 drop-shadow-2xl",
  content: "max-w-2xl mx-auto flex flex-col items-center",
  subtitle: "text-2xl md:text-4xl font-black mb-6 uppercase text-foreground/90",
  description: "text-foreground/40 max-w-lg mb-12 text-base md:text-lg leading-relaxed font-medium mx-auto px-4",
  actions: "flex flex-col sm:flex-row items-center gap-4",
  button: "bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center gap-3 group relative overflow-hidden",
  buttonGlow: "absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500",
  backLink: "text-foreground/40 hover:text-primary p-4 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2",
  buttonIcon: "group-hover:translate-x-0.5 transition-transform"
};

/**
 * Premium Not Found Page
 * Standardized 404 page with localized content and home redirect
 */
export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className={styles.container}>
      {/* Decorative Glow */}
      <div className={styles.glow} />
      
      {/* 404 Badge */}
      <div className={styles.badge} data-aos="fade-down">
        {t("title")} Error Status
      </div>

      <div className={styles.content}>
        {/* Main 404 Number */}
        <h1 className={styles.title} data-aos="zoom-in">
          404
        </h1>

        {/* Localized Subtitle */}
        <h2 className={styles.subtitle}>
          {t("subtitle")}
        </h2>

        {/* Localized Description */}
        <p className={styles.description}>
          {t("description")}
        </p>
        
        {/* Call to Actions */}
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            <Home size={18} />
            <span className="relative z-10">{t("button")}</span>
            <div className={styles.buttonGlow} />
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className={styles.backLink}
          >
            <MoveLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
