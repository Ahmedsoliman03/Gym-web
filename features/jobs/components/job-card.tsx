'use client';

import {
    Bookmark, BookmarkCheck, Share2, Zap, Briefcase, Building2, Banknote, Users,
    MoreVertical, Edit2, Trash2, Power,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

import { Link } from '@/i18n/routing';
import { SharePostModal } from '@/components/shared/share-post-modal';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useProfileUser } from '@/features/profile/hooks/useProfileUser';
import { useProfileLink } from '@/features/profile/hooks/useProfileLink';
import {
    useCloseJobMutation,
    useDeleteJobMutation,
    useSaveJobMutation,
    useShareJobMutation,
} from '../services/jobs.service';
import type { Job } from '../types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface JobCardProps {
    job: Job;
    onApply: (job: Job) => void;
    onEdit?: (job: Job) => void;
    index: number;
}

// ─── Styles object ─────────────────────────────────────────────────────────────

const styles = {
    card: "bg-surface rounded-2xl overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5",
    cardHeader: "flex items-center justify-between p-4 sm:p-6",
    authorWrapper: "flex items-center gap-3 sm:gap-4 min-w-0",
    avatar: "w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden",
    avatarLink: "w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden hover:ring-2 hover:ring-primary/40 transition-all",
    authorName: "font-bold text-foreground truncate",
    authorNameLink: "font-bold text-foreground truncate hover:text-primary hover:underline transition-colors",
    authorMeta: "text-xs text-foreground/40 truncate",
    menuButton: "text-foreground/40 hover:text-primary transition-colors p-2 rounded-lg hover:bg-white/5",
    imageWrapper: "relative aspect-video md:aspect-[21/9] overflow-hidden bg-[#0D121F]",
    image: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
    badge: "absolute top-4 right-4 sm:top-6 sm:right-6 bg-primary/90 text-primary-foreground px-3 sm:px-4 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-md",
    closedBadge: "absolute top-4 right-4 sm:top-6 sm:right-6 bg-red-500/90 text-white px-3 sm:px-4 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-md",
    contentBody: "p-4 sm:p-6 md:p-8",
    jobTitle: "text-2xl sm:text-3xl md:text-4xl font-headline font-bold mb-2 group-hover:text-primary transition-colors leading-tight break-words",
    metaGrid: "flex flex-wrap gap-3 sm:gap-4 items-center text-sm font-bold text-foreground/40 mb-6",
    metaItem: "flex items-center gap-1.5",
    description: "text-foreground/60 leading-relaxed max-w-2xl whitespace-pre-wrap break-words",
    descriptionClamped: "text-foreground/60 leading-relaxed max-w-2xl whitespace-pre-wrap break-words line-clamp-3",
    seeMoreBtn: "mt-2 text-primary text-xs font-black uppercase tracking-wider hover:underline",
    specTags: "flex flex-wrap gap-2 mb-4",
    specTagsInline: "flex flex-wrap gap-2 items-center",
    titleRow: "flex flex-wrap items-center gap-3 mb-3",
    specTag: "px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/20",
    salaryChip: "text-primary",
    footerActions: "px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 flex flex-col sm:flex-row gap-3 sm:gap-4",
    actionButton: "flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 rounded-xl bg-white/5 text-foreground hover:bg-white/10 transition-all active:scale-95 font-bold text-sm uppercase",
    actionButtonActive: "flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30 transition-all active:scale-95 font-bold text-sm uppercase",
    applyButton: "flex-[2] flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 rounded-xl bg-primary text-primary-foreground font-black hover:opacity-90 transition-all active:scale-95 shadow-[0_10px_30px_rgba(34,197,94,0.15)] text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed",
    appliedPill: "flex-[2] flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 rounded-xl bg-primary/15 text-primary font-black border border-primary/30 text-sm uppercase cursor-default",
    closedNotice: "mx-4 sm:mx-6 md:mx-8 mb-4 sm:mb-6 md:mb-8 flex flex-col items-center justify-center gap-1 py-4 px-6 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-black text-sm uppercase tracking-wider text-center",
    closedNoticeRow: "flex items-center justify-center gap-2",
    closedOnDate: "text-[11px] font-bold tracking-wider text-red-400/70 normal-case",
    countPill:
        'min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-white/10 text-foreground/80 text-[10px] font-bold tabular-nums leading-none',
    statsRow:
        'px-4 sm:px-6 md:px-8 pb-3 flex flex-wrap items-center gap-2',
    statChip:
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/5 text-foreground/60 font-bold text-[11px] uppercase tracking-wider',
    statNum:
        'min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-black tabular-nums leading-none',
    menuWrapper: "relative",
    dropdown: "absolute right-0 top-full mt-2 w-48 bg-[#161B22] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2",
    dropdownItem: "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-foreground/70 hover:text-white hover:bg-white/5 transition-colors",
    dropdownItemDanger: "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-white/5 transition-colors",
};

function formatRelativeTime(iso?: string, justNowLabel = 'Just now') {
    if (!iso) return '';
    const date = new Date(iso);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (Number.isNaN(seconds) || seconds < 0) return '';
    // Under 30 seconds reads "just now" rather than a bare "0s" / "12s".
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

// ─── Component ─────────────────────────────────────────────────────────────────

export function JobCard({ job, onApply, onEdit, index }: JobCardProps) {
    const t = useTranslations('Jobs');
    const locale = useLocale();
    const { profile } = useProfileUser();

    const saveMutation = useSaveJobMutation();
    const shareMutation = useShareJobMutation();
    const closeMutation = useCloseJobMutation();
    const deleteMutation = useDeleteJobMutation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [closeOpen, setCloseOpen] = useState(false);
    const [contentExpanded, setContentExpanded] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Show the "see more" button only when the body is long enough that the
    // clamp will hide something. Cheap heuristic: character count threshold.
    const CONTENT_TRUNCATE_AT = 240;
    const contentNeedsToggle = (job.content?.length ?? 0) > CONTENT_TRUNCATE_AT;

    const jobUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${locale}/jobs/${job.id}`
        : `/${locale}/jobs/${job.id}`;

    // The job's author IS the gym record on the response. The user account id
    // (`profile.id`) and the gym profile id (`profile.profile.id`) are different
    // values, so accept either match — backends differ on which one they echo
    // back in `job.gym.id`. Only gyms can own jobs in the first place.
    const myGymProfileId =
        profile?.userType === 'gym' ? profile.profile?.id : undefined;
    const isMine =
        profile?.userType === 'gym' &&
        !!job.gym?.id &&
        (job.gym.id === myGymProfileId || job.gym.id === profile.id);
    const saved = !!job.isSaved;
    const sharesCount = job.sharesCount ?? 0;
    const savesCount = job.savesCount ?? 0;
    const applicationsCount = job.applicationsCount ?? 0;
    // `closedAt` is the source of truth: any non-null timestamp means the job
    // is closed for applications, regardless of the legacy `status` field.
    const isClosed = !!job.closedAt;
    const myUserType = profile?.userType;
    const canApply = myUserType === 'coach';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSave = () => {
        if (isMine || saveMutation.isPending) return;
        saveMutation.mutate({ jobId: job.id, saved: !saved });
    };

    const handleShare = () => setShareOpen(true);

    const confirmClose = () => {
        closeMutation.mutate(job.id, {
            onSuccess: () => {
                toast.success(t('closeSuccess'));
                setCloseOpen(false);
            },
            onError: () => toast.error(t('closeFailed')),
        });
    };

    const confirmDelete = () => {
        deleteMutation.mutate(job.id, {
            onSuccess: () => {
                toast.success(t('deleteSuccess'));
                setDeleteOpen(false);
            },
            onError: () => toast.error(t('deleteFailed')),
        });
    };

    const gym = job.gym;
    const gymName = gym?.gymName ?? '';
    const gymLocation = [gym?.area, gym?.city].filter(Boolean).join(' · ');
    // Click-through to the gym's detail page (or /profile if it's mine).
    const { href: gymHref } = useProfileLink(gym?.id, 'gym');

    return (
        <>
            <article
                className={styles.card}
                style={{ animationDelay: `${index * 0.1}s` }}
            >

                {/* Card header — gym identity */}
                <div className={styles.cardHeader}>
                    <div className={styles.authorWrapper}>
                        {gymHref ? (
                            <Link href={gymHref} className={styles.avatarLink} aria-label={gymName}>
                                {gym?.mainPhoto ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={gym.mainPhoto} alt={gymName} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={18} />
                                )}
                            </Link>
                        ) : (
                            <div className={styles.avatar}>
                                {gym?.mainPhoto ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={gym.mainPhoto} alt={gymName} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 size={18} />
                                )}
                            </div>
                        )}
                        <div className="min-w-0">
                            {gymHref ? (
                                <Link href={gymHref} className={styles.authorNameLink}>
                                    <h4 className="m-0">{gymName}</h4>
                                </Link>
                            ) : (
                                <h4 className={styles.authorName}>{gymName}</h4>
                            )}
                            <p className={styles.authorMeta}>
                                {gymLocation || formatRelativeTime(job.createdAt, t('justNow'))}
                                {gymLocation && job.createdAt
                                    ? ` · ${formatRelativeTime(job.createdAt, t('justNow'))}`
                                    : ''}
                            </p>
                        </div>
                    </div>

                    {/* Owner-only context menu — visible on feed AND detail. */}
                    {isMine && (
                        <div className={styles.menuWrapper} ref={menuRef}>
                            <button
                                className={styles.menuButton}
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label={t('postMenu')}
                            >
                                <MoreVertical size={20} />
                            </button>
                            {menuOpen && (
                                <div className={styles.dropdown}>
                                    {onEdit && !isClosed && (
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                onEdit(job);
                                            }}
                                            className={styles.dropdownItem}
                                        >
                                            <Edit2 size={16} />
                                            {t('editPost')}
                                        </button>
                                    )}
                                    {!isClosed && (
                                        <button
                                            onClick={() => {
                                                setMenuOpen(false);
                                                setCloseOpen(true);
                                            }}
                                            className={styles.dropdownItem}
                                        >
                                            <Power size={16} />
                                            {t('closePost')}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            setDeleteOpen(true);
                                        }}
                                        className={styles.dropdownItemDanger}
                                    >
                                        <Trash2 size={16} />
                                        {t('deletePost')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content first — title (with inline specialization), salary, body. */}
                <div className={styles.contentBody}>
                    <div className={styles.titleRow}>
                        <h2 className={styles.jobTitle}>{job.title}</h2>
                        {job.specialization && job.specialization.length > 0 && (
                            <div className={styles.specTagsInline}>
                                {job.specialization.map((spec) => (
                                    <span key={spec} className={styles.specTag}>
                                        <Briefcase size={11} className="inline mr-1" />
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                
                    {job.salary && (
                        <div className={`${styles.metaItem} ${styles.salaryChip} mb-4`}>
                            <Banknote size={14} />
                            <span>{job.salary}</span>
                        </div>
                    )}
                    {/* Truncated content with see more / see less toggle. */}
                    {job.content && (
                        <>
                            <p
                                className={
                                    contentExpanded
                                        ? styles.description
                                        : styles.descriptionClamped
                                }
                            >
                                {job.content}
                            </p>
                            {contentNeedsToggle && (
                                <button
                                    type="button"
                                    onClick={() => setContentExpanded((v) => !v)}
                                    className={styles.seeMoreBtn}
                                >
                                    {contentExpanded ? t('seeLess') : t('seeMore')}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Hero image — placed after content. Omitted when no image. */}
                {job.image && (
                    <div className={styles.imageWrapper}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={job.image} alt={job.title} className={styles.image} />
                        {isClosed && (
                            <span className={styles.closedBadge}>{t('closedBadge')}</span>
                        )}
                    </div>
                )}

                {/* Public stats row — visible to every viewer (owner and
                    non-owner). Always renders the three counters so social
                    proof is consistent across roles. */}
                {!isClosed && (
                    <div className={styles.statsRow}>
                        <div className={styles.statChip}>
                            <Users size={14} />
                            <span>{t('applicationsLabel')}</span>
                            <span className={styles.statNum}>{applicationsCount}</span>
                        </div>
                        <div className={styles.statChip}>
                            <Bookmark size={14} />
                            <span>{t('savesLabel')}</span>
                            <span className={styles.statNum}>{savesCount}</span>
                        </div>
                        <div className={styles.statChip}>
                            <Share2 size={14} />
                            <span>{t('sharesLabel')}</span>
                            <span className={styles.statNum}>{sharesCount}</span>
                        </div>
                    </div>
                )}

                {/* Footer actions */}
                {isClosed ? (
                    // Closed jobs replace the entire action bar with a notice —
                    // no apply / save / share once a job is closed.
                    <div className={styles.closedNotice}>
                        <div className={styles.closedNoticeRow}>
                            <Power size={16} />
                            <span>{t('closedNotice')}</span>
                        </div>
                        {job.closedAt && (
                            <span className={styles.closedOnDate}>
                                {t('closedOn', {
                                    date: new Date(job.closedAt).toLocaleDateString(
                                        locale === 'ar' ? 'ar-EG' : 'en-US',
                                        { year: 'numeric', month: 'short', day: 'numeric' },
                                    ),
                                })}
                            </span>
                        )}
                    </div>
                ) : isMine ? (
                    // Owner view: only Share — counts are in the stats row above.
                    <div className={styles.footerActions}>
                        <button className={styles.actionButton} onClick={handleShare}>
                            <Share2 size={18} />
                            <span>{t('sharePost')}</span>
                        </button>
                    </div>
                ) : (
                    <div className={styles.footerActions}>
                        {/* Apply slot — coach can apply; "Already applied" once they have. */}
                        {canApply && (
                            job.isApplied ? (
                                <div className={styles.appliedPill}>
                                    <Zap size={18} fill="currentColor" />
                                    <span>{t('alreadyApplied')}</span>
                                </div>
                            ) : (
                                <button
                                    className={styles.applyButton}
                                    onClick={() => onApply(job)}
                                >
                                    <Zap size={18} fill="currentColor" />
                                    <span>{t('applyNow')}</span>
                                </button>
                            )
                        )}
                        {/* Save + share are available to any signed-in non-owner
                            (gyms, coaches, clients). */}
                        <button
                            className={saved ? styles.actionButtonActive : styles.actionButton}
                            onClick={toggleSave}
                            disabled={saveMutation.isPending}
                            aria-pressed={saved}
                        >
                            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                            <span>{saved ? t('savedPost') : t('savePost')}</span>
                        </button>
                        <button className={styles.actionButton} onClick={handleShare}>
                            <Share2 size={18} />
                            <span>{t('sharePost')}</span>
                        </button>
                    </div>
                )}

            </article>

            {/* Share modal — only fires shareJob when user actually copies/picks. */}
            <SharePostModal
                isOpen={shareOpen}
                onClose={() => setShareOpen(false)}
                url={jobUrl}
                title={job.title}
                onShared={() => shareMutation.mutate(job.id)}
            />

            {/* Close confirmation */}
            <ConfirmDialog
                isOpen={closeOpen}
                title={t('closeConfirmTitle')}
                body={t('closeConfirmBody')}
                cancelLabel={t('cancel')}
                confirmLabel={t('closePost')}
                submittingLabel={t('closing')}
                tone="primary"
                isSubmitting={closeMutation.isPending}
                onCancel={() => setCloseOpen(false)}
                onConfirm={confirmClose}
            />

            {/* Delete confirmation */}
            <ConfirmDialog
                isOpen={deleteOpen}
                title={t('deleteConfirmTitle')}
                body={t('deleteConfirmBody')}
                cancelLabel={t('cancel')}
                confirmLabel={t('deletePost')}
                submittingLabel={t('deleting')}
                tone="danger"
                isSubmitting={deleteMutation.isPending}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
        </>
    );
}
