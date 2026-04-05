const styles = {
  main: "min-h-screen bg-background text-foreground flex items-center justify-center pt-20",
  container: "text-center space-y-4 animate-premium-in",
  iconWrapper: "w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center mx-auto mb-6",
  icon: "w-8 h-10 border-2 border-primary rounded-sm relative",
  iconLine1: "absolute top-2 left-1 right-1 h-0.5 bg-primary/40",
  iconLine2: "absolute top-4 left-1 right-1 h-0.5 bg-primary/40",
  title: "text-4xl font-black tracking-tighter uppercase",
  description: "text-foreground/40 max-w-md mx-auto italic font-light",
  footerWrapper: "pt-8",
  footerDivider: "h-px w-24 bg-white/5 mx-auto",
  footerTag: "text-[10px] text-primary font-bold tracking-[0.3em] uppercase mt-4 block"
};

export default function JobsPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>
             <div className={styles.iconLine1} />
             <div className={styles.iconLine2} />
          </div>
        </div>
        <h1 className={styles.title}>Job Board</h1>
        <p className={styles.description}>
          The hub for fitness professionals and leading facilities to connect. New opportunities are dropping soon.
        </p>
        <div className={styles.footerWrapper}>
            <div className={styles.footerDivider} />
            <span className={styles.footerTag}>Opening Profile</span>
        </div>
      </div>
    </main>
  );
}
