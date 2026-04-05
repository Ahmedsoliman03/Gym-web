const styles = {
  main: "min-h-screen bg-background text-foreground flex items-center justify-center pt-20",
  container: "text-center space-y-4 animate-premium-in",
  iconWrapper: "w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center mx-auto mb-6",
  iconItemsWrapper: "flex gap-1 items-end",
  iconBarShort: "w-2 h-4 bg-primary/40 rounded-full",
  iconBarTall: "w-2 h-8 bg-primary rounded-full shadow-[0_0_10px_rgb(34,197,94)]",
  iconBarMid: "w-2 h-6 bg-primary/40 rounded-full",
  title: "text-4xl font-black tracking-tighter uppercase",
  description: "text-foreground/40 max-w-md mx-auto italic font-light",
  footerWrapper: "pt-8",
  footerDivider: "h-px w-24 bg-white/5 mx-auto",
  footerTag: "text-[10px] text-primary font-bold tracking-[0.3em] uppercase mt-4 block"
};

export default function PlansPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconItemsWrapper}>
            <div className={styles.iconBarShort} />
            <div className={styles.iconBarTall} />
            <div className={styles.iconBarMid} />
          </div>
        </div>
        <h1 className={styles.title}>Elite Plans</h1>
        <p className={styles.description}>
          Subscription tiers designed for explosive growth. We are finalizing our pricing structure for the global launch.
        </p>
        <div className={styles.footerWrapper}>
            <div className={styles.footerDivider} />
            <span className={styles.footerTag}>Finalizing Quotas</span>
        </div>
      </div>
    </main>
  );
}
