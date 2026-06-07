'use client';

import { useMemo, useState } from 'react';
import { useStories } from '../services/stories.service';
import { useProfileQuery } from '@/features/profile/services/profile.service';
import type { AuthorGroup, StoriesBarProps, Story } from '../types';
import { StoryViewerModal } from './story-viewer-modal';

const styles = {
    wrapper: "w-full overflow-x-auto pb-3 mb-8",
    track: "flex gap-4",
    item: "flex flex-col items-center gap-2 shrink-0",
    // Green gradient ring — shown when the user has at least one unviewed
    // story in this group.
    ring: "relative inline-block w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-primary via-primary/80 to-primary/30",
    // Muted gray ring — shown when every story in this group has been viewed.
    ringViewed: "relative inline-block w-20 h-20 rounded-full p-[3px] bg-white/15",
    inner: "block relative w-full h-full rounded-full overflow-hidden bg-white/5",
    image: "block w-full h-full object-cover",
    placeholder: "flex w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 items-center justify-center text-primary font-black",
    label: "text-[10px] font-bold text-foreground/60 uppercase truncate max-w-[80px]",
    skeleton: "w-20 h-20 rounded-full bg-white/5 animate-pulse shrink-0",
};

/**
 * Find the first unviewed story in playback order. The viewer modal reverses
 * the stories array internally (newest LAST) so we mirror that reversal here
 * before searching; the returned index then lines up with the modal's
 * `initialStoryIndex` and we land on the actual first unviewed slide.
 */
function firstUnviewedPlaybackIndex(stories: Story[]): number {
    const playback = [...stories].reverse();
    const idx = playback.findIndex((s) => s?.isViewed === false);
    return idx >= 0 ? idx : 0;
}

function groupByAuthor(stories: Story[]): AuthorGroup[] {
    const groups = new Map<string, AuthorGroup>();
    for (const story of stories) {
        const author = story?.author;
        if (!author) continue;
        const key = author.id ?? `name:${author.fullName}:${author.userType}`;
        const existing = groups.get(key);
        if (existing) {
            existing.stories.push(story);
        } else {
            groups.set(key, { key, author, stories: [story] });
        }
    }
    return Array.from(groups.values());
}

export function StoriesBar({ userType }: StoriesBarProps) {
    // The bar must only fire the stories API after `/api/me` has confirmed an
    // authenticated session. The `user_type` cookie alone is not reliable —
    // it can be stale after an expired token or a partial logout.
    const profileQuery = useProfileQuery();
    const isLoggedIn = profileQuery.isSuccess && Boolean(profileQuery.data);

    const { data, isLoading } = useStories(isLoggedIn);
    // We track the open group by its stable `key` rather than its index in the
    // sorted array — once a story is viewed, the cache patch flips `isViewed`
    // and the sort below moves the group, so an index would point at a
    // different author mid-viewing.
    const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);

    const groups = useMemo(() => {
        const filtered = (data ?? []).filter((s) => s?.author?.userType === userType);
        const grouped = groupByAuthor(filtered);
        // Surface groups that still have at least one unviewed story first, so
        // the user sees fresh content at the head of the bar. `Array.sort` in
        // modern JS engines is stable, so groups with the same viewed-state
        // keep the API's original order relative to each other.
        return [...grouped].sort((a, b) => {
            const aUnviewed = a.stories.some((s) => s?.isViewed === false) ? 1 : 0;
            const bUnviewed = b.stories.some((s) => s?.isViewed === false) ? 1 : 0;
            return bUnviewed - aUnviewed;
        });
    }, [data, userType]);

    if (!isLoggedIn) return null;

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

    if (groups.length === 0) return null;

    const openGroup =
        openGroupKey !== null
            ? groups.find((g) => g.key === openGroupKey) ?? null
            : null;
    const openGroupInitialIndex = openGroup
        ? firstUnviewedPlaybackIndex(openGroup.stories)
        : 0;

    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.track}>
                    {groups.map((group) => {
                        const cover =
                            group.author.profileImage ?? group.stories.at(-1)?.media?.at(-1)?.file;
                        const initial =
                            group.author.fullName?.trim()?.[0]?.toUpperCase() ?? '?';
                        // `isViewed === false` is intentional: if the field is
                        // missing (older response shapes), don't treat it as
                        // unviewed — fall back to gray so the UI is stable.
                        const hasUnviewed = group.stories.some(
                            (s) => s?.isViewed === false,
                        );
                        return (
                            <button
                                key={group.key}
                                type="button"
                                onClick={() => setOpenGroupKey(group.key)}
                                className={styles.item}
                            >
                                <span className={hasUnviewed ? styles.ring : styles.ringViewed}>
                                    <span className={styles.inner}>
                                        {cover ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={cover}
                                                alt={group.author.fullName}
                                                className={styles.image}
                                            />
                                        ) : (
                                            <span className={styles.placeholder}>
                                                {initial}
                                            </span>
                                        )}
                                    </span>
                                </span>
                                <span className={styles.label}>
                                    {group.author.fullName}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <StoryViewerModal
                isOpen={openGroup !== null}
                onClose={() => setOpenGroupKey(null)}
                stories={openGroup?.stories ?? []}
                isOwner={false}
                initialStoryIndex={openGroupInitialIndex}
            />
        </>
    );
}
