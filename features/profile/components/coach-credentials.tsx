"use client";

import { Award, CheckCircle2 } from "lucide-react";

const styles = {
  container: "bg-surface p-8 rounded-3xl border border-white/5 space-y-8",
  section: "div",
  title: "text-xl font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-wider text-primary",
  list: "space-y-3",
  listItem: "flex items-center gap-3 text-foreground/80",
  listIcon: "text-primary shrink-0",
  tagsWrapper: "flex flex-wrap gap-2",
  tag: "bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-lg border border-primary/20",
};

interface CoachCredentialsProps {
  certifications: string[];
  specializations: string[];
}

export const CoachCredentials = ({
  certifications,
  specializations,
}: CoachCredentialsProps) => {
  return (
    <div className={styles.container}>
      {/* Certifications */}
      <div className={styles.section}>
        <h2 className={styles.title}>
          <Award size={20} /> Certifications
        </h2>
        <ul className={styles.list}>
          {certifications.map((cert, index) => (
            <li key={index} className={styles.listItem}>
              <CheckCircle2 size={18} className={styles.listIcon} />
              <span>{cert}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Specializations */}
      <div className={styles.section}>
        <h2 className={styles.title}>
          Specializations
        </h2>
        <div className={styles.tagsWrapper}>
          {specializations.map((spec, index) => (
            <span
              key={index}
              className={styles.tag}
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
