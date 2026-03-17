"use client";

import { Instagram, Linkedin, Facebook, Phone as WhatsApp } from "lucide-react";

interface CoachContactProps {
  coachName: string;
}

export const CoachContact = ({ coachName }: CoachContactProps) => {
  return (
    <div className="bg-surface p-8 rounded-3xl border border-white/5 space-y-6">
      <h2 className="text-xl font-bold text-foreground uppercase tracking-wider text-primary">
        Direct Contact
      </h2>
      
      <button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#25D366]/10">
        <WhatsApp size={22} />
        WhatsApp {coachName.split(' ')[0]}
      </button>

      <div className="flex items-center justify-center gap-4">
        {[
          { icon: Instagram, color: "hover:bg-pink-500/10 hover:text-pink-500" },
          { icon: Linkedin, color: "hover:bg-blue-500/10 hover:text-blue-500" },
          { icon: Facebook, color: "hover:bg-blue-600/10 hover:text-blue-600" },
        ].map((item, index) => (
          <button
            key={index}
            className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground/60 transition-all ${item.color}`}
          >
            <item.icon size={20} />
          </button>
        ))}
      </div>
    </div>
  );
};
