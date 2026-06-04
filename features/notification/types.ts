export interface ApplyNotificationItemProps {
    title: string;
    desc: string;
    time: string;
    isUnread?: boolean;
    onClick?: () => void;
}

export interface ChatNotificationItemProps {
    title: string;
    desc: string;
    time: string;
    isUnread?: boolean;
    onClick?: () => void;
}
