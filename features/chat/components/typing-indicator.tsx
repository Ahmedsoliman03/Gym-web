'use client';

const dot = 'h-1.5 w-1.5 rounded-full bg-foreground/50 animate-bounce';

export const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-3.5 py-2.5">
            <span className={dot} style={{ animationDelay: '0ms' }} />
            <span className={dot} style={{ animationDelay: '150ms' }} />
            <span className={dot} style={{ animationDelay: '300ms' }} />
        </div>
    </div>
);
