import type { AppNotification } from "../types";

/** Where a notification should take the user when clicked.
 *  - `{ chatConversationId }` → open the chat side-widget on that conversation
 *    (chat has no standalone route; it lives in the overlay panel).
 *  - `{ href }` → a real in-app path to push through the locale-aware router.
 *  - `null` → nothing actionable.
 *
 *  The backend's `notification.link` uses its own URL scheme
 *  (`/community/posts/<id>`, `/chat/conversations/<id>`) that does NOT match
 *  this app's routes (`/community/<id>`, no chat route). So we derive the
 *  target from `type` + `data` instead of trusting `link`. */
export type NotificationTarget =
    | { chatConversationId: string }
    | { href: string }
    | null;

/** Fallback: derive the target from the backend `link` when the structured
 *  `data` is missing the ids we need. The backend's link scheme differs from
 *  this app's routes — it emits `/community/posts/<id>?commentId=<id>`,
 *  `/chat/conversations/<id>`, `/jobs/<id>` — so we parse it and re-map onto
 *  the app's actual paths (`/community/<id>`, the chat overlay, `/jobs/<id>`). */
const targetFromLink = (link?: string): NotificationTarget => {
    if (!link) return null;
    try {
        // Base is irrelevant; we only read pathname + search.
        const url = new URL(link, "http://x");
        const seg = url.pathname.split("/").filter(Boolean);

        if (seg[0] === "community" && seg[1] === "posts" && seg[2]) {
            const commentId = url.searchParams.get("commentId");
            return {
                href: commentId
                    ? `/community/${seg[2]}?commentId=${commentId}`
                    : `/community/${seg[2]}`,
            };
        }
        if (seg[0] === "chat" && seg[1] === "conversations" && seg[2]) {
            return { chatConversationId: seg[2] };
        }
        if (seg[0] === "jobs" && seg[1]) {
            return { href: `/jobs/${seg[1]}` };
        }
    } catch {
        /* malformed link — fall through to null */
    }
    return null;
};

export const resolveNotificationTarget = (notification: AppNotification): NotificationTarget => {
    const { type, data, link } = notification;

    switch (type) {
        case "chat_message":
            return data.conversationId
                ? { chatConversationId: data.conversationId }
                : targetFromLink(link);

        case "post_vote":
        case "post_comment":
        case "comment_reply":
            // Prefer the structured id; fall back to the server `link` when the
            // realtime/REST payload didn't populate `data.postId`. Without this
            // fallback an empty `data` made the click a silent no-op.
            if (!data.postId) return targetFromLink(link);
            // The post detail page reads only the id segment; commentId is
            // carried as a harmless query param for future deep-linking.
            return {
                href: data.commentId
                    ? `/community/${data.postId}?commentId=${data.commentId}`
                    : `/community/${data.postId}`,
            };

        case "job_application":
            return { href: data.jobId ? `/jobs/${data.jobId}` : "/applications" };

        default:
            return targetFromLink(link);
    }
};
