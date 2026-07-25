'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PostMedia } from '../types';

interface CommunityMediaViewerProps {
  media: PostMedia[];
  initialIndex: number;
  onClose: () => void;
}

export function CommunityMediaViewer({ media, initialIndex, onClose }: CommunityMediaViewerProps) {
  const t = useTranslations('Community');
  const [index, setIndex] = useState(initialIndex);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pauseVideos = useCallback(() => {
    document.querySelectorAll<HTMLVideoElement>('[data-community-viewer] video').forEach((video) => video.pause());
  }, []);
  const move = useCallback((delta: number) => {
    pauseVideos();
    setIndex((current) => (current + delta + media.length) % media.length);
  }, [media.length, pauseVideos]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      pauseVideos();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [move, onClose, pauseVideos]);

  const current = media[index];
  return (
    <div data-community-viewer role="dialog" aria-modal="true" aria-label={t('closeMediaViewer')}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4"
      onPointerDown={(event) => { touchStart.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={(event) => {
        if (!touchStart.current) return;
        const dx = event.clientX - touchStart.current.x;
        const dy = event.clientY - touchStart.current.y;
        touchStart.current = null;
        if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}>
      <button type="button" onClick={onClose} autoFocus aria-label={t('closeMediaViewer')}
        className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20">
        <X size={22} />
      </button>
      {media.length > 1 && <ViewerArrows onPrevious={() => move(-1)} onNext={() => move(1)} />}
      <div className="max-w-[92vw] max-h-[86vh] flex items-center justify-center">
        {current.mediaType === 'video' ? (
          <video src={current.file} controls autoPlay playsInline className="max-w-full max-h-[82vh] rounded-xl" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.file} alt="" className="max-w-full max-h-[82vh] object-contain rounded-xl" />
        )}
      </div>
      <ViewerPosition media={media} index={index} onSelect={(next) => { pauseVideos(); setIndex(next); }} />
    </div>
  );
}

function ViewerArrows({ onPrevious, onNext }: { onPrevious: () => void; onNext: () => void }) {
  const t = useTranslations('Community');
  return <>
    <button type="button" onClick={onPrevious} aria-label={t('previousMedia')}
      className="absolute left-3 md:left-6 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20">
      <ChevronLeft size={28} />
    </button>
    <button type="button" onClick={onNext} aria-label={t('nextMedia')}
      className="absolute right-3 md:right-6 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20">
      <ChevronRight size={28} />
    </button>
  </>;
}

function ViewerPosition({ media, index, onSelect }: { media: PostMedia[]; index: number; onSelect: (index: number) => void }) {
  const t = useTranslations('Community');
  return <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
    <span className="text-white text-xs font-bold">{t('mediaPosition', { index: index + 1, count: media.length })}</span>
    {media.length > 1 && <div className="flex gap-1.5">{media.map((item, dotIndex) => (
      <button type="button" key={item.id} onClick={() => onSelect(dotIndex)}
        aria-label={t('openMedia', { index: dotIndex + 1, count: media.length })}
        className={`h-2 rounded-full transition-all ${dotIndex === index ? 'w-6 bg-primary' : 'w-2 bg-white/30'}`} />
    ))}</div>}
  </div>;
}
