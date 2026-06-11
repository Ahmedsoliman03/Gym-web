'use client';

import { useChatRequests } from '../services/chat.service';
import { getRequestOutcome } from '../utils/request-status';

export const usePendingIncomingCount = (): number => {
    const { data } = useChatRequests('incoming');
    if (!data) return 0;
    return data.reduce(
        (acc, req) => (getRequestOutcome(req) === 'pending' ? acc + 1 : acc),
        0,
    );
};
