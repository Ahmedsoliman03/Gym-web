import type { CommunityPost, FeedPage } from '../types';

// Pure, framework-agnostic response normalizers shared by the client service
// (community.service.ts) and the server prefetch helpers (community.server.ts),
// so both produce identical query-cache shapes and hydration never mismatches.

export type RawFeedResponse =
    | CommunityPost[]
    | {
          items?: CommunityPost[];
          results?: CommunityPost[];
          data?: CommunityPost[];
          posts?: CommunityPost[];
          nextCursor?: string | null;
          next?: string | null;
          cursor?: string | null;
      };

export type RawPostListResponse =
    | CommunityPost[]
    | {
          items?: CommunityPost[];
          results?: CommunityPost[];
          data?: CommunityPost[];
          posts?: CommunityPost[];
      };

const extractNextCursor = (
    body: Exclude<RawFeedResponse, CommunityPost[]>,
): string | null => {
    if (body.nextCursor !== undefined) return body.nextCursor ?? null;
    if (body.cursor !== undefined) return body.cursor ?? null;
    const next = body.next;
    if (!next) return null;
    try {
        const url = new URL(next, 'http://x');
        return url.searchParams.get('cursor') ?? next;
    } catch {
        return next;
    }
};

/** Normalize a raw feed response into a FeedPage (items + nextCursor). */
export const toFeedPage = (data: RawFeedResponse): FeedPage => {
    if (Array.isArray(data)) {
        return { items: data.filter(Boolean), nextCursor: null };
    }
    const items = data.items ?? data.results ?? data.data ?? data.posts ?? [];
    return { items: items.filter(Boolean), nextCursor: extractNextCursor(data) };
};

/** Normalize a raw post-list response into a clean CommunityPost[]. */
export const unwrapPostList = (data: RawPostListResponse): CommunityPost[] => {
    if (Array.isArray(data)) return data.filter(Boolean);
    const items = data.items ?? data.results ?? data.data ?? data.posts ?? [];
    return items.filter(Boolean);
};
