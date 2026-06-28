/**
 * Registry mapping backend error `code`s to friendly, already-localized
 * messages. `toastApiError` consults this first, so a known code (e.g.
 * `feature_limit_exceeded`) always surfaces a static, translated message
 * instead of the raw English string the API returns.
 *
 * The map is populated once at runtime by {@link ApiErrorMessagesProvider},
 * which has access to next-intl translations. Utilities that can't call hooks
 * (like `toastApiError`) read it through {@link getApiErrorCodeMessage}.
 */
let codeMessages: Record<string, string> = {};

export const setApiErrorCodeMessages = (messages: Record<string, string>) => {
    codeMessages = messages;
};

export const getApiErrorCodeMessage = (code?: string): string | undefined =>
    code ? codeMessages[code] : undefined;
