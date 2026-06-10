'use client';

import { useTranslations } from 'next-intl';
import {
    Building2, MapPin, FileText, ExternalLink,
    Calendar, CheckCircle2, Clock, Eye, EyeOff,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { JobApplication } from '../types';

const styles = {
    card:          "flex flex-col bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300",
    cardHeader:    "flex items-center gap-4 p-6 border-b border-white/5",
    gymPhotoLink:  "block flex-shrink-0 rounded-xl transition-transform hover:scale-105",
    gymPhoto:      "w-14 h-14 rounded-xl object-cover border-2 border-primary/20",
    gymPhotoFb:    "w-14 h-14 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary/70",
    nameMeta:      "flex-1 min-w-0",
    gymNameLink:   "inline-block max-w-full truncate font-black text-foreground text-lg hover:text-primary transition-colors",
    appliedAt:     "text-xs text-foreground/40 flex items-center gap-1.5 mt-0.5",
    body:          "flex-1 p-6 space-y-4",
    jobRow:        "flex items-start gap-2 text-sm",
    jobIcon:       "flex-shrink-0 text-primary mt-0.5",
    jobTitle:      "font-bold text-foreground/90 leading-snug",
    locationRow:   "flex items-center gap-2 text-xs text-foreground/50",
    headline:      "text-sm text-foreground/60 leading-relaxed line-clamp-3 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5",
    badgeRow:      "flex items-center gap-2 flex-wrap",
    statusOpen:    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider",
    statusClosed:  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/50 text-[10px] font-black uppercase tracking-wider",
    cvViewed:      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider",
    cvUnseen:      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/50 text-[10px] font-black uppercase tracking-wider",
    actions:       "px-6 pb-6 grid grid-cols-2 gap-3",
    cvButton:      "flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-foreground/70 hover:text-foreground active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
    viewJobBtn:    "flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_20px_rgba(34,197,94,0.2)]",
};

function formatRelativeTime(iso?: string, justNowLabel = 'Just now') {
    if (!iso) return '';
    const date = new Date(iso);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (Number.isNaN(seconds) || seconds < 0) return '';
    if (seconds < 30) return justNowLabel;
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d`;
    return date.toLocaleDateString();
}

export interface MyApplicationCardProps {
    app: JobApplication;
}

export function MyApplicationCard({ app }: MyApplicationCardProps) {
    const t = useTranslations('Applications');
    const job = app.job;
    const gym = job?.gym;
    const gymPhoto = gym?.mainPhoto ?? null;
    const gymName = gym?.gymName ?? '';
    const jobOpen = job?.status === 'open';

    return (
        <div className={styles.card}>
            {/* Header — gym photo + name link to the job's detail page so the
                coach lands on the post they applied to. */}
            <div className={styles.cardHeader}>
                <Link
                    href={`/jobs/${job.id}` as any}
                    className={styles.gymPhotoLink}
                    aria-label={gymName}
                >
                    {gymPhoto ? (
                        <img src={gymPhoto} alt={gymName} className={styles.gymPhoto} />
                    ) : (
                        <div className={styles.gymPhotoFb}>
                            <Building2 size={22} />
                        </div>
                    )}
                </Link>
                <div className={styles.nameMeta}>
                    <Link href={`/jobs/${job.id}` as any} className={styles.gymNameLink}>
                        {gymName}
                    </Link>
                    <p className={styles.appliedAt}>
                        <Calendar size={11} />
                        {t('applied')} {formatRelativeTime(app.appliedAt)}
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className={styles.body}>
                <div className={styles.jobRow}>
                    <FileText size={14} className={styles.jobIcon} />
                    <span className={styles.jobTitle}>{job.title}</span>
                </div>

                {job.location && (
                    <div className={styles.locationRow}>
                        <MapPin size={12} className="flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                    </div>
                )}

                {app.headline && <p className={styles.headline}>{app.headline}</p>}

                <div className={styles.badgeRow}>
                    <span className={jobOpen ? styles.statusOpen : styles.statusClosed}>
                        {jobOpen ? <Clock size={11} /> : <CheckCircle2 size={11} />}
                        {jobOpen ? t('statusOpen') : t('statusClosed')}
                    </span>
                    <span className={app.cvViewed ? styles.cvViewed : styles.cvUnseen}>
                        {app.cvViewed ? <Eye size={11} /> : <EyeOff size={11} />}
                        {app.cvViewed ? t('cvViewed') : t('cvNotViewed')}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                <button
                    className={styles.cvButton}
                    onClick={() => app.cv && window.open(app.cv, '_blank', 'noopener,noreferrer')}
                    disabled={!app.cv}
                >
                    <FileText size={16} />
                    {t('viewCv')}
                </button>
                <Link href={`/jobs/${job.id}` as any} className={styles.viewJobBtn}>
                    <ExternalLink size={16} />
                    {t('viewPost')}
                </Link>
            </div>
        </div>
    );
}
