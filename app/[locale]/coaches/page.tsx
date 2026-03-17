export default function CoachesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center pt-20">
      <div className="text-center space-y-4 animate-premium-in">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase">Our Coaches</h1>
        <p className="text-foreground/40 max-w-md mx-auto italic font-light">
          We are assembling a world-class roster of elite performance specialists. Check back soon to start your journey.
        </p>
        <div className="pt-8">
            <div className="h-px w-24 bg-white/5 mx-auto" />
            <span className="text-[10px] text-primary font-bold tracking-[0.3em] uppercase mt-4 block">Coming Soon</span>
        </div>
      </div>
    </main>
  );
}
