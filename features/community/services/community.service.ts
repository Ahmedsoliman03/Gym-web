import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/utils/axios';
import type {
    CommentVoter,
    CommunityComment,
    CommunityPost,
    FeedPage,
    PostAuthor,
    VoteValue,
} from '../types';
import {
    toFeedPage,
    unwrapPostList,
    type RawFeedResponse,
    type RawPostListResponse,
} from './community.transforms';

// ─── Feed ─────────────────────────────────────────────────────────────────────

export const getFeed = async(): Promise<FeedPage> => {
    const { data } = await api.get<RawFeedResponse>(`/api/community/feed`);
    return toFeedPage(data);
};

export const useFeed = (enabled = true) =>
    useInfiniteQuery<FeedPage>({
        queryKey: ['community', 'feed'],
        queryFn: getFeed,

        initialPageParam: null as string | null,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled,
    });

// ─── Saved posts ──────────────────────────────────────────────────────────────

export const getSavedPosts = async (): Promise<CommunityPost[]> => {
    const { data } = await api.get<RawPostListResponse>('/api/community/posts/saved');
    return unwrapPostList(data);
};

export const useSavedPosts = (enabled = true) =>
    useQuery<CommunityPost[]>({
        queryKey: ['community', 'posts', 'saved'],
        queryFn: getSavedPosts,
        enabled,
    });

export const getMyPosts = async (): Promise<CommunityPost[]> => {
    const { data } = await api.get<RawPostListResponse>('/api/community/posts/mine');
    return unwrapPostList(data);
};

export const useMyPosts = (enabled = true) =>
    useQuery<CommunityPost[]>({
        queryKey: ['community', 'posts', 'mine'],
        queryFn: getMyPosts,
        enabled,
    });

export const getCoachPosts = async (coachProfileId: string): Promise<CommunityPost[]> => {
    const { data } = await api.get<RawPostListResponse>(
        `/api/community/coaches/${coachProfileId}/posts`,
    );
    return unwrapPostList(data);
};

export const useCoachPosts = (coachProfileId: string | null, enabled = true) =>
    useQuery<CommunityPost[]>({
        queryKey: ['community', 'posts', 'coach', coachProfileId],
        queryFn: () => getCoachPosts(coachProfileId as string),
        enabled: enabled && !!coachProfileId,
    });

export const getGymPosts = async (gymProfileId: string): Promise<CommunityPost[]> => {
    const { data } = await api.get<RawPostListResponse>(
        `/api/community/gyms/${gymProfileId}/posts`,
    );
    return unwrapPostList(data);
};

export const useGymPosts = (gymProfileId: string | null, enabled = true) =>
    useQuery<CommunityPost[]>({
        queryKey: ['community', 'posts', 'gym', gymProfileId],
        queryFn: () => getGymPosts(gymProfileId as string),
        enabled: enabled && !!gymProfileId,
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
    media: (File | string)[];
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
    media?: (File | string)[];
}

export const editPost = async (input: EditPostInput): Promise<CommunityPost> => {
    const formData = new FormData();
    formData.append('content', input.content);
    input.media?.forEach((file) => {
        if (file instanceof File) formData.append('media', file);
        else formData.append('media_urls', file);
    });

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
    await api.delete(`/api/community/posts/${postId}`, {
        transformResponse: (data) => data,
    });
};

export const useDeletePostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePost,
        onSuccess: (_data, postId) => {
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

            // Drop the post from flat lists (mine, saved, gym, coach)
            queryClient.setQueriesData<CommunityPost[] | undefined>(
                { queryKey: ['community', 'posts'] },
                (curr) => (Array.isArray(curr) ? curr.filter((p) => p.id !== postId) : curr),
            );

            // Clear the detail cache for this post too.
            queryClient.removeQueries({ queryKey: ['community', 'post', postId] });

            // Refetch active community queries to ensure sync with server.
            queryClient.invalidateQueries({ queryKey: ['community'] });
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

const applyVoteToVotersList = (
    list: CommentVoter[],
    me: PostAuthor,
    prevVote: VoteValue,
    nextVote: VoteValue,
    side: 'up' | 'down',
): CommentVoter[] => {
    let next = list;
    if (prevVote === side && nextVote !== side) {
        next = next.filter((v) => v.user.id !== me.id);
    }
    if (nextVote === side && prevVote !== side) {
        if (!next.some((v) => v.user.id === me.id)) {
            next = [{ user: me, value: side }, ...next];
        }
    }
    return next;
};

type FeedQueryData = { pages: FeedPage[]; pageParams: unknown[] } | undefined;
type PostListQueryData = CommunityPost[] | undefined;

const updateAllPostCaches = (
    queryClient: ReturnType<typeof useQueryClient>,
    postId: string,
    transform: (post: CommunityPost) => CommunityPost,
): {
    prevFeed: { key: unknown[]; data: FeedQueryData }[];
    prevLists: { key: unknown[]; data: PostListQueryData }[];
    prevPost: CommunityPost | undefined;
} => {
    const prevFeed: { key: unknown[]; data: FeedQueryData }[] = [];
    queryClient
        .getQueriesData<FeedQueryData>({ queryKey: ['community', 'feed'] })
        .forEach(([key, data]) => {
            prevFeed.push({ key: key as unknown[], data });
        });
    queryClient.setQueriesData<FeedQueryData>(
        { queryKey: ['community', 'feed'] },
        (curr) => {
            if (!curr) return curr;
            return {
                ...curr,
                pages: curr.pages.map((page) => ({
                    ...page,
                    items: page.items.map((p) => (p.id === postId ? transform(p) : p)),
                })),
            };
        },
    );

    const prevLists: { key: unknown[]; data: PostListQueryData }[] = [];
    queryClient
        .getQueriesData<PostListQueryData>({ queryKey: ['community', 'posts'] })
        .forEach(([key, data]) => {
            prevLists.push({ key: key as unknown[], data });
        });
    queryClient.setQueriesData<PostListQueryData>(
        { queryKey: ['community', 'posts'] },
        (curr) => (Array.isArray(curr) ? curr.map((p) => (p.id === postId ? transform(p) : p)) : curr),
    );

    const prevPost = queryClient.getQueryData<CommunityPost>([
        'community',
        'post',
        postId,
    ]);
    if (prevPost) {
        queryClient.setQueryData<CommunityPost>(
            ['community', 'post', postId],
            transform(prevPost),
        );
    }

    return { prevFeed, prevLists, prevPost };
};

/** Restore the snapshot returned by `updateAllPostCaches`. */
const restorePostCaches = (
    queryClient: ReturnType<typeof useQueryClient>,
    postId: string,
    snapshot: {
        prevFeed: { key: unknown[]; data: FeedQueryData }[];
        prevLists: { key: unknown[]; data: PostListQueryData }[];
        prevPost: CommunityPost | undefined;
    },
) => {
    snapshot.prevFeed.forEach(({ key, data }) => queryClient.setQueryData(key, data));
    snapshot.prevLists.forEach(({ key, data }) => queryClient.setQueryData(key, data));
    if (snapshot.prevPost !== undefined) {
        queryClient.setQueryData(['community', 'post', postId], snapshot.prevPost);
    }
};

export const useVotePostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: votePost,
        onMutate: async ({ postId, vote }) => {
            await queryClient.cancelQueries({ queryKey: ['community', 'feed'] });
            await queryClient.cancelQueries({ queryKey: ['community', 'posts'] });
            await queryClient.cancelQueries({ queryKey: ['community', 'post', postId] });
            await queryClient.cancelQueries({
                queryKey: ['community', 'posts', 'voters', postId],
            });

            const prevPostCache = queryClient.getQueryData<CommunityPost>([
                'community',
                'post',
                postId,
            ]);
            let prevVote: VoteValue = prevPostCache?.myVote ?? null;
            if (!prevPostCache) {
                const feeds =
                    queryClient.getQueriesData<FeedQueryData>({
                        queryKey: ['community', 'feed'],
                    }) ?? [];
                for (const [, data] of feeds) {
                    const hit = data?.pages
                        .flatMap((p) => p.items)
                        .find((p) => p.id === postId);
                    if (hit) {
                        prevVote = hit.myVote ?? null;
                        break;
                    }
                }
            }

            const snapshot = updateAllPostCaches(queryClient, postId, (p) =>
                applyVoteTransition(p, vote),
            );

            const me = optimisticAuthorFromCache(queryClient);
            const prevVoters = queryClient.getQueryData<PostVotersResponse>([
                'community',
                'posts',
                'voters',
                postId,
            ]);
            const baseVoters: PostVotersResponse = prevVoters ?? {
                upVotes: 0,
                downVotes: 0,
                upVoters: [],
                downVoters: [],
            };
            const upVoters = applyVoteToVotersList(
                baseVoters.upVoters,
                me,
                prevVote,
                vote,
                'up',
            );
            const downVoters = applyVoteToVotersList(
                baseVoters.downVoters,
                me,
                prevVote,
                vote,
                'down',
            );
            queryClient.setQueryData<PostVotersResponse>(
                ['community', 'posts', 'voters', postId],
                {
                    upVotes: upVoters.length,
                    downVotes: downVoters.length,
                    upVoters,
                    downVoters,
                },
            );

            return { ...snapshot, prevVoters };
        },
        onError: (_err, { postId }, context) => {
            if (context) restorePostCaches(queryClient, postId, context);
            if (context?.prevVoters !== undefined) {
                queryClient.setQueryData(
                    ['community', 'posts', 'voters', postId],
                    context.prevVoters,
                );
            } else {
                queryClient.removeQueries({
                    queryKey: ['community', 'posts', 'voters', postId],
                });
            }
        },
        onSuccess: (_data, { postId }) => {
            queryClient.invalidateQueries({
                queryKey: ['community', 'posts', 'voters', postId],
            });
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

const applyCommentVoteTransition = (
    comment: CommunityComment,
    nextVote: VoteValue,
    me: PostAuthor,
): CommunityComment => {
    const prevVote = comment.myVote;
    if (prevVote === nextVote) return comment;
    let upVotes = comment.upVotes ?? 0;
    let downVotes = comment.downVotes ?? 0;
    if (prevVote === 'up') upVotes -= 1;
    if (prevVote === 'down') downVotes -= 1;
    if (nextVote === 'up') upVotes += 1;
    if (nextVote === 'down') downVotes += 1;
    const upVoters = applyVoteToVotersList(
        comment.upVoters ?? [],
        me,
        prevVote,
        nextVote,
        'up',
    );
    const downVoters = applyVoteToVotersList(
        comment.downVoters ?? [],
        me,
        prevVote,
        nextVote,
        'down',
    );
    return {
        ...comment,
        myVote: nextVote,
        upVotes,
        downVotes,
        score: upVotes - downVotes,
        upVoters,
        downVoters,
    };
};

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

            const me = optimisticAuthorFromCache(queryClient);
            queryClient.setQueriesData<CommentsQueryData>(
                { queryKey: ['community', 'comments'] },
                (curr) =>
                    curr
                        ? mapCommentTree(curr, commentId, (c) =>
                              applyCommentVoteTransition(c, vote, me),
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

interface RawPostVotersResponse {
    upVotes?: number;
    downVotes?: number;
    upVoters?: unknown[];
    downVoters?: unknown[];
    voters?: unknown[];
}

export interface PostVotersResponse {
    upVotes: number;
    downVotes: number;
    upVoters: CommentVoter[];
    downVoters: CommentVoter[];
}

const normalizeVoter = (raw: unknown): CommentVoter | null => {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    // Already nested as `{user, value, votedAt}`.
    if (r.user && typeof r.user === 'object') {
        return r as unknown as CommentVoter;
    }
    // Flat author shape — wrap it.
    if (typeof r.id === 'string' && typeof r.fullName === 'string') {
        return {
            user: {
                id: r.id as string,
                profileId: (r.profileId as string) ?? (r.id as string),
                fullName: r.fullName as string,
                userType: (r.userType as PostAuthor['userType']) ?? 'client',
                photo: (r.photo as string | null | undefined) ?? null,
            },
            value: (r.vote as VoteValue) ?? null,
        };
    }
    return null;
};

const normalizeVoters = (raw?: unknown[]): CommentVoter[] =>
    (raw ?? []).map(normalizeVoter).filter((v): v is CommentVoter => v !== null);

export const getPostVoters = async (postId: string): Promise<PostVotersResponse> => {
    const { data } = await api.get<RawPostVotersResponse>(
        `/api/community/posts/${postId}/votes`,
    );
    let upVoters = normalizeVoters(data.upVoters);
    let downVoters = normalizeVoters(data.downVoters);
    if (upVoters.length === 0 && downVoters.length === 0 && data.voters) {
        const all = normalizeVoters(data.voters);
        upVoters = all.filter((v) => v.value !== 'down');
        downVoters = all.filter((v) => v.value === 'down');
    }
    return {
        upVotes: data.upVotes ?? upVoters.length,
        downVotes: data.downVotes ?? downVoters.length,
        upVoters,
        downVoters,
    };
};

export const usePostVoters = (postId: string | null, enabled = true) =>
    useQuery<PostVotersResponse>({
        queryKey: ['community', 'posts', 'voters', postId],
        queryFn: () => getPostVoters(postId as string),
        enabled: enabled && !!postId,
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

const adjustPostCommentsCount = (
    queryClient: ReturnType<typeof useQueryClient>,
    postId: string,
    delta: number,
) => {
    const bump = (p: CommunityPost): CommunityPost => ({
        ...p,
        commentsCount: Math.max(0, (p.commentsCount ?? 0) + delta),
    });
    updateAllPostCaches(queryClient, postId, bump);
};

const optimisticAuthorFromCache = (
    queryClient: ReturnType<typeof useQueryClient>,
): PostAuthor => {
    const profile = queryClient.getQueryData<{
        id: string;
        fullName: string;
        userType: PostAuthor['userType'];
        profile?: { id?: string; photo?: string | null };
    }>(['profile']);
    return {
        id: profile?.id ?? 'me',
        profileId: profile?.profile?.id ?? profile?.id ?? 'me',
        fullName: profile?.fullName ?? '',
        userType: profile?.userType ?? 'client',
        photo: profile?.profile?.photo ?? null,
    };
};

export const useCreateCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createComment,
        onMutate: async (vars) => {
            await queryClient.cancelQueries({
                queryKey: ['community', 'comments', vars.postId],
            });

            const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const optimistic: CommunityComment = {
                id: tempId,
                author: optimisticAuthorFromCache(queryClient),
                body: vars.body,
                upVotes: 0,
                downVotes: 0,
                score: 0,
                myVote: null,
                createdAt: new Date().toISOString(),
                replies: [],
            };

            const prevComments = queryClient.getQueryData<CommunityComment[]>([
                'community',
                'comments',
                vars.postId,
            ]);
            queryClient.setQueryData<CommunityComment[] | undefined>(
                ['community', 'comments', vars.postId],
                (curr) => (curr ? [optimistic, ...curr] : [optimistic]),
            );
            adjustPostCommentsCount(queryClient, vars.postId, 1);

            return { tempId, prevComments };
        },
        onError: (_err, vars, context) => {
            // Drop the placeholder and undo the count bump.
            if (context) {
                queryClient.setQueryData<CommunityComment[] | undefined>(
                    ['community', 'comments', vars.postId],
                    context.prevComments,
                );
                adjustPostCommentsCount(queryClient, vars.postId, -1);
            }
        },
        onSuccess: (created, vars, context) => {
            queryClient.setQueryData<CommunityComment[] | undefined>(
                ['community', 'comments', vars.postId],
                (curr) =>
                    curr
                        ? curr.map((c) => (c.id === context?.tempId ? created : c))
                        : [created],
            );
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
            await queryClient.cancelQueries({ queryKey: ['community', 'posts'] });
            await queryClient.cancelQueries({ queryKey: ['community', 'post', postId] });

            const snapshot = updateAllPostCaches(queryClient, postId, (p) =>
                applySaveTransition(p, saved),
            );
            return snapshot;
        },
        onError: (_err, { postId }, context) => {
            if (context) restorePostCaches(queryClient, postId, context);
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

export const useSharePostMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sharePost,
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: ['community', 'feed'] });
            await queryClient.cancelQueries({ queryKey: ['community', 'posts'] });
            await queryClient.cancelQueries({ queryKey: ['community', 'post', postId] });

            const snapshot = updateAllPostCaches(queryClient, postId, applyShareIncrement);
            return snapshot;
        },
        onError: (_err, postId, context) => {
            if (context) restorePostCaches(queryClient, postId, context);
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
