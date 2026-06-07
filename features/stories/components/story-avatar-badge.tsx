'use client';

import { useEffect, useMemo, useRef, useState, ChangeEvent } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import {
    useCreateStoryMutation,
    useMyStories,
    useStories,
} from '../services/stories.service';
import { useProfileQuery } from '@/features/profile/services/profile.service';
import type { Story, StoryAuthor } from '../types';
import { StoryPreviewModal } from './story-preview-modal';
import { ProfileAvatarChoiceModal } from './profile-avatar-choice-modal';
import { ProfileImageLightbox } from './profile-image-lightbox';
import { StoryViewerModal } from './story-viewer-modal';

const STORY_CREATOR_TYPES: ReadonlyArray<StoryAuthor['userType']> = ['coach', 'gym'];

interface StoryAvatarBadgeProps {
    profileImage?: string;
    profileName?: string;
    /** Defaults to true (own profile). Set to false when viewing someone else. */
    isOwner?: boolean;
    /** Author id of the displayed profile (used to filter public stories). */
    authorId?: string;
    /** Author userType for fallback matching when id is missing. */
    authorUserType?: StoryAuthor['userType'];
    /**
     * When provided in non-owner mode, use these stories directly instead of
     * fetching the public list and filtering by author. Pass the array
     * embedded in detail responses (e.g. `coachDetail.stories`).
     */
    stories?: Story[];
}

const styles = {
    badge: "absolute bottom-1 right-1 z-30 w-9 h-9 rounded-full bg-primary text-primary-foreground border-4 border-surface flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform disabled:opacity-60 disabled:cursor-wait",
    spinner: "absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin pointer-events-none",
    avatarHitArea: "absolute inset-0 z-20 rounded-full cursor-pointer",
    // Story-state ring overlay painted on top of the parent avatar boundary.
    // Mirrors the stories-bar colors: primary when any story is unviewed,
    // muted gray when every story is viewed. The viewed ring MUST be a fully
    // opaque color — the parent (`avatarBorder`) paints a solid primary green
    // border underneath, and a semi-transparent overlay would just tint that
    // green instead of replacing it with gray.
    storyRing: "absolute inset-0 rounded-full border-4 border-primary pointer-events-none z-10",
    storyRingViewed: "absolute inset-0 rounded-full border-4 border-zinc-600 pointer-events-none z-10",
    // No-stories overlay — masks the parent's hardcoded primary border with
    // the surrounding card color (`bg-surface`) so the avatar reads as a
    // plain photo with no ring at all. We can't remove the parent border
    // from here, so we cover it with a matching-color border instead.
    storyRingNone: "absolute inset-0 rounded-full border-4 border-surface pointer-events-none z-10",
};

export function StoryAvatarBadge({
    profileImage,
    profileName,
    isOwner = true,
    authorId,
    authorUserType,
    stories,
}: StoryAvatarBadgeProps) {
    const t = useTranslations('Stories');
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync, isPending } = useCreateStoryMutation();


    const { data: me } = useProfileQuery();
    const canCreateStory =
        isOwner && !!me && STORY_CREATOR_TYPES.includes(me.userType);

    const { data: myStories } = useMyStories(isOwner);
    // Skip the public-stories fetch entirely when caller passed stories in directly.
    const { data: publicStories } = useStories(!isOwner && stories === undefined);

    const theirStories = useMemo<Story[]>(() => {
        if (isOwner) return [];
        if (stories !== undefined) return stories;
        const all = publicStories ?? [];
        return all.filter((s) => {
            const a = s?.author;
            if (!a) return false;
            if (authorId && a.id) return a.id === authorId;
            if (profileName && a.fullName === profileName) {
                return authorUserType ? a.userType === authorUserType : true;
            }
            return false;
        });
    }, [isOwner, stories, publicStories, authorId, profileName, authorUserType]);

    const visibleStories = isOwner ? (myStories ?? []) : theirStories;
    const hasStories = visibleStories.length > 0;
    // `isViewed === false` is intentional — when the field is missing (older
    // payloads) we fall back to gray so the UI doesn't claim "unviewed" for
    // stories we can't actually classify.
    const hasUnviewedStory = visibleStories.some((s) => s?.isViewed === false);
    // First-unviewed index, expressed in the viewer modal's playback order
    // (the modal reverses the array internally; mirror that here so the index
    // we pass in lines up with the slide we want to land on).
    const initialStoryIndex = useMemo(() => {
        const playback = [...visibleStories].reverse();
        const idx = playback.findIndex((s) => s?.isViewed === false);
        return idx >= 0 ? idx : 0;
    }, [visibleStories]);

    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [choiceOpen, setChoiceOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [imageOpen, setImageOpen] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const openPicker = () => {
        if (isPending) return;
        inputRef.current?.click();
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0] ?? null;
        e.currentTarget.value = '';
        if (!file) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPendingFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleCancelPreview = () => {
        if (isPending) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPendingFile(null);
        setPreviewUrl(null);
    };

    const handlePublish = async () => {
        if (!pendingFile) return;
        try {
            await mutateAsync(pendingFile);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPendingFile(null);
            setPreviewUrl(null);
            toast.success(t('uploadSuccess'));
        } catch {
            toast.error(t('uploadError'));
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />

            {hasStories && (
                <>
                    <span
                        aria-hidden
                        className={
                            hasUnviewedStory ? styles.storyRing : styles.storyRingViewed
                        }
                    />
                    <button
                        type="button"
                        onClick={() => setChoiceOpen(true)}
                        aria-label={t('viewOptions')}
                        className={styles.avatarHitArea}
                    />
                </>
            )}
            {!hasStories && (
                <>
                    {/* Mask the parent's green border so a profile with no
                        active stories shows no ring at all. */}
                    <span aria-hidden className={styles.storyRingNone} />
                    {profileImage && (
                        <button
                            type="button"
                            onClick={() => setImageOpen(true)}
                            aria-label={t('showProfileImage')}
                            className={styles.avatarHitArea}
                        />
                    )}
                </>
            )}

            {canCreateStory && (
                <button
                    type="button"
                    onClick={openPicker}
                    disabled={isPending}
                    aria-label={isPending ? t('uploading') : t('addStory')}
                    className={styles.badge}
                >
                    <Plus size={16} />
                    {isPending && <span className={styles.spinner} />}
                </button>
            )}

            <StoryPreviewModal
                isOpen={previewUrl !== null}
                previewUrl={previewUrl}
                isPublishing={isPending}
                onCancel={handleCancelPreview}
                onPublish={handlePublish}
            />

            <ProfileAvatarChoiceModal
                isOpen={choiceOpen}
                isOwner={isOwner}
                onClose={() => setChoiceOpen(false)}
                onShowProfile={() => {
                    setChoiceOpen(false);
                    setImageOpen(true);
                }}
                onShowStory={() => {
                    setChoiceOpen(false);
                    setViewerOpen(true);
                }}
            />

            <StoryViewerModal
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                stories={isOwner ? undefined : theirStories}
                isOwner={isOwner}
                initialStoryIndex={initialStoryIndex}
            />

            {profileImage && (
                <ProfileImageLightbox
                    isOpen={imageOpen}
                    src={profileImage}
                    alt={profileName ?? ''}
                    onClose={() => setImageOpen(false)}
                />
            )}
        </>
    );
}
