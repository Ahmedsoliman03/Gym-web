import { useTranslations } from 'next-intl';

const styles = {
  container: "text-center mb-16",
  title: "font-headline text-5xl md:text-7xl font-black leading-none mb-6 text-glow uppercase animate-premium-in",
  highlight: "text-primary",
  description: "font-body text-foreground/60 text-base md:text-lg mb-8 uppercase animate-premium-in max-w-4xl mx-auto"
};

export function GymsHero() {
  const t = useTranslations('Gyms');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {t('title')} <span className={styles.highlight}>{t('highlight')}</span>
      </h1>
      <p
        className={styles.description}
        style={{ animationDelay: '0.1s' }}
      >
        {t('description')}
      </p>
    </div>
  );
}
