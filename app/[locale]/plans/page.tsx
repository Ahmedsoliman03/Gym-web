export default function PlansPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center pt-20">
      <div className="text-center space-y-4 animate-premium-in">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <div className="flex gap-1 items-end">
            <div className="w-2 h-4 bg-primary/40 rounded-full" />
            <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_10px_rgb(34,197,94)]" />
            <div className="w-2 h-6 bg-primary/40 rounded-full" />
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase">Elite Plans</h1>
        <p className="text-foreground/40 max-w-md mx-auto italic font-light">
          Subscription tiers designed for explosive growth. We are finalizing our pricing structure for the global launch.
        </p>
        <div className="pt-8">
            <div className="h-px w-24 bg-white/5 mx-auto" />
            <span className="text-[10px] text-primary font-bold tracking-[0.3em] uppercase mt-4 block">Finalizing Quotas</span>
        </div>
      </div>
    </main>
  );
}
