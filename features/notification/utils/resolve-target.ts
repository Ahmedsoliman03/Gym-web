import type { AppNotification } from "../types";

/** Where a notification should take the user when clicked.
 *  - `{ href }` → a real in-app path to push through the locale-aware router.
 *  - `null` → nothing actionable.
 *
 *  The backend's `notification.link` uses its own URL scheme
 *  (`/community/posts/<id>`) that does NOT match this app's routes
 *  (`/community/<id>`). So we derive the target from `type` + `data`
 *  instead of trusting `link`. */
export type NotificationTarget =
    | { href: string }
    | null;

/** Build a `/community/<postId>` href, appending `commentId` / `replyId` as
 *  query params when present so the detail page can scroll to (and flash) the
 *  exact comment or reply the notification referred to. */
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

/** Fallback for the community-post notifications: when the payload didn't
 *  populate `data.postId`, parse the post id (and any comment/reply anchor)
 *  out of the backend `link` (`/community/posts/<id>?commentId=<id>`) and
 *  re-map it onto this app's `/community/<id>` route. Without this an empty
 *  `data` made the click a silent no-op. */
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

        case "post_comment":
            // Anchor to the commented-on comment so the page scrolls to it.
            if (!data.postId) return postHrefFromLink(link);
            return postHref(data.postId, data.commentId);

        case "comment_reply":
            // Anchor to the reply (with its parent comment so the thread opens).
            if (!data.postId) return postHrefFromLink(link);
            return postHref(data.postId, data.commentId, data.replyId);

        case "job_application":
            return { href: "/applications" };
            // The recipient is the gym: land on their applications list,
            // pre-filtered to the job that was applied to. The page resolves
            // `jobId` → its title and selects the job-title filter.
            return {
                href: data.jobId
                    ? `/applications?jobId=${data.jobId}`
                    : "/applications",
            };

        default:
            return null;
    }
};
