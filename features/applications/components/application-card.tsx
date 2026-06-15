'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Mail, Phone, FileText, ExternalLink,
    MessageCircle, ChevronRight, Briefcase,
    Calendar, MapPin, User, Eye, EyeOff,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useMarkCvViewedMutation } from '../services/applications.service';
import { formatRelativeTime } from '@/utils/format';
import type { JobApplication } from '../types';

// ─── ContactChoiceModal styles ─────────────────────────────────────────────────

const contactStyles = {
    overlay:       "fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm",
    modal:         "w-full max-w-xs bg-[#0D121F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95",
    header:        "px-6 pt-6 pb-4 border-b border-white/5",
    headerTitle:   "font-black text-foreground text-sm uppercase tracking-wider",
    headerSub:     "text-foreground/50 text-xs mt-1",
    body:          "p-4 flex flex-col gap-3",
    whatsappBtn:   "flex items-center gap-4 w-full px-5 py-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all group",
    whatsappIcon:  "w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]",
    whatsappLabel: "text-sm font-black text-[#25D366]",
    emailBtn:      "flex items-center gap-4 w-full px-5 py-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all group",
    emailIcon:     "w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary",
    emailLabel:    "text-sm font-black text-primary",
    contactMeta:   "text-xs text-foreground/40",
    chevronWa:     "ml-auto text-[#25D366]/50 group-hover:translate-x-0.5 transition-transform",
    chevronEmail:  "ml-auto text-primary/50 group-hover:translate-x-0.5 transition-transform",
    footer:        "px-4 pb-4",
    cancelBtn:     "w-full py-3 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/5 transition-all text-sm font-bold uppercase",
};

// ─── ContactChoiceModal ────────────────────────────────────────────────────────

interface ContactChoiceModalProps {
    app: JobApplication;
    onClose: () => void;
}

function ContactChoiceModal({ app, onClose }: ContactChoiceModalProps) {
    const t = useTranslations('Applications');

    const openWhatsApp = () => {
        const number = app.whatsappNumber.replace(/^0/, '').replace(/\D/g, '');
        window.open(
            `https://wa.me/20${number}`,
            '_blank',
            'noopener,noreferrer',
        );
        onClose();
    };

    const openEmail = () => {
        window.location.href = `mailto:${app.email}`;
        onClose();
    };

    return (
        <div className={contactStyles.overlay} onClick={onClose}>
            <div className={contactStyles.modal} onClick={e => e.stopPropagation()}>

                <div className={contactStyles.header}>
                    <p className={contactStyles.headerTitle}>{t('contactVia')}</p>
                    <p className={contactStyles.headerSub}>{app.fullName}</p>
                </div>

                <div className={contactStyles.body}>
                    {/* WhatsApp */}
                    <button onClick={openWhatsApp} className={contactStyles.whatsappBtn}>
                        <div className={contactStyles.whatsappIcon}>
                            <Phone size={18} />
                        </div>
                        <div className="text-left">
                            <p className={contactStyles.whatsappLabel}>WhatsApp</p>
                            <p className={contactStyles.contactMeta}>{app.whatsappNumber}</p>
                        </div>
                        <ChevronRight size={16} className={contactStyles.chevronWa} />
                    </button>

                    {/* Email */}
                    <button onClick={openEmail} className={contactStyles.emailBtn}>
                        <div className={contactStyles.emailIcon}>
                            <Mail size={18} />
                        </div>
                        <div className="text-left">
                            <p className={contactStyles.emailLabel}>{t('email')}</p>
                            <p className={contactStyles.contactMeta}>{app.email}</p>
                        </div>
                        <ChevronRight size={16} className={contactStyles.chevronEmail} />
                    </button>
                </div>

                <div className={contactStyles.footer}>
                    <button onClick={onClose} className={contactStyles.cancelBtn}>
                        {t('cancel')}
                    </button>
                </div>

            </div>
        </div>
    );
}

// ─── ApplicationCard styles ────────────────────────────────────────────────────

const styles = {
    card:          "flex flex-col bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300",
    cardHeader:    "flex items-center gap-4 p-6 border-b border-white/5",
    avatarLink:    "block flex-shrink-0 rounded-full transition-transform hover:scale-105",
    avatar:        "w-14 h-14 rounded-full object-cover border-2 border-primary/20",
    avatarFallback:"w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary/70",
    nameMeta:      "flex-1 min-w-0",
    nameLink:      "inline-block max-w-full truncate font-black text-foreground text-lg hover:text-primary transition-colors",
    name:          "font-black text-foreground text-lg truncate",
    appliedAt:     "text-xs text-foreground/40 flex items-center gap-1.5 mt-0.5",
    body:          "flex-1 p-6 space-y-4",
    headline:      "text-sm text-foreground/60 leading-relaxed line-clamp-2",
    contactRow:    "flex flex-col gap-2",
    contactItem:   "flex items-center gap-2 text-xs text-foreground/50",
    jobRow:        "flex items-center gap-2 text-xs text-foreground/40 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5",
    jobIcon:       "flex-shrink-0 text-primary",
    jobTitle:      "truncate font-medium",
    jobDot:        "text-foreground/20",
    viewPostLink:  "ml-auto flex-shrink-0 text-primary hover:text-primary/80 transition-colors",
    badgeRow:      "flex items-center gap-2 flex-wrap",
    cvViewedBadge: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider",
    cvUnseenBadge: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/50 text-[10px] font-black uppercase tracking-wider",
    actions:       "px-6 pb-6 grid grid-cols-2 gap-3",
    cvButton:      "flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-bold text-foreground/70 hover:text-foreground active:scale-95",
    contactButton: "flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_20px_rgba(34,197,94,0.2)]",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

// ─── ApplicationCard ───────────────────────────────────────────────────────────

export interface ApplicationCardProps {
    app: JobApplication;
}

export function ApplicationCard({ app }: ApplicationCardProps) {
    const t = useTranslations('Applications');
    const [contactOpen, setContactOpen] = useState(false);
    const markCvViewed = useMarkCvViewedMutation();

    const photo = app.coach?.photo ?? null;
    const displayName = app.fullName || app.coach?.fullName || '';
    const firstName = displayName.trim().split(/\s+/)[0] ?? displayName;
    const jobTitle = app.job?.title;
    const jobLocation = app.job?.location;
    const jobId = app.job?.id;

    const openCv = () => {
        if (!app.cv) return;
        // Fire-and-forget: gym-only endpoint flips `cvViewed` server-side. The
        // optimistic cache update keeps the badge state coherent across views.
        if (!app.cvViewed) markCvViewed.mutate(app.id);
        window.open(app.cv, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <div className={styles.card}>

                {/* Header — avatar + name link to the coach's detail page */}
                <div className={styles.cardHeader}>
                    <Link
                        href={`/coaches/${app.coach.id}` as any}
                        className={styles.avatarLink}
                        aria-label={displayName}
                    >
                        {photo ? (
                            <img src={photo} alt={displayName} className={styles.avatar} />
                        ) : (
                            <div className={styles.avatarFallback}>
                                <User size={22} />
                            </div>
                        )}
                    </Link>
                    <div className={styles.nameMeta}>
                        <h3 className={styles.name}>
                            <Link
                                href={`/coaches/${app.coach.id}` as any}
                                className={styles.nameLink}
                            >
                                {displayName}
                            </Link>
                        </h3>
                        <p className={styles.appliedAt}>
                            <Calendar size={11} />
                            {t('applied')} {formatRelativeTime(app.appliedAt, 'Just now')}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className={styles.body}>
                    {app.headline && <p className={styles.headline}>{app.headline}</p>}

                    <div className={styles.contactRow}>
                        <div className={styles.contactItem}>
                            <Mail size={12} className="flex-shrink-0" />
                            <span className="truncate">{app.email}</span>
                        </div>
                        <div className={styles.contactItem}>
                            <Phone size={12} className="flex-shrink-0" />
                            <span>{app.whatsappNumber}</span>
                        </div>
                    </div>

                    {jobTitle && jobId && (
                        <div className={styles.jobRow}>
                            <Briefcase size={12} className={styles.jobIcon} />
                            <span className={styles.jobTitle}>{jobTitle}</span>
                            {jobLocation && (
                                <>
                                    <span className={styles.jobDot}>•</span>
                                    <MapPin size={11} className="flex-shrink-0" />
                                    <span className="truncate">{jobLocation}</span>
                                </>
                            )}
                            <Link
                                href={`/jobs/${jobId}` as any}
                                className={styles.viewPostLink}
                                title={t('viewPost')}
                            >
                                <ExternalLink size={13} />
                            </Link>
                        </div>
                    )}

                    {/* CV-viewed badge — flips the instant the mutation fires so
                        the gym gets immediate feedback that the click registered. */}
                    <div className={styles.badgeRow}>
                        <span className={app.cvViewed ? styles.cvViewedBadge : styles.cvUnseenBadge}>
                            {app.cvViewed ? <Eye size={11} /> : <EyeOff size={11} />}
                            {app.cvViewed ? t('cvViewed') : t('cvNotViewed')}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        className={styles.cvButton}
                        onClick={openCv}
                        disabled={!app.cv}
                    >
                        <FileText size={16} />
                        {t('viewCv')}
                    </button>
                    <button onClick={() => setContactOpen(true)} className={styles.contactButton}>
                        <MessageCircle size={16} />
                        {t('contact')} {firstName}
                    </button>
                </div>

            </div>

            {contactOpen && (
                <ContactChoiceModal app={app} onClose={() => setContactOpen(false)} />
            )}
        </>
    );
}
