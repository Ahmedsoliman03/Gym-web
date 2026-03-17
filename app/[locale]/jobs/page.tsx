export default function JobsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center pt-20">
      <div className="text-center space-y-4 animate-premium-in">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-10 border-2 border-primary rounded-sm relative">
             <div className="absolute top-2 left-1 right-1 h-0.5 bg-primary/40" />
             <div className="absolute top-4 left-1 right-1 h-0.5 bg-primary/40" />
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase">Job Board</h1>
        <p className="text-foreground/40 max-w-md mx-auto italic font-light">
          The hub for fitness professionals and leading facilities to connect. New opportunities are dropping soon.
        </p>
        <div className="pt-8">
            <div className="h-px w-24 bg-white/5 mx-auto" />
            <span className="text-[10px] text-primary font-bold tracking-[0.3em] uppercase mt-4 block">Opening Profile</span>
        </div>
      </div>
    </main>
  );
}
