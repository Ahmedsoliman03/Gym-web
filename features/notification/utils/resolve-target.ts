import type { AppNotification } from "../types";

export type NotificationTarget =
    | { href: string }
    | null;

const postHref = (
    postId: string,
    commentId?: string,
    replyId?: string,
): NotificationTarget => {
    const params = new URLSearchParams();
    if (commentId) params.set("commentId", commentId);
    if (replyId) params.set("replyId", replyId);
    const qs = params.toString();
    return { href: `/community/${postId}${qs ? `?${qs}` : ""}` };
};

const postHrefFromLink = (link?: string): NotificationTarget => {
    if (!link) return null;
    try {
        // Base is irrelevant; we only read the pathname segments.
        const url = new URL(link, "http://x");
        const seg = url.pathname.split("/").filter(Boolean);
        if (seg[0] === "community" && seg[1] === "posts" && seg[2]) {
            return postHref(
                seg[2],
                url.searchParams.get("commentId") ?? undefined,
                url.searchParams.get("replyId") ?? undefined,
            );
        }
    } catch {
        /* malformed link — fall through to null */
    }
    return null;
};

export const resolveNotificationTarget = (notification: AppNotification): NotificationTarget => {
    const { type, data, link } = notification;

    switch (type) {
        case "post_vote":
            // A vote has no comment anchor — land on the post itself.
            if (!data.postId) return postHrefFromLink(link);
            return postHref(data.postId);

        case "post_share":
            if (!data.postId) return postHrefFromLink(link);
            return postHref(data.postId);

        case "post_comment":
            // Anchor to the commented-on comment so the page scrolls to it.
            if (!data.postId) return postHrefFromLink(link);
            return postHref(data.postId, data.commentId);

        case "comment_vote":
            if (!data.postId) return postHrefFromLink(link);
            return postHref(data.postId, data.commentId);

        case "comment_reply":
            // Anchor to the reply (with its parent comment so the thread opens).
            if (!data.postId) return postHrefFromLink(link);
            return postHref(data.postId, data.commentId, data.replyId);

        case "reply_vote":
            if (!data.postId) return postHrefFromLink(link);
            return postHref(data.postId, data.commentId, data.replyId);

        case "job_application":
            return {
                href: data.jobId
                    ? `/applications?jobId=${data.jobId}`
                    : "/applications",
            };

        default:
            return null;
    }
};
