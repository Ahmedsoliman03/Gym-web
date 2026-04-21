import { useTranslations } from 'next-intl';
import { Users, Search, MessageSquare, Cpu, Layout } from 'lucide-react';

const styles = {
    container: "pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto",
    heroSection: "text-center mb-24 animate-in fade-in slide-in-from-top-8 duration-700",
    heroTitle: "text-5xl md:text-7xl font-black mb-8 tracking-tighter text-white",
    heroSubtitle: "text-xl md:text-2xl text-foreground/60 max-w-3xl mx-auto leading-relaxed",
    featuresGrid: "grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24",
    featureCard: "p-8 rounded-3xl bg-surface/50 border border-white/5 backdrop-blur-xl hover:border-primary/20 transition-all group animate-in fade-in zoom-in-95 duration-500",
    featureIconWrapper: "w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
    featureTitle: "text-xl font-bold mb-4",
    featureDescription: "text-foreground/50 leading-relaxed text-sm",
    summarySection: "p-12 md:p-20 rounded-[3rem] border border-primary/20 bg-primary/5 relative overflow-hidden",
    summaryContent: "relative z-10 max-w-2xl",
    summaryTitle: "text-4xl font-black mb-6 tracking-tight",
    summaryDescription: "text-xl text-foreground/60 leading-relaxed mb-8",
    tagWrapper: "flex flex-wrap gap-4",
    tag: "px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    blobPrimary: "absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50",
    blobSecondary: "absolute bottom-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2 opacity-30"
};

export default function AboutPage() {
    const t = useTranslations('About');

    const features = [
        {
            title: t('forGymsTitle'),
            description: t('forGymsDescription'),
            icon: <Layout className="w-6 h-6 text-primary" />,
        },
        {
            title: t('forCoachesTitle'),
            description: t('forCoachesDescription'),
            icon: <Users className="w-6 h-6 text-primary" />,
        },
        {
            title: t('searchDiscoveryTitle'),
            description: t('searchDiscoveryDescription'),
            icon: <Search className="w-6 h-6 text-primary" />,
        },
        {
            title: t('communicationTitle'),
            description: t('communicationDescription'),
            icon: <MessageSquare className="w-6 h-6 text-primary" />,
        },
        {
            title: t('aiFeaturesTitle'),
            description: t('aiFeaturesDescription'),
            icon: <Cpu className="w-6 h-6 text-primary" />,
        },
    ];

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <h1 className={styles.heroTitle}>
                    {t('title')}
                </h1>
                <p className={styles.heroSubtitle}>
                    {t('overview')}
                </p>
            </section>

            {/* Features Grid */}
            <div className={styles.featuresGrid}>
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={styles.featureCard}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className={styles.featureIconWrapper}>
                            {feature.icon}
                        </div>
                        <h3 className={styles.featureTitle}>{feature.title}</h3>
                        <p className={styles.featureDescription}>
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Summary Section */}
            <section className={styles.summarySection}>
                <div className={styles.summaryContent}>
                    <h2 className={styles.summaryTitle}>{t('summaryTitle')}</h2>
                    <p className={styles.summaryDescription}>
                        {t('summaryDescription')}
                    </p>
                    <div className={styles.tagWrapper}>
                        <span className={styles.tag}>Recruitment</span>
                        <span className={styles.tag}>Marketing</span>
                        <span className={styles.tag}>Intelligence</span>
                    </div>
                </div>

                {/* Background blobs */}
                <div className={styles.blobPrimary} />
                <div className={styles.blobSecondary} />
            </section>
        </div>
    );
}
