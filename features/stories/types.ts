export interface StoryAuthor {
    id?: string;
    fullName: string;
    userType: 'coach' | 'gym' | 'client';
    profileImage?: string | null;
}

export interface StoryMedia {
    file: string;
}

export interface Story {
    id: string;
    author: StoryAuthor;
    media: StoryMedia[];
}

export interface StoryViewer {
    id?: string;
    fullName?: string;
    userType?: StoryAuthor['userType'];
    profileImage?: string | null;
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
