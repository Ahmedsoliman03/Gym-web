const styles = {
  container: "text-center mb-8 sm:mb-12 md:mb-16 px-2",
  title: "font-headline text-[2.5rem] sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-4 sm:mb-6 text-glow uppercase break-words",
  highlight: "text-primary",
  description: "font-body text-foreground/60 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed",
  statsWrapper: "flex flex-col items-center gap-2 mt-8",
  stats: "flex items-center justify-center gap-4 py-2 px-6 bg-surface/50 rounded-full border border-white/5 backdrop-blur-sm",
  statsCount: "text-2xl font-black text-primary",
  statsLabel: "text-[10px] text-foreground/40 uppercase font-bold",
  divider: "h-px w-full max-w-5xl mx-auto bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-12"
};

interface PageHeaderProps {
  title: string;
  highlight?: string;
  description?: string;
  statsCount?: string;
  statsLabel?: string;
  showDivider?: boolean;
}

export function PageHeader({
  title,
  highlight,
  description,
  statsCount,
  statsLabel,
  showDivider
}: PageHeaderProps) {
  return (
    <header className={styles.container}>
      <h1 className={styles.title}>
        {title} {highlight && <span className={styles.highlight}>{highlight}</span>}
      </h1>

      {description && (
        <p className={styles.description}>
          {description}
        </p>
      )}

      {statsCount && statsLabel && (
        <div className={styles.statsWrapper}>
          <div className={styles.stats}>
            <p className={styles.statsCount}>{statsCount}</p>
            <p className={styles.statsLabel}>{statsLabel}</p>
          </div>
        </div>
      )}

      {showDivider && (
        <div className={styles.divider} />
      )}
    </header>
  );
}
