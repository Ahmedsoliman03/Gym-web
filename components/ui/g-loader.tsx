'use client';

import { Dumbbell } from 'lucide-react';

/**
 * GymSpot brand loader.
 *
 * A dumbbell sits inside a dark tile, lifting up-and-down on a rep cadence
 * while a conic-gradient ring orbits around it. The result reads as "loading
 * = working out" rather than as a generic spinner.
 *
 * `size` controls the tile diameter; ring + label scale off it.
 * `fullScreen` renders the loader centered over a full-viewport backdrop
 * so it can drop straight into a route-level loading.tsx file.
 */
interface GLoaderProps {
    size?: number;
    label?: string;
    fullScreen?: boolean;
    className?: string;
}

export function GLoader({
    size = 72,
    label,
    fullScreen = false,
    className = '',
}: GLoaderProps) {
    const ring = size + 18;
    const iconSize = Math.round(size * 0.55);

    const loader = (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            <div
                className="relative flex items-center justify-center"
                style={{ width: ring, height: ring }}
            >
                {/* Rotating conic ring — the "spinner" element */}
                <span
                    aria-hidden
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                        background:
                            'conic-gradient(from 0deg, transparent 0deg, transparent 200deg, #22C55E 320deg, #22C55E 360deg)',
                        animationDuration: '1.4s',
                    }}
                />
                {/* Inner cutout — sits between the ring and the tile */}
                <span
                    aria-hidden
                    className="absolute rounded-full bg-background"
                    style={{ width: ring - 6, height: ring - 6 }}
                />
                {/* Dumbbell tile — does reps */}
                <span
                    className="relative rounded-2xl bg-surface border border-primary/20 text-primary shadow-lg shadow-primary/20 flex items-center justify-center animate-rep-press"
                    style={{
                        width: size,
                        height: size,
                    }}
                >
                    <Dumbbell
                        size={iconSize}
                        strokeWidth={2.5}
                        className="-rotate-45"
                    />
                </span>
                {/* Motion sparks — short tick marks above/below to sell the lift */}
                <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 animate-spark-up"
                    style={{
                        top: -8,
                        width: 2,
                        height: 8,
                        background: '#22C55E',
                        borderRadius: 2,
                        opacity: 0,
                    }}
                />
                <span
                    aria-hidden
                    className="absolute left-1/2 -translate-x-1/2 animate-spark-down"
                    style={{
                        bottom: -8,
                        width: 2,
                        height: 8,
                        background: '#22C55E',
                        borderRadius: 2,
                        opacity: 0,
                    }}
                />
            </div>

            {label && (
                <span className="mt-4 text-[11px] font-black uppercase tracking-[0.25em] text-foreground/60">
                    {label}
                </span>
            )}

            <style jsx global>{`
                @keyframes rep-press {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                        filter: drop-shadow(0 0 0 rgba(34, 197, 94, 0));
                    }
                    50% {
                        transform: translateY(-6px) scale(1.04);
                        filter: drop-shadow(0 0 14px rgba(34, 197, 94, 0.5));
                    }
                }
                @keyframes spark-up {
                    0%, 100% { opacity: 0; transform: translate(-50%, 4px); }
                    50%      { opacity: 1; transform: translate(-50%, -2px); }
                }
                @keyframes spark-down {
                    0%, 100% { opacity: 0; transform: translate(-50%, -4px); }
                    50%      { opacity: 1; transform: translate(-50%, 2px); }
                }
                .animate-rep-press {
                    animation: rep-press 1.4s ease-in-out infinite;
                }
                .animate-spark-up {
                    animation: spark-up 1.4s ease-in-out infinite;
                }
                .animate-spark-down {
                    animation: spark-down 1.4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );

    if (!fullScreen) return loader;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/85 backdrop-blur-sm">
            {loader}
        </div>
    );
}

/**
 * Section-level loader: centers the GymSpot loader inside a min-height block.
 * Use this as the loading state inside a page section instead of a fixed
 * overlay, e.g. while a list query is in flight.
 */
export function GLoaderSection({
    label,
    minHeight = 240,
    size,
}: {
    label?: string;
    minHeight?: number;
    size?: number;
}) {
    return (
        <div
            className="flex items-center justify-center w-full"
            style={{ minHeight }}
        >
            <GLoader size={size} label={label} />
        </div>
    );
}
