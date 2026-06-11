import type { ChatRequest, ChatRequestOutcome } from '../types';

/** Normalize a ChatRequest's wire shape into the three outcomes the UI
 *  renders. The textual `status` field is unreliable across backend
 *  versions — it may stay at `'pending'` even after a response is recorded,
 *  or collapse approved/rejected into a generic `'finished'`. So we treat
 *  `respondedAt` (and a populated `conversation`) as the authoritative
 *  "has been acted on" signals, and only fall back to `status` when those
 *  aren't conclusive. */
export const getRequestOutcome = (req: ChatRequest): ChatRequestOutcome => {
    const acted =
        req.respondedAt != null ||
        req.conversation != null ||
        req.status === 'approved' ||
        req.status === 'rejected' ||
        req.status === 'finished';

    if (!acted) return 'pending';
    if (req.status === 'approved') return 'approved';
    if (req.status === 'rejected') return 'rejected';
    return req.conversation ? 'approved' : 'rejected';
};
