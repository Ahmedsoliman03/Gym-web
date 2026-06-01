'use client';

import { useRef, ChangeEvent } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useCreateStoryMutation } from '../services/stories.service';

const styles = {
    badge: "absolute bottom-1 right-1 z-20 w-9 h-9 rounded-full bg-primary text-primary-foreground border-4 border-surface flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform disabled:opacity-60 disabled:cursor-wait",
    spinner: "absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin pointer-events-none",
};

export function StoryAvatarBadge() {
    const t = useTranslations('Stories');
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync, isPending } = useCreateStoryMutation();

    const openPicker = () => {
        if (isPending) return;
        inputRef.current?.click();
    };

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.currentTarget.files?.[0] ?? null;
        e.currentTarget.value = '';
        if (!file) return;
        try {
            await mutateAsync(file);
            toast.success(t('uploadSuccess'));
        } catch {
            toast.error(t('uploadError'));
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={openPicker}
                disabled={isPending}
                aria-label={isPending ? t('uploading') : t('addStory')}
                className={styles.badge}
            >
                <Plus size={16} />
                {isPending && <span className={styles.spinner} />}
            </button>
        </>
    );
}
