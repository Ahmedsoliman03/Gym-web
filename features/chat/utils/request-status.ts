import type { ChatRequest, ChatRequestOutcome } from '../types';

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
