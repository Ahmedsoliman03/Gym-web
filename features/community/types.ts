export interface PostAuthor {
    id: string;
    fullName: string;
    userType: 'coach' | 'gym' | 'client';
    photo?: string | null;
    city?: string | null;
    area?: string | null;
}

export type MediaType = 'image' | 'video';

export interface PostMedia {
    id: string;
    file: string;
    mediaType: MediaType;
    position: number;
}

export type VoteValue = 'up' | 'down' | null;

export interface CommunityPost {
    id: string;
    author: PostAuthor;
    content: string;
    media: PostMedia[];
    upVotes: number;
    downVotes: number;
    score: number;
    commentsCount: number;
    savesCount?: number;
    sharesCount?: number;
    isSaved?: boolean;
    myVote: VoteValue;
    createdAt: string;
    updatedAt?: string;
}

export interface FeedPage {
    items: CommunityPost[];
    nextCursor: string | null;
}

export interface CommunityComment {
    id: string;
    author: PostAuthor;
    body: string;
    upVotes?: number;
    downVotes?: number;
    score?: number;
    myVote: VoteValue;
    createdAt?: string;
    replies?: CommunityComment[];
}

export type ReportReason =
    | 'spam'
    | 'inappropriate'
    | 'harassment'
    | 'misleading'
    | 'other';
