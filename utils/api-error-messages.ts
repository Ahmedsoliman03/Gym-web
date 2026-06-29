let codeMessages: Record<string, string> = {};

export const setApiErrorCodeMessages = (messages: Record<string, string>) => {
    codeMessages = messages;
};

export const getApiErrorCodeMessage = (code?: string): string | undefined =>
    code ? codeMessages[code] : undefined;
