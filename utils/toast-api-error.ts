import toast from 'react-hot-toast';
import { getApiErrorCodeMessage } from './api-error-messages';

type FieldMessage = { field?: string; message?: string };

type ApiErrorEnvelope = {
    code?: string;
    message?: string;
    messages?: FieldMessage[];
    fields?: Record<string, string[]>;
};

type ApiErrorResponse = {
    error?: ApiErrorEnvelope;
    message?: string;
    messages?: FieldMessage[];
    fields?: Record<string, string[]>;
};

// Surface backend validation errors as toasts. When the response includes a
// per-field `messages` array (or a `fields` map), each field's message gets
// its own toast so the user sees every problem at once instead of just the
// first one. Falls back to a single toast for non-field errors.
export const toastApiError = (error: unknown, fallback: string) => {
    const data = (error as { response?: { data?: ApiErrorResponse } })?.response?.data;
    const envelope: ApiErrorEnvelope | undefined = data?.error ?? data;

    // Known error codes (e.g. feature_limit_exceeded) get a friendly, localized
    // static message — shown instead of the raw backend text.
    const friendly = getApiErrorCodeMessage(envelope?.code ?? data?.error?.code);
    if (friendly) {
        toast.error(friendly);
        return;
    }

    const messages = envelope?.messages;
    if (Array.isArray(messages) && messages.length > 0) {
        const seen = new Set<string>();
        messages.forEach((m) => {
            const text = m?.message?.trim();
            if (!text || seen.has(text)) return;
            seen.add(text);
            toast.error(text);
        });
        return;
    }

    const fields = envelope?.fields;
    if (fields && typeof fields === 'object') {
        const seen = new Set<string>();
        let shown = false;
        Object.values(fields).forEach((list) => {
            if (!Array.isArray(list)) return;
            list.forEach((text) => {
                const trimmed = typeof text === 'string' ? text.trim() : '';
                if (!trimmed || seen.has(trimmed)) return;
                seen.add(trimmed);
                toast.error(trimmed);
                shown = true;
            });
        });
        if (shown) return;
    }

    const single = envelope?.message?.trim() || data?.message?.trim();
    toast.error(single || fallback);
};
