export interface StoryAuthor {
    id?: string;
    profileId?: string;
    fullName: string;
    userType: 'coach' | 'gym' | 'client';
    /** Older list responses use `profileImage`; the new detail response uses `photo`. */
    profileImage?: string | null;
    photo?: string | null;
    city?: string | null;
    area?: string | null;
}

export type StoryMediaType = 'image' | 'video';

export interface StoryMedia {
    id?: string;
    file: string;
    mediaType?: StoryMediaType;
    position?: number;
}

export interface Story {
    id: string;
    author: StoryAuthor;
    media: StoryMedia[];
    durationHours?: number;
    expiresAt?: string;
    viewersCount?: number;
    isViewed?: boolean;
    lastViewedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface StoryViewerUser {
    id?: string;
    profileId?: string;
    fullName?: string;
    userType?: StoryAuthor['userType'];
    photo?: string | null;
    city?: string | null;
    area?: string | null;
}

export interface StoryViewer {
    user: StoryViewerUser;
    viewedAt?: string;
}

export interface StoryViewersResponse {
    viewersCount: number;
    viewers: StoryViewer[];
}

/** Used internally by StoriesBar to group stories by author. */
export interface AuthorGroup {
    key: string;
    author: StoryAuthor;
    stories: Story[];
}

export interface StoriesBarProps {
    userType: StoryAuthor['userType'];
}

export interface StoryAvatarBadgeProps {
    profileImage?: string;
    profileName?: string;
    /** Defaults to true (own profile). Set to false when viewing someone else. */
    isOwner?: boolean;
    /** Author id of the displayed profile (used to filter public stories). */
    authorId?: string;
    /** Author userType for fallback matching when id is missing. */
    authorUserType?: StoryAuthor['userType'];
}

export interface ProfileAvatarChoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShowProfile: () => void;
    onShowStory: () => void;
    isOwner?: boolean;
}

export interface ProfileImageLightboxProps {
    isOpen: boolean;
    src: string;
    alt: string;
    onClose: () => void;
}

export interface StoryDeleteConfirmProps {
    isOpen: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export interface StoryPreviewModalProps {
    isOpen: boolean;
    previewUrl: string | null;
    isPublishing: boolean;
    onCancel: () => void;
    onPublish: () => void;
}

export interface StoryReportModalProps {
    isOpen: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (reason: string) => void;
}

export type ReasonKey =
    | 'spam'
    | 'inappropriate'
    | 'harassment'
    | 'misleading'
    | 'other';

export interface StoryViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    stories?: Story[];
    isOwner?: boolean;
    initialStoryIndex?: number;
}

export interface StoryViewersSheetProps {
    isOpen: boolean;
    storyId: string | null;
    onClose: () => void;
}
