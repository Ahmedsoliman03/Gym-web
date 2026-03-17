"use client";

import { Award, CheckCircle2 } from "lucide-react";

interface CoachCredentialsProps {
  certifications: string[];
  specializations: string[];
}

export const CoachCredentials = ({
  certifications,
  specializations,
}: CoachCredentialsProps) => {
  return (
    <div className="bg-surface p-8 rounded-3xl border border-white/5 space-y-8">
      {/* Certifications */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-wider text-primary">
          <Award size={20} /> Certifications
        </h2>
        <ul className="space-y-3">
          {certifications.map((cert, index) => (
            <li key={index} className="flex items-center gap-3 text-foreground/80">
              <CheckCircle2 size={18} className="text-primary shrink-0" />
              <span>{cert}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Specializations */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-6 uppercase tracking-wider text-primary">
          Specializations
        </h2>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec, index) => (
            <span
              key={index}
              className="bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-lg border border-primary/20"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
