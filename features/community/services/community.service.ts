import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/utils/axios';
import type {
    CommunityComment,
    CommunityPost,
    FeedPage,
    PostAuthor,
    VoteValue,
} from '../types';

// ─── Feed ─────────────────────────────────────────────────────────────────────

type RawFeedResponse =
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

export const getFeed = async(): Promise<FeedPage> => {
    const { data } = await api.get<RawFeedResponse>(
        `/api/community/feed`,
    );

    if (Array.isArray(data)) {
        return { items: data.filter(Boolean), nextCursor: null };
    }

    const items = data.items ?? data.results ?? data.data ?? data.posts ?? [];
    return {
        items: items.filter(Boolean),
        nextCursor: extractNextCursor(data),
    };
};

// `/community` is gated by middleware (only authenticated users reach it), so
// no client-side cookie check is needed. Gating on `document.cookie` would
// cause `enabled` to differ between SSR and client and produce a hydration
// mismatch.
export const useFeed = (enabled = true) =>
    useInfiniteQuery<FeedPage>({
        queryKey: ['community', 'feed'],
        queryFn: getFeed,

        initialPageParam: null as string | null,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled,
    });

// ─── Saved posts ──────────────────────────────────────────────────────────────

type RawSavedPostsResponse =
    | CommunityPost[]
    | {
        items?: CommunityPost[];
        results?: CommunityPost[];
        data?: CommunityPost[];
        posts?: CommunityPost[];
    };

export const getSavedPosts = async (): Promise<CommunityPost[]> => {
    const { data } = await api.get<RawSavedPostsResponse>('/api/community/posts/saved');
    if (Array.isArray(data)) return data.filter(Boolean);
    const items = data.items ?? data.results ?? data.data ?? data.posts ?? [];
    return items.filter(Boolean);
};

export const useSavedPosts = (enabled = true) =>
    useQuery<CommunityPost[]>({
        queryKey: ['community', 'posts', 'saved'],
        queryFn: getSavedPosts,
        enabled,
    });

// ─── My posts ────────────────────────────────────────────────────────────────
//
// `GET /api/community/posts/mine` (per postman README) — returns community
// posts authored by the current user. Same envelope handling as the saved
// list since the backend uses the same paging shapes across these lists.

export const getMyPosts = async (): Promise<CommunityPost[]> => {
    const { data } = await api.get<RawSavedPostsResponse>('/api/community/posts/mine');
    if (Array.isArray(data)) return data.filter(Boolean);
    const items = data.items ?? data.results ?? data.data ?? data.posts ?? [];
    return items.filter(Boolean);
};

export const useMyPosts = (enabled = true) =>
    useQuery<CommunityPost[]>({
        queryKey: ['community', 'posts', 'mine'],
        queryFn: getMyPosts,
        enabled,
    });

// ─── Post details ─────────────────────────────────────────────────────────────

export const getPost = async (postId: string): Promise<CommunityPost> => {
    const { data } = await api.get<CommunityPost>(`/api/community/posts/${postId}`);
    return data;
};

export const usePost = (postId: string | null) =>
    useQuery<CommunityPost>({
        queryKey: ['community', 'post', postId],
        queryFn: () => getPost(postId as string),
        enabled: !!postId,
    });

// ─── Create / edit / delete post ──────────────────────────────────────────────

export interface CreatePostInput {
    content: string;
    media: File[];
}

export const createPost = async (input: CreatePostInput): Promise<CommunityPost> => {
    const formData = new FormData();
    formData.append('content', input.content);
    input.media.forEach((file) => formData.append('media', file));

    const { data } = await api.post<CommunityPost>('/api/community/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const useCreatePostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community', 'feed'] });
        },
    });
};

export interface EditPostInput {
    postId: string;
    content: string;
    /** If provided (length > 0), replaces all media. If empty, leaves existing media. */
    media?: File[];
}

export const editPost = async (input: EditPostInput): Promise<CommunityPost> => {
    const formData = new FormData();
    formData.append('content', input.content);
    input.media?.forEach((file) => formData.append('media', file));

    const { data } = await api.patch<CommunityPost>(
        `/api/community/posts/${input.postId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
};

export const useEditPostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: editPost,
        onSuccess: (updated) => {
            // Replace the post inside every cached feed page with the server's
            // version, instead of refetching the whole feed.
            queryClient.setQueriesData<{ pages: FeedPage[]; pageParams: unknown[] } | undefined>(
                { queryKey: ['community', 'feed'] },
                (curr) => {
                    if (!curr) return curr;
                    return {
                        ...curr,
                        pages: curr.pages.map((page) => ({
                            ...page,
                            items: page.items.map((p) => (p.id === updated.id ? updated : p)),
                        })),
                    };
                },
            );
            queryClient.setQueryData(['community', 'post', updated.id], updated);
        },
    });
};

export const deletePost = async (postId: string): Promise<void> => {
    await api.delete(`/api/community/posts/${postId}`);
};

export const useDeletePostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePost,
        onSuccess: (_data, postId) => {
            // Drop the post from every cached feed page so it disappears
            // immediately, without refetching the whole feed.
            queryClient.setQueriesData<{ pages: FeedPage[]; pageParams: unknown[] } | undefined>(
                { queryKey: ['community', 'feed'] },
                (prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        pages: prev.pages.map((page) => ({
                            ...page,
                            items: page.items.filter((p) => p.id !== postId),
                        })),
                    };
                },
            );
            // Clear the detail cache for this post too.
            queryClient.removeQueries({ queryKey: ['community', 'post', postId] });
        },
    });
};

// ─── Voting ───────────────────────────────────────────────────────────────────

export const votePost = async ({
    postId,
    vote,
}: {
    postId: string;
    vote: VoteValue;
}): Promise<void> => {
    await api.post(`/api/community/posts/${postId}/vote`, { vote });
};

/** Apply a vote transition (prev → next) to a post's counts. Pure. */
const applyVoteTransition = (post: CommunityPost, nextVote: VoteValue): CommunityPost => {
    const prevVote = post.myVote;
    if (prevVote === nextVote) return post;
    let upVotes = post.upVotes;
    let downVotes = post.downVotes;
    if (prevVote === 'up') upVotes -= 1;
    if (prevVote === 'down') downVotes -= 1;
    if (nextVote === 'up') upVotes += 1;
    if (nextVote === 'down') downVotes += 1;
    return {
        ...post,
        myVote: nextVote,
        upVotes,
        downVotes,
        score: upVotes - downVotes,
    };
};

type FeedQueryData = { pages: FeedPage[]; pageParams: unknown[] } | undefined;

export const useVotePostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: votePost,
        onMutate: async ({ postId, vote }) => {
            await queryClient.cancelQueries({ queryKey: ['community', 'feed'] });
            await queryClient.cancelQueries({ queryKey: ['community', 'post', postId] });

            const prevFeed: { key: unknown[]; data: FeedQueryData }[] = [];
            queryClient
                .getQueriesData<FeedQueryData>({ queryKey: ['community', 'feed'] })
                .forEach(([key, data]) => {
                    prevFeed.push({ key: key as unknown[], data });
                });
            const prevPost = queryClient.getQueryData<CommunityPost>([
                'community',
                'post',
                postId,
            ]);

            queryClient.setQueriesData<FeedQueryData>(
                { queryKey: ['community', 'feed'] },
                (curr) => {
                    if (!curr) return curr;
                    return {
                        ...curr,
                        pages: curr.pages.map((page) => ({
                            ...page,
                            items: page.items.map((p) =>
                                p.id === postId ? applyVoteTransition(p, vote) : p,
                            ),
                        })),
                    };
                },
            );

            if (prevPost) {
                queryClient.setQueryData<CommunityPost>(
                    ['community', 'post', postId],
                    applyVoteTransition(prevPost, vote),
                );
            }

            return { prevFeed, prevPost };
        },
        onError: (_err, { postId }, context) => {
            context?.prevFeed.forEach(({ key, data }) => {
                queryClient.setQueryData(key, data);
            });
            if (context?.prevPost !== undefined) {
                queryClient.setQueryData(['community', 'post', postId], context.prevPost);
            }
        },
    });
};

export const voteComment = async ({
    commentId,
    vote,
}: {
    commentId: string;
    vote: VoteValue;
}): Promise<void> => {
    await api.post(`/api/community/comments/${commentId}/vote`, { vote });
};

/** Apply a vote transition (prev → next) to a single comment. Pure. */
const applyCommentVoteTransition = (
    comment: CommunityComment,
    nextVote: VoteValue,
): CommunityComment => {
    const prevVote = comment.myVote;
    if (prevVote === nextVote) return comment;
    let upVotes = comment.upVotes ?? 0;
    let downVotes = comment.downVotes ?? 0;
    if (prevVote === 'up') upVotes -= 1;
    if (prevVote === 'down') downVotes -= 1;
    if (nextVote === 'up') upVotes += 1;
    if (nextVote === 'down') downVotes += 1;
    return {
        ...comment,
        myVote: nextVote,
        upVotes,
        downVotes,
        score: upVotes - downVotes,
    };
};

/**
 * Walk a comment tree (top-level + replies) and apply `transform` to the node
 * whose id matches. Returns a new array; non-matching nodes are returned as-is.
 */
const mapCommentTree = (
    nodes: CommunityComment[],
    targetId: string,
    transform: (c: CommunityComment) => CommunityComment,
): CommunityComment[] =>
    nodes.map((c) => {
        if (c.id === targetId) return transform(c);
        if (c.replies && c.replies.length > 0) {
            return { ...c, replies: mapCommentTree(c.replies, targetId, transform) };
        }
        return c;
    });

type CommentsQueryData = CommunityComment[] | undefined;

export const useVoteCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: voteComment,
        onMutate: async ({ commentId, vote }) => {
            await queryClient.cancelQueries({ queryKey: ['community', 'comments'] });

            const prev: { key: unknown[]; data: CommentsQueryData }[] = [];
            queryClient
                .getQueriesData<CommentsQueryData>({ queryKey: ['community', 'comments'] })
                .forEach(([key, data]) => {
                    prev.push({ key: key as unknown[], data });
                });

            queryClient.setQueriesData<CommentsQueryData>(
                { queryKey: ['community', 'comments'] },
                (curr) =>
                    curr
                        ? mapCommentTree(curr, commentId, (c) =>
                              applyCommentVoteTransition(c, vote),
                          )
                        : curr,
            );

            return { prev };
        },
        onError: (_err, _vars, context) => {
            context?.prev.forEach(({ key, data }) => {
                queryClient.setQueryData(key, data);
            });
        },
    });
};

// ─── Comment voters / report ──────────────────────────────────────────────────

export interface CommentVotersResponse {
    upVotes: number;
    downVotes: number;
    voters?: {
        id?: string;
        fullName?: string;
        userType?: PostAuthor['userType'];
        photo?: string | null;
        vote?: VoteValue;
    }[];
}

export const getCommentVoters = async (
    commentId: string,
): Promise<CommentVotersResponse> => {
    const { data } = await api.get<CommentVotersResponse>(
        `/api/community/comments/${commentId}/votes`,
    );
    return data;
};

export const useCommentVoters = (commentId: string | null, enabled = true) =>
    useQuery<CommentVotersResponse>({
        queryKey: ['community', 'comments', 'voters', commentId],
        queryFn: () => getCommentVoters(commentId as string),
        enabled: enabled && !!commentId,
    });

// ─── Comments ─────────────────────────────────────────────────────────────────

export const getComments = async (postId: string): Promise<CommunityComment[]> => {
    const { data } = await api.get<CommunityComment[]>(
        `/api/community/posts/${postId}/comments`,
    );
    return data;
};

export const useComments = (postId: string | null, enabled = true) =>
    useQuery<CommunityComment[]>({
        queryKey: ['community', 'comments', postId],
        queryFn: () => getComments(postId as string),
        enabled: enabled && !!postId,
    });

export const createComment = async ({
    postId,
    body,
}: {
    postId: string;
    body: string;
}): Promise<CommunityComment> => {
    const { data } = await api.post<CommunityComment>(
        `/api/community/posts/${postId}/comments`,
        { body },
    );
    return data;
};

/**
 * Bump `commentsCount` on the matching post in every cached feed page and on
 * the post-detail cache by `delta` (positive for create, negative for delete).
 * Kept in sync with the comments list so the post card's counter updates the
 * moment a comment is added or removed, without a feed refetch round-trip.
 */
const adjustPostCommentsCount = (
    queryClient: ReturnType<typeof useQueryClient>,
    postId: string,
    delta: number,
) => {
    queryClient.setQueriesData<FeedQueryData>(
        { queryKey: ['community', 'feed'] },
        (curr) => {
            if (!curr) return curr;
            return {
                ...curr,
                pages: curr.pages.map((page) => ({
                    ...page,
                    items: page.items.map((p) =>
                        p.id === postId
                            ? { ...p, commentsCount: Math.max(0, (p.commentsCount ?? 0) + delta) }
                            : p,
                    ),
                })),
            };
        },
    );
    const prevPost = queryClient.getQueryData<CommunityPost>([
        'community',
        'post',
        postId,
    ]);
    if (prevPost) {
        queryClient.setQueryData<CommunityPost>(['community', 'post', postId], {
            ...prevPost,
            commentsCount: Math.max(0, (prevPost.commentsCount ?? 0) + delta),
        });
    }
};

export const useCreateCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createComment,
        onSuccess: (created, vars) => {
            // Append the new comment into the cached list directly so the count
            // and the rendered list stay consistent without a refetch flash.
            queryClient.setQueryData<CommunityComment[] | undefined>(
                ['community', 'comments', vars.postId],
                (curr) => (curr ? [...curr, created] : curr),
            );
            adjustPostCommentsCount(queryClient, vars.postId, 1);
        },
    });
};

export const replyToComment = async ({
    commentId,
    body,
}: {
    commentId: string;
    body: string;
}): Promise<CommunityComment> => {
    const { data } = await api.post<CommunityComment>(
        `/api/community/comments/${commentId}/replies`,
        { body },
    );
    return data;
};

export const useReplyToCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: replyToComment,
        onSuccess: (reply, { commentId }) => {
            // Append the new reply under its parent in every cached comment list.
            queryClient.setQueriesData<CommunityComment[] | undefined>(
                { queryKey: ['community', 'comments'] },
                (curr) =>
                    curr
                        ? mapCommentTree(curr, commentId, (parent) => ({
                              ...parent,
                              replies: [...(parent.replies ?? []), reply],
                          }))
                        : curr,
            );
        },
    });
};

export const deleteComment = async (commentId: string): Promise<void> => {
    await api.delete(`/api/community/comments/${commentId}`);
};

/** Remove a comment (and any of its replies) from a comment tree. Pure. */
const removeCommentFromTree = (
    nodes: CommunityComment[],
    targetId: string,
): CommunityComment[] =>
    nodes
        .filter((c) => c.id !== targetId)
        .map((c) =>
            c.replies && c.replies.length > 0
                ? { ...c, replies: removeCommentFromTree(c.replies, targetId) }
                : c,
        );

/**
 * Locate which post owns the comment `commentId` and whether it sits at the
 * top level (vs. as a reply). We rely on the cached comment lists keyed by
 * postId: `['community', 'comments', postId]`. Only top-level deletions
 * decrement `commentsCount` — replies are not tracked by that counter
 * (mirrors the create/reply path, where reply creation also doesn't bump it).
 */
const locateCommentInCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    commentId: string,
): { postId: string; isTopLevel: boolean } | null => {
    const queries = queryClient.getQueriesData<CommunityComment[] | undefined>({
        queryKey: ['community', 'comments'],
    });
    for (const [key, data] of queries) {
        if (!data) continue;
        const postId = (key as unknown[])[2] as string | undefined;
        if (!postId) continue;
        if (data.some((c) => c.id === commentId)) {
            return { postId, isTopLevel: true };
        }
        if (data.some((c) => (c.replies ?? []).some((r) => r.id === commentId))) {
            return { postId, isTopLevel: false };
        }
    }
    return null;
};

export const useDeleteCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteComment,
        onMutate: async (commentId) => {
            await queryClient.cancelQueries({ queryKey: ['community', 'comments'] });

            const located = locateCommentInCache(queryClient, commentId);
            if (located?.isTopLevel) {
                await queryClient.cancelQueries({ queryKey: ['community', 'feed'] });
                await queryClient.cancelQueries({
                    queryKey: ['community', 'post', located.postId],
                });
            }

            const prev: { key: unknown[]; data: CommunityComment[] | undefined }[] = [];
            queryClient
                .getQueriesData<CommunityComment[] | undefined>({
                    queryKey: ['community', 'comments'],
                })
                .forEach(([key, data]) => {
                    prev.push({ key: key as unknown[], data });
                });

            // Snapshot feed + post-detail caches only when we're about to mutate
            // them, so we can roll back on error.
            const prevFeed: { key: unknown[]; data: FeedQueryData }[] = [];
            let prevPost: CommunityPost | undefined;
            if (located?.isTopLevel) {
                queryClient
                    .getQueriesData<FeedQueryData>({ queryKey: ['community', 'feed'] })
                    .forEach(([key, data]) => {
                        prevFeed.push({ key: key as unknown[], data });
                    });
                prevPost = queryClient.getQueryData<CommunityPost>([
                    'community',
                    'post',
                    located.postId,
                ]);
            }

            queryClient.setQueriesData<CommunityComment[] | undefined>(
                { queryKey: ['community', 'comments'] },
                (curr) => (curr ? removeCommentFromTree(curr, commentId) : curr),
            );

            if (located?.isTopLevel) {
                adjustPostCommentsCount(queryClient, located.postId, -1);
            }

            return { prev, prevFeed, prevPost, located };
        },
        onError: (_err, _vars, context) => {
            context?.prev.forEach(({ key, data }) => {
                queryClient.setQueryData(key, data);
            });
            context?.prevFeed.forEach(({ key, data }) => {
                queryClient.setQueryData(key, data);
            });
            if (context?.located?.isTopLevel && context.prevPost !== undefined) {
                queryClient.setQueryData(
                    ['community', 'post', context.located.postId],
                    context.prevPost,
                );
            }
        },
    });
};

// ─── Save / share ─────────────────────────────────────────────────────────────

export const savePost = async ({
    postId,
    saved,
}: {
    postId: string;
    saved: boolean;
}): Promise<void> => {
    await api.post(`/api/community/posts/${postId}/save`, { saved });
};

/** Apply a save transition to a post's `isSaved` + `savesCount`. Pure. */
const applySaveTransition = (post: CommunityPost, nextSaved: boolean): CommunityPost => {
    const prev = post.isSaved ?? false;
    if (prev === nextSaved) return post;
    const delta = nextSaved ? 1 : -1;
    return {
        ...post,
        isSaved: nextSaved,
        savesCount: Math.max(0, (post.savesCount ?? 0) + delta),
    };
};

export const useSavePostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: savePost,
        onMutate: async ({ postId, saved }) => {
            await queryClient.cancelQueries({ queryKey: ['community', 'feed'] });
            await queryClient.cancelQueries({ queryKey: ['community', 'post', postId] });

            const prevFeed: { key: unknown[]; data: FeedQueryData }[] = [];
            queryClient
                .getQueriesData<FeedQueryData>({ queryKey: ['community', 'feed'] })
                .forEach(([key, data]) => {
                    prevFeed.push({ key: key as unknown[], data });
                });
            const prevPost = queryClient.getQueryData<CommunityPost>([
                'community',
                'post',
                postId,
            ]);

            queryClient.setQueriesData<FeedQueryData>(
                { queryKey: ['community', 'feed'] },
                (curr) => {
                    if (!curr) return curr;
                    return {
                        ...curr,
                        pages: curr.pages.map((page) => ({
                            ...page,
                            items: page.items.map((p) =>
                                p.id === postId ? applySaveTransition(p, saved) : p,
                            ),
                        })),
                    };
                },
            );

            if (prevPost) {
                queryClient.setQueryData<CommunityPost>(
                    ['community', 'post', postId],
                    applySaveTransition(prevPost, saved),
                );
            }

            return { prevFeed, prevPost };
        },
        onError: (_err, { postId }, context) => {
            context?.prevFeed.forEach(({ key, data }) => {
                queryClient.setQueryData(key, data);
            });
            if (context?.prevPost !== undefined) {
                queryClient.setQueryData(['community', 'post', postId], context.prevPost);
            }
        },
        onSuccess: (_data, { postId }) => {
            queryClient.invalidateQueries({ queryKey: ['community', 'posts', 'saved'] });
            void postId;
        },
    });
};

export const sharePost = async (postId: string): Promise<void> => {
    await api.post(`/api/community/posts/${postId}/share`);
};

/** Increment a post's `sharesCount` in place. Pure. */
const applyShareIncrement = (post: CommunityPost): CommunityPost => ({
    ...post,
    sharesCount: (post.sharesCount ?? 0) + 1,
});

/**
 * Optimistic share ping. Increments the server-side `sharesCount` and updates
 * cached posts immediately so the UI reflects the action. Errors are silently
 * swallowed (the user already shared on their end) and the optimistic bump is
 * left in place; the next feed/detail refetch will reconcile.
 */
export const useSharePostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sharePost,
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: ['community', 'feed'] });
            await queryClient.cancelQueries({ queryKey: ['community', 'post', postId] });

            queryClient.setQueriesData<FeedQueryData>(
                { queryKey: ['community', 'feed'] },
                (curr) => {
                    if (!curr) return curr;
                    return {
                        ...curr,
                        pages: curr.pages.map((page) => ({
                            ...page,
                            items: page.items.map((p) =>
                                p.id === postId ? applyShareIncrement(p) : p,
                            ),
                        })),
                    };
                },
            );

            const prevPost = queryClient.getQueryData<CommunityPost>([
                'community',
                'post',
                postId,
            ]);
            if (prevPost) {
                queryClient.setQueryData<CommunityPost>(
                    ['community', 'post', postId],
                    applyShareIncrement(prevPost),
                );
            }
        },
    });
};

// ─── Reporting ────────────────────────────────────────────────────────────────

export const reportPost = async ({
    postId,
    reason,
}: {
    postId: string;
    reason: string;
}): Promise<void> => {
    await api.post(`/api/community/posts/${postId}/report`, { reason });
};

export const useReportPostMutation = () => useMutation({ mutationFn: reportPost });

export const reportComment = async ({
    commentId,
    reason,
}: {
    commentId: string;
    reason: string;
}): Promise<void> => {
    await api.post(`/api/community/comments/${commentId}/report`, { reason });
};

export const useReportCommentMutation = () => useMutation({ mutationFn: reportComment });
