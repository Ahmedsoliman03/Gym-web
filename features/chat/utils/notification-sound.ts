const SRC = '/sounds/new-message.mp3';
// Don't let a burst of incoming messages stack overlapping dings.
const MIN_GAP_MS = 800;

let audio: HTMLAudioElement | null = null;
let lastPlayedAt = 0;

const getAudio = (): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;
    if (!audio) {
        audio = new Audio(SRC);
        audio.preload = 'auto';
        audio.volume = 0.5;
    }
    return audio;
};

export const playNewMessageSound = (): void => {
    const el = getAudio();
    if (!el) return;

    const now = Date.now();
    if (now - lastPlayedAt < MIN_GAP_MS) return;
    lastPlayedAt = now;

    try {
        el.currentTime = 0;
        void el.play().catch(() => {
            /* Autoplay can be blocked until the user interacts — ignore. */
        });
    } catch {
        /* Older Safari can throw synchronously on currentTime — ignore. */
    }
};
