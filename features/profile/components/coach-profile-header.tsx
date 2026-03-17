"use client";

import Image from "next/image";
import { MessageSquare, Settings } from "lucide-react";
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

interface CoachProfileHeaderProps {
  name: string;
  title: string;
  tier: string;
  stats: {
    label: string;
    value: string;
  }[];
  image: string;
}

export const CoachProfileHeader = ({
  name,
  title,
  tier,
  stats,
  image,
}: CoachProfileHeaderProps) => {
  return (
    <div className="relative w-full rounded-3xl bg-surface p-8 overflow-hidden animate-premium-in border border-white/5">
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
        {/* Profile Picture */}
        <div className="relative">
          <div className="w-40 h-40 rounded-full border-4 border-primary p-1 overflow-hidden">
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full border-4 border-surface" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">{name}</h1>
            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/30 uppercase tracking-wider">
              {tier}
            </span>
          </div>
          <p className="text-foreground/60 text-lg mb-6">{title}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-foreground/40 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
          <button className="flex-1 md:w-44 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
            <MessageSquare size={18} />
            Chat
          </button>
          <button className="flex-1 md:w-44 bg-white/5 hover:bg-white/10 text-foreground font-bold py-3 px-6 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            <Settings size={18} />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
