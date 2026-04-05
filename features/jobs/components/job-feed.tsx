'use client';

import { Bookmark, Share2, Zap, MapPin, Building2, Banknote, MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { JobHeader } from './job-header';
import { JOBS } from '@/constants/jops';

const styles = {
  container: "min-h-screen bg-background text-foreground pt-24 pb-12 px-6 md:px-12",
  main: "max-w-4xl mx-auto w-full",
  feedGrid: "flex flex-col gap-12 mt-12",
  card: "bg-surface rounded-2xl overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 animate-premium-in",
  cardHeader: "flex items-center justify-between p-6",
  // ... existing styles ...
  authorWrapper: "flex items-center gap-4",
  avatar: "w-12 h-12 rounded-full object-cover border-2 border-primary/20",
  authorName: "font-bold text-foreground",
  authorMeta: "text-xs text-foreground/40",
  menuButton: "text-foreground/40 hover:text-primary transition-colors",
  imageWrapper: "relative aspect-video md:aspect-[21/9] overflow-hidden",
  image: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
  badge: "absolute top-6 right-6 bg-primary/90 text-primary-foreground px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md",
  contentBody: "p-8",
  jobTitle: "text-3xl md:text-4xl font-headline font-bold mb-2 group-hover:text-primary transition-colors",
  metaGrid: "flex flex-wrap gap-4 items-center text-sm font-bold text-foreground/40 mb-6",
  metaItem: "flex items-center gap-1.5",
  salary: "text-primary",
  description: "text-foreground/60 leading-relaxed max-w-2xl",
  footerActions: "px-8 pb-8 flex flex-col sm:flex-row gap-4",
  actionButton: "flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-all active:scale-95 font-bold text-sm uppercase tracking-widest",
  applyButton: "flex-[2] flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-all active:scale-95 shadow-[0_10px_30px_rgba(34,197,94,0.15)] text-sm uppercase tracking-widest"
};



export function JobFeed() {
  const t = useTranslations('Jobs');

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <JobHeader />

        <div className={styles.feedGrid}>
          {JOBS.map((job, index) => (
            <article key={job.id} className={styles.card} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.cardHeader}>
                <div className={styles.authorWrapper}>
                  <img src={job.author.avatar} alt={job.author.name} className={styles.avatar} />
                  <div>
                    <h4 className={styles.authorName}>{job.author.name}</h4>
                    <p className={styles.authorMeta}>{job.author.time} • {job.author.role}</p>
                  </div>
                </div>
                <button className={styles.menuButton}>
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className={styles.imageWrapper}>
                <img src={job.image} alt={job.title} className={styles.image} />
                {/* {job.featured && (
                  <div className={styles.badge}>
                    {t('featured')}
                  </div>
                )} */}
              </div>

              <div className={styles.contentBody}>
                <h2 className={styles.jobTitle}>{job.title}</h2>
                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <MapPin size={14} />
                    <span>{job.location}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Building2 size={14} />
                    <span>{job.company}</span>
                  </div>
                  <div className={`${styles.metaItem} ${styles.salary}`}>
                    <Banknote size={14} />
                    <span>{job.salary}</span>
                  </div>
                </div>
                <p className={styles.description}>{job.description}</p>
              </div>

              <div className={styles.footerActions}>
                <button className={styles.actionButton}>
                  <Bookmark size={18} />
                  <span>{t('savePost')}</span>
                </button>
                <button className={styles.actionButton}>
                  <Share2 size={18} />
                  <span>{t('sharePost')}</span>
                </button>
                <button className={styles.applyButton}>
                  <Zap size={18} fill="currentColor" />
                  <span>{t('applyNow')}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
