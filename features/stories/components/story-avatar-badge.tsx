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
}

const styles = {
    badge: "absolute bottom-1 right-1 z-30 w-9 h-9 rounded-full bg-primary text-primary-foreground border-4 border-surface flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform disabled:opacity-60 disabled:cursor-wait",
    spinner: "absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin pointer-events-none",
    avatarHitArea: "absolute inset-0 z-20 rounded-full cursor-pointer",
};

export function StoryAvatarBadge({
    profileImage,
    profileName,
    isOwner = true,
    authorId,
    authorUserType,
}: StoryAvatarBadgeProps) {
    const t = useTranslations('Stories');
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync, isPending } = useCreateStoryMutation();


    const { data: me } = useProfileQuery();
    const canCreateStory =
        isOwner && !!me && STORY_CREATOR_TYPES.includes(me.userType);

    const { data: myStories } = useMyStories(isOwner);
    const { data: publicStories } = useStories();

    const theirStories = useMemo<Story[]>(() => {
        if (isOwner) return [];
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
    }, [isOwner, publicStories, authorId, profileName, authorUserType]);

    const visibleStories = isOwner ? (myStories ?? []) : theirStories;
    const hasStories = visibleStories.length > 0;

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
                <button
                    type="button"
                    onClick={() => setChoiceOpen(true)}
                    aria-label={t('viewOptions')}
                    className={styles.avatarHitArea}
                />
            )}
            {!hasStories && profileImage && (
                <button
                    type="button"
                    onClick={() => setImageOpen(true)}
                    aria-label={t('showProfileImage')}
                    className={styles.avatarHitArea}
                />
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
