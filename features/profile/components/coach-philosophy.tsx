"use client";

interface CoachPhilosophyProps {
  title: string;
  description: string;
}

export const CoachPhilosophy = ({ title, description }: CoachPhilosophyProps) => {
  return (
    <div className="bg-surface py-4 px-6 rounded-3xl border border-white/5 w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <div className="shrink-0">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-[0.3em] text-primary/60">
                {title}
            </h2>
            <div className="h-0.5 w-8 bg-primary/20 mt-1 rounded-full" />
        </div>
        <p className="text-foreground/80 leading-relaxed text-sm md:text-base italic font-light border-l-0 md:border-l border-white/10 md:pl-8">
          "{description}"
        </p>
      </div>
    </div>
  );
};
