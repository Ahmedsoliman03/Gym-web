import { User as UserIcon } from 'lucide-react';
import { initials } from '../utils/format';

const styles = {
    avatar:
        'w-11 h-11 rounded-full overflow-hidden bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0',
    avatarImg: 'w-full h-full object-cover',
};

export const ChatRowAvatar = ({
    photo,
    name,
}: {
    photo: string | null | undefined;
    name: string;
}) => (
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
);
