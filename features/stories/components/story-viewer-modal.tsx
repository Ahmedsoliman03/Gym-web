'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    X,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Trash2,
    Flag,
    Eye,
    Pause,
    Play,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import type { Story } from '../types';
import {
    useDeleteStoryMutation,
    useMyStories,
    useReportStoryMutation,
    useStoryDetails,
    useStoryViewers,
} from '../services/stories.service';
import { StoryViewersSheet } from './story-viewers-sheet';
import { StoryReportModal } from './story-report-modal';
import { StoryDeleteConfirm } from './story-delete-confirm';

interface StoryViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    stories?: Story[];
    isOwner?: boolean;
    initialStoryIndex?: number;
}

const SLIDE_DURATION_MS = 5000;
const TICK_MS = 50;

const styles = {
    root: "fixed inset-0 z-[110] bg-black flex items-center justify-center",
    stage: "relative w-full h-full max-w-md mx-auto flex flex-col",
    progressRow: "flex gap-1 px-3 pt-3 z-30",
    progressTrack: "flex-1 h-1 rounded-full bg-white/20 overflow-hidden",
    progressFill: "h-full bg-white transition-[width] duration-100 linear",
    headerRow: "flex items-center gap-3 px-4 py-3 z-30",
    author: "flex-1 text-white text-sm font-bold truncate",
    iconBtn: "p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors",
    menuWrap: "relative",
    menu: "absolute top-full right-0 mt-2 min-w-[180px] bg-[#0D121F] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-40",
    menuItem: "w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-white/5 transition-colors text-left",
    menuItemDanger: "w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left",
    media: "flex-1 flex items-center justify-center relative overflow-hidden bg-black",
    image: "max-w-full max-h-full object-contain select-none",
    pauseHit: "absolute inset-0 z-10 flex items-center justify-center cursor-pointer",
    pauseIndicator: "p-3 rounded-full bg-black/60 text-white shadow-lg",
    sideArrow: "absolute top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
    sideArrowLeft: "left-2 sm:left-4 md:left-8",
    sideArrowRight: "right-2 sm:right-4 md:right-8",
    emptyState: "absolute inset-0 flex items-center justify-center text-white/70 text-sm font-bold p-6 text-center",
    spinner: "w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin",
    footer: "z-30 flex items-center justify-between px-5 py-4 bg-gradient-to-t from-black/80 to-transparent",
    eyeBtn: "flex items-center gap-2 text-white text-sm font-bold hover:opacity-90 transition-opacity",
    eyeBox: "w-9 h-9 rounded-full bg-white/10 flex items-center justify-center",
    footerSpacer: "h-2",
};

export function StoryViewerModal({
    isOpen,
    onClose,
    stories,
    isOwner,
    initialStoryIndex = 0,
}: StoryViewerModalProps) {
    const t = useTranslations('Stories');

    const minePath = stories === undefined;
    const ownerEffective = isOwner ?? minePath;
    const { data: myStories, isLoading: myLoading } = useMyStories(isOpen && minePath);
    const sourceStories = useMemo<Story[]>(
        () => {
            const base = minePath ? (myStories ?? []) : (stories ?? []);
            return [...base].reverse().map((s) => ({
                ...s,
                media: [...(s?.media ?? [])].reverse(),
            }));
        },
        [minePath, myStories, stories],
    );

    const [storyIdx, setStoryIdx] = useState(initialStoryIndex);
    const [mediaIdx, setMediaIdx] = useState(0);
    const [progress, setProgress] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [viewersOpen, setViewersOpen] = useState(false);
    const [paused, setPaused] = useState(false);
    const [showPauseHint, setShowPauseHint] = useState(false);
    const pauseHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const deleteMutation = useDeleteStoryMutation();
    const reportMutation = useReportStoryMutation();

    const currentStory: Story | undefined = sourceStories[storyIdx];
    const detailsQuery = useStoryDetails(
        isOpen ? (currentStory?.id ?? null) : null,
        isOpen,
    );
    const displayedMedia = useMemo(() => {
        const details = detailsQuery.data;
        if (details?.media && details.media.length > 0) {
            return [...details.media].sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0),
            );
        }
        return currentStory?.media ?? [];
    }, [detailsQuery.data, currentStory]);
    const currentMedia = displayedMedia[mediaIdx]?.file;
    const viewersQuery = useStoryViewers(
        ownerEffective && isOpen ? (currentStory?.id ?? null) : null,
        ownerEffective && isOpen,
    );

    const totalSlides = useMemo(
        () =>
            sourceStories.reduce(
                (acc, s) => acc + (s?.media?.length ?? 0),
                0,
            ),
        [sourceStories],
    );
    const slidePosition = useMemo(() => {
        let p = 0;
        for (let i = 0; i < storyIdx; i++) {
            p += sourceStories[i]?.media?.length ?? 0;
        }
        return p + mediaIdx;
    }, [storyIdx, mediaIdx, sourceStories]);

    const wasOpenRef = useRef(false);
    useEffect(() => {
        if (isOpen && !wasOpenRef.current) {
            setStoryIdx(initialStoryIndex);
            setMediaIdx(0);
            setProgress(0);
            setPaused(false);
        } else if (!isOpen && wasOpenRef.current) {
            setStoryIdx(initialStoryIndex);
            setMediaIdx(0);
            setProgress(0);
            setMenuOpen(false);
            setReportOpen(false);
            setDeleteOpen(false);
            setViewersOpen(false);
            setPaused(false);
            setShowPauseHint(false);
            if (pauseHintTimer.current) clearTimeout(pauseHintTimer.current);
        }
        wasOpenRef.current = isOpen;
    }, [isOpen, initialStoryIndex]);

    const togglePause = () => {
        setPaused((p) => {
            const next = !p;
            setShowPauseHint(true);
            if (pauseHintTimer.current) clearTimeout(pauseHintTimer.current);
            pauseHintTimer.current = setTimeout(() => setShowPauseHint(false), 800);
            return next;
        });
    };

    const goNext = () => {
        setProgress(0);
        const mediaCount =
            displayedMedia.length || sourceStories[storyIdx]?.media?.length || 0;
        if (mediaIdx + 1 < mediaCount) {
            setMediaIdx(mediaIdx + 1);
            return;
        }
        if (storyIdx + 1 < sourceStories.length) {
            setStoryIdx(storyIdx + 1);
            setMediaIdx(0);
            return;
        }
        onClose();
    };

    const goPrev = () => {
        setProgress(0);
        if (mediaIdx > 0) {
            setMediaIdx(mediaIdx - 1);
            return;
        }
        if (storyIdx > 0) {
            const prevStory = sourceStories[storyIdx - 1];
            setStoryIdx(storyIdx - 1);
            setMediaIdx(Math.max(0, (prevStory?.media?.length ?? 1) - 1));
            return;
        }
    };

    const isAnyOverlayOpen = menuOpen || reportOpen || deleteOpen || viewersOpen || paused;

    useEffect(() => {
        if (!isOpen || totalSlides === 0 || isAnyOverlayOpen) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setProgress((p) => {
                const next = p + (TICK_MS / SLIDE_DURATION_MS) * 100;
                if (next >= 100) {
                    queueMicrotask(goNext);
                    return 100;
                }
                return next;
            });
        }, TICK_MS);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, storyIdx, mediaIdx, totalSlides, isAnyOverlayOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowRight') goNext();
            else if (e.key === 'ArrowLeft') goPrev();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', onKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, storyIdx, mediaIdx, totalSlides]);

    const handleDelete = async () => {
        if (!currentStory) return;
        try {
            await deleteMutation.mutateAsync(currentStory.id);
            toast.success(t('deleteSuccess'));
            setDeleteOpen(false);
            setMenuOpen(false);
            // If there are more stories, advance; otherwise close.
            if (sourceStories.length <= 1) {
                onClose();
            } else if (storyIdx >= sourceStories.length - 1) {
                setStoryIdx(Math.max(0, storyIdx - 1));
                setMediaIdx(0);
                setProgress(0);
            } else {
                setMediaIdx(0);
                setProgress(0);
            }
        } catch {
            toast.error(t('deleteError'));
        }
    };

    const handleReport = async (reason: string) => {
        if (!currentStory) return;
        try {
            await reportMutation.mutateAsync({ storyId: currentStory.id, reason });
            toast.success(t('reportSuccess'));
            setReportOpen(false);
            setMenuOpen(false);
        } catch {
            toast.error(t('reportError'));
        }
    };

    if (!isOpen) return null;

    const loading = minePath && myLoading;
    const empty = !loading && sourceStories.length === 0;
    const viewersCount = viewersQuery.data?.viewersCount ?? 0;

    return (
        <>
            <div className={styles.root} role="dialog" aria-modal="true">
                <div className={styles.stage}>
                    <div className={styles.progressRow}>
                        {totalSlides === 0 ? (
                            <div className={styles.progressTrack} />
                        ) : (
                            Array.from({ length: totalSlides }).map((_, i) => (
                                <div key={i} className={styles.progressTrack}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width:
                                                i < slidePosition
                                                    ? '100%'
                                                    : i === slidePosition
                                                      ? `${progress}%`
                                                      : '0%',
                                        }}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.headerRow}>
                        <span className={styles.author}>
                            {currentStory?.author?.fullName ?? t('viewerTitle')}
                        </span>
                        {currentStory && (
                            <div className={styles.menuWrap}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen((v) => !v)}
                                    className={styles.iconBtn}
                                    aria-label={t('moreActions')}
                                >
                                    <MoreVertical size={18} />
                                </button>
                                {menuOpen && (
                                    <div className={styles.menu}>
                                        {ownerEffective ? (
                                            <button
                                                type="button"
                                                className={styles.menuItemDanger}
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    setDeleteOpen(true);
                                                }}
                                            >
                                                <Trash2 size={16} />
                                                {t('deleteStory')}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className={styles.menuItem}
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    setReportOpen(true);
                                                }}
                                            >
                                                <Flag size={16} />
                                                {t('reportStory')}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.iconBtn}
                            aria-label={t('closeViewer')}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.media}>
                        {loading ? (
                            <span className={styles.spinner} />
                        ) : empty ? (
                            <span className={styles.emptyState}>{t('noStories')}</span>
                        ) : currentMedia ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    key={currentMedia}
                                    src={currentMedia}
                                    alt=""
                                    className={styles.image}
                                />
                                <button
                                    type="button"
                                    onClick={togglePause}
                                    className={styles.pauseHit}
                                    aria-label={paused ? t('resume') : t('pause')}
                                    aria-pressed={paused}
                                >
                                    {(showPauseHint || paused) && (
                                        <span className={styles.pauseIndicator}>
                                            {paused ? <Pause size={20} /> : <Play size={20} />}
                                        </span>
                                    )}
                                </button>
                            </>
                        ) : null}
                    </div>

                    {ownerEffective && currentStory ? (
                        <div className={styles.footer}>
                            <button
                                type="button"
                                onClick={() => setViewersOpen(true)}
                                className={styles.eyeBtn}
                                aria-label={t('viewers')}
                            >
                                <span className={styles.eyeBox}>
                                    <Eye size={18} />
                                </span>
                                <span>{viewersCount}</span>
                            </button>
                            <span className={styles.footerSpacer} />
                        </div>
                    ) : (
                        <div className={styles.footerSpacer} />
                    )}
                </div>

                {!loading && !empty && totalSlides > 0 && (
                    <>
                        <button
                            type="button"
                            onClick={goPrev}
                            disabled={slidePosition === 0}
                            aria-label={t('previous')}
                            className={`${styles.sideArrow} ${styles.sideArrowLeft}`}
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <button
                            type="button"
                            onClick={goNext}
                            aria-label={t('next')}
                            className={`${styles.sideArrow} ${styles.sideArrowRight}`}
                        >
                            <ChevronRight size={22} />
                        </button>
                    </>
                )}
            </div>

            <StoryDeleteConfirm
                isOpen={deleteOpen}
                isSubmitting={deleteMutation.isPending}
                onCancel={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
            />

            <StoryReportModal
                isOpen={reportOpen}
                isSubmitting={reportMutation.isPending}
                onCancel={() => setReportOpen(false)}
                onSubmit={handleReport}
            />

            {ownerEffective && (
                <StoryViewersSheet
                    isOpen={viewersOpen}
                    storyId={currentStory?.id ?? null}
                    onClose={() => setViewersOpen(false)}
                />
            )}
        </>
    );
}
