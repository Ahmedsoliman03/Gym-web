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

/** Fallback for the community-post notifications: when the payload didn't
 *  populate `data.postId`, parse the post id out of the backend `link`
 *  (`/community/posts/<id>...`) and re-map it onto this app's `/community/<id>`
 *  route. Without this an empty `data` made the click a silent no-op. */
const postHrefFromLink = (link?: string): NotificationTarget => {
    if (!link) return null;
    try {
        // Base is irrelevant; we only read the pathname segments.
        const url = new URL(link, "http://x");
        const seg = url.pathname.split("/").filter(Boolean);
        if (seg[0] === "community" && seg[1] === "posts" && seg[2]) {
            return { href: `/community/${seg[2]}` };
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
        case "post_comment":
        case "comment_reply":
            // Route to the post detail page only — no commentId deep-link.
            if (!data.postId) return postHrefFromLink(link);
            return { href: `/community/${data.postId}` };

        case "job_application":
            return { href: "/applications" };

        default:
            return null;
    }
};
