import { serverApiGet } from '@/utils/server-fetch';
import {
    toFeedPage,
    unwrapPostList,
    type RawFeedResponse,
    type RawPostListResponse,
} from './community.transforms';
import type { CommunityPost, FeedPage } from '../types';

// Server-side counterparts of the client queryFns in community.service.ts. They
// go through serverApiGet (cookie→Bearer) and apply the SAME shared transforms,
// so the dehydrated cache matches exactly what the client would have produced.

export const getFeedServer = (): Promise<FeedPage> =>
    serverApiGet<RawFeedResponse>('community/feed').then(toFeedPage);

export const getPostServer = (postId: string): Promise<CommunityPost> =>
    serverApiGet<CommunityPost>(`community/posts/${postId}`);

export const getCoachPostsServer = (coachProfileId: string): Promise<CommunityPost[]> =>
    serverApiGet<RawPostListResponse>(`community/coaches/${coachProfileId}/posts`).then(
        unwrapPostList,
    );

export const getGymPostsServer = (gymProfileId: string): Promise<CommunityPost[]> =>
    serverApiGet<RawPostListResponse>(`community/gyms/${gymProfileId}/posts`).then(
        unwrapPostList,
    );
