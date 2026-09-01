'use client';

import { Maximize2 } from 'lucide-react';

interface CommunityPostMediaProps {
  file: string;
  mediaType: 'image' | 'video';
  className: string;
  onOpen: () => void;
}

export function CommunityPostMedia({
  file,
  mediaType,
  className,
  onOpen,
}: CommunityPostMediaProps) {
  if (mediaType === 'video') {
    return (
      <button type="button" className="relative w-full h-full" onClick={onOpen}>
        <video src={file} className={className} muted autoPlay loop playsInline preload="auto" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/10">
          <Maximize2 className="text-white drop-shadow-lg" size={28} />
        </span>
      </button>
    );
  }

  return (
    <button type="button" className="w-full h-full" onClick={onOpen}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={file} alt="" className={className} />
    </button>
  );
}
