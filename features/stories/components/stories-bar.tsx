'use client';

import { useStories } from '../services/stories.service';
import type { StoryAuthor } from '../types';

interface StoriesBarProps {
    userType: StoryAuthor['userType'];
}

const styles = {
    wrapper: "w-full overflow-x-auto pb-3",
    track: "flex gap-4",
    item: "flex flex-col items-center gap-2 shrink-0",
    ring: "relative inline-block w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-primary via-primary/80 to-primary/30",
    inner: "block relative w-full h-full rounded-full overflow-hidden bg-white/5",
    image: "block w-full h-full object-cover",
    placeholder: "flex w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center text-primary font-black",
    label: "text-[10px] font-bold text-foreground/60 uppercase truncate max-w-[80px]",
    skeleton: "w-20 h-20 rounded-full bg-white/5 animate-pulse shrink-0",
};

export function StoriesBar({ userType }: StoriesBarProps) {
    const { data, isLoading } = useStories();

    if (isLoading) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.track}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={styles.skeleton} />
                    ))}
                </div>
            </div>
        );
    }

    const stories = (data ?? []).filter((s) => s.author.userType === userType);
    if (stories.length === 0) return null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.track}>
                {stories.map((story) => {
                    const media = story?.media?.[0]?.file;
                    const initial = story?.author?.fullName?.trim()?.[0]?.toUpperCase() ?? '?';
                    return (
                        <button key={story?.id} type="button" className={styles.item}>
                            <span className={styles.ring}>
                                <span className={styles.inner}>
                                    {media ? (
                                        <img
                                            src={media}
                                            alt={story.author.fullName}
                                            className={styles.image}
                                        />
                                    ) : (
                                        <span className={styles.placeholder}>{initial}</span>
                                    )}
                                </span>
                            </span>
                            <span className={styles.label}>{story.author.fullName}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
