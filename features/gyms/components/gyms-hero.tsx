'use client';

const styles = {
  container: "text-center mb-16",
  title: "font-headline text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6 text-glow uppercase animate-premium-in",
  highlight: "text-primary",
  description: "font-body text-foreground/60 text-base md:text-lg mb-8 uppercase tracking-[0.2em] animate-premium-in max-w-4xl mx-auto"
};

export function GymsHero() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Partner <span className={styles.highlight}>Gyms</span>
      </h1>
      <p
        className={styles.description}
        style={{ animationDelay: '0.1s' }}
      >
        Finding the right environment is half the battle. We're partnering with the top facilities across the globe.
      </p>
    </div>
  );
}
