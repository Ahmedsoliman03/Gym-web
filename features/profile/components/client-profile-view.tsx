"use client";

import { ClientProfile } from "../mock-data";
import { TrendingUp, Calendar, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

const styles = {
  container: "space-y-8 animate-premium-in",
  header: "bg-surface p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row gap-8 items-center",
  avatarWrapper: "w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center overflow-hidden",
  avatarIcon: "text-primary",
  infoWrapper: "flex-1 text-center md:text-left",
  subtitle: "text-foreground/40 text-sm font-bold uppercase mb-8",
  name: "text-3xl font-bold mb-1",
  goal: "text-primary font-bold text-sm uppercase",
  statsGrid: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-12",
  statItem: "bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-1",
  statValue: "text-xl font-bold text-foreground",
  statLabel: "text-[10px] text-foreground/40 font-bold uppercase",
  badgeSection: "space-y-4",
  gridWrapper: "grid grid-cols-1 md:grid-cols-2 gap-8",
  card: "bg-surface p-8 rounded-3xl border border-white/5",
  cardTitle: "text-xl font-bold mb-6 flex items-center gap-2 text-primary uppercase",
  progressSection: "space-y-6",
  progressHeader: "flex justify-between items-end mb-2",
  progressValue: "text-4xl font-black text-foreground",
  progressUnit: "text-foreground/40 text-sm ml-2",
  projectionWrapper: "text-right",
  projectionLabel: "text-xs text-foreground/40 uppercase font-black",
  projectionValue: "text-sm font-bold",
  progressBarWrapper: "h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10",
  progressBar: "h-full bg-primary rounded-full shadow-[0_0_15px_rgb(34,197,94,0.5)] transition-all duration-1000",
  activityContainer: "space-y-4",
  activityItem: "flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.04] transition-all",
  activityDesc: "font-bold text-foreground/80",
  activityTime: "text-xs text-foreground/40 font-medium px-3 py-1 bg-white/5 rounded-full"
};

export const ClientProfileView = ({ data }: { data: ClientProfile }) => {
  const t = useTranslations("Profile");

  return (
    <div className={styles.container}>
      {/* Client Header */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
           <Zap size={40} className={styles.avatarIcon} />
        </div>
        <div className={styles.infoWrapper}>
          <h1 className={styles.name}>{data.name}</h1>
          <p className={styles.goal}>{data.goal}</p>
        </div>
        <div className={styles.statsGrid}>
          {data.stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{t.has(stat.label.toLowerCase()) ? t(stat.label.toLowerCase()) : stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.gridWrapper}>
        {/* Progress Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <TrendingUp size={20} /> {t('transformationProgress')}
          </h2>
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
                <div>
                    <span className={styles.progressValue}>{data.progress}%</span>
                    <span className={styles.progressUnit}>{t('toGoal')}</span>
                </div>
                <div className={styles.projectionWrapper}>
                    <div className={styles.projectionLabel}>{t('weightProjection')}</div>
                    <div className={styles.projectionValue}>{data.weight.current} → {data.weight.target}</div>
                </div>
            </div>
            <div className={styles.progressBarWrapper}>
                <div 
                    className={styles.progressBar}
                    style={{ width: `${data.progress}%` }}
                />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <Calendar size={20} /> {t('recentActivity')}
          </h2>
          <div className={styles.activityContainer}>
            {data.recentActivity.map((activity, i) => (
                <div key={i} className={styles.activityItem}>
                    <span className={styles.activityDesc}>{activity.activity}</span>
                    <span className={styles.activityTime}>{activity.time}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
