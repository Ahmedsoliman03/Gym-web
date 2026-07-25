'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PostMedia } from '../types';
import { CommunityMediaViewer } from './community-media-viewer';
import { CommunityPostMedia } from './community-post-media';

const styles = {
  wrapper: 'mt-2 relative',
  single: 'w-full aspect-video object-cover bg-black',
  rail: 'community-media-rail flex gap-3 overflow-x-auto px-4 sm:px-6 pb-3 snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto',
  slide: 'relative min-w-[calc((100%_-_0.75rem)/1.5)] aspect-video overflow-hidden rounded-xl bg-black snap-start',
  fill: 'w-full h-full object-cover bg-black',
};

export function CommunityMediaCarousel({ media }: { media: PostMedia[] }) {
  const t = useTranslations('Community');
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollTo = (index: number) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActiveIndex(index);
  };

  if (media.length === 1) return <>
    <div className={styles.wrapper}>
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        <CommunityPostMedia {...media[0]} className={styles.single} onOpen={() => setViewerIndex(0)} />
      </div>
    </div>
    {viewerIndex !== null && <CommunityMediaViewer media={media} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />}
  </>;

  return <div className={styles.wrapper}>
    <div className={styles.rail} onScroll={(event) => {
      const offsets = slideRefs.current.map((slide) => slide?.offsetLeft ?? 0);
      const left = Math.abs(event.currentTarget.scrollLeft);
      let nearest = 0;
      offsets.forEach((offset, index) => {
        if (Math.abs(offset - left) < Math.abs(offsets[nearest] - left)) nearest = index;
      });
      setActiveIndex(nearest);
    }}>
      {media.map((item, index) => <div key={item.id}
        ref={(node) => { slideRefs.current[index] = node; }} className={styles.slide}>
        <CommunityPostMedia {...item} className={styles.fill} onOpen={() => setViewerIndex(index)} />
    </div>)}
    </div>
    <div className="flex justify-center gap-1.5 pb-3">
      {media.map((item, index) => <button type="button" key={item.id} onClick={() => scrollTo(index)}
        aria-label={t('openMedia', { index: index + 1, count: media.length })}
        className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-5 bg-primary' : 'w-1.5 bg-foreground/20'}`} />)}
    </div>
    {viewerIndex !== null && <CommunityMediaViewer media={media} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />}
    <style jsx>{`
      .community-media-rail::-webkit-scrollbar { display: none; }
      .community-media-rail { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  </div>;
}
