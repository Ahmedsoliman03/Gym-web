import { Loader2, X } from 'lucide-react';
import type { ReactNode } from 'react';

const styles = {
    centerState:
        'flex flex-col items-center justify-center text-center py-10 gap-3',
    centerIcon:
        'w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-foreground/40',
    centerText: 'text-sm text-foreground/50',
};

export const ChatLoadingState = ({ label }: { label: string }) => (
    <div className={styles.centerState}>
        <Loader2 size={28} className="text-primary animate-spin" />
        <span className={styles.centerText}>{label}</span>
    </div>
);

export const ChatErrorState = ({ label }: { label: string }) => (
    <div className={styles.centerState}>
        <div className={styles.centerIcon}>
            <X size={20} />
        </div>
        <span className={styles.centerText}>{label}</span>
    </div>
);

export const ChatEmptyState = ({
    icon,
    label,
}: {
    icon: ReactNode;
    label: string;
}) => (
    <div className={styles.centerState}>
        <div className={styles.centerIcon}>{icon}</div>
        <span className={styles.centerText}>{label}</span>
    </div>
);
