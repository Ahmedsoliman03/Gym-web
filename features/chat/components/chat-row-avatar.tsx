import { User as UserIcon } from 'lucide-react';
import type { PresenceStatus } from '../types';
import { initials } from '../utils/format';

const styles = {
    wrap: 'relative shrink-0',
    avatar:
        'w-11 h-11 rounded-full overflow-hidden bg-primary/20 border border-primary/30 flex items-center justify-center text-primary',
    avatarImg: 'w-full h-full object-cover',
    presence: (status: PresenceStatus) =>
        `absolute bottom-0 end-0 h-3 w-3 rounded-full ring-2 ring-background ${
            status === 'online'
                ? 'bg-green-500'
                : status === 'busy'
                  ? 'bg-amber-500'
                  : 'bg-gray-500'
        }`,
};

export const ChatRowAvatar = ({
    photo,
    name,
    status = 'offline',
}: {
    photo: string | null | undefined;
    name: string;
    /** Realtime presence. Defaults to `offline` so every avatar shows a dot
     *  until the socket reports a live status. */
    status?: PresenceStatus;
}) => (
    <div className={styles.wrap}>
        <div className={styles.avatar}>
            {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={name} className={styles.avatarImg} />
            ) : (
                <span className="text-sm font-black">
                    {initials(name) || <UserIcon size={18} />}
                </span>
            )}
        </div>
        <span className={styles.presence(status)} title={status} />
    </div>
);
