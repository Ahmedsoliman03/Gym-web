// Re-export shim kept for backward compatibility. The chat socket layer now
// lives in a modular structure: see ./ChatProvider, ./socket, ./reconnect,
// ./heartbeat, ./queue, and ./handlers/*.
export {
    ChatSocketProvider,
    useChatSocket,
    type ChatSocketStatus,
    type ChatSocketActions,
    type ChatSocketContextValue,
} from './ChatProvider';
