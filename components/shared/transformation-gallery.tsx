"use client";

import Image from "next/image";
import { ChevronRight, Maximize2 } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ImageLightbox } from "./image-lightbox";
import { EmptySection } from "./empty-section";

const styles = {
  container: "bg-surface p-8 rounded-3xl border border-white/5 overflow-hidden",
  header: "flex justify-between items-center mb-6 px-2",
  title: "text-xl font-bold text-foreground uppercase text-primary",
  controls: "flex gap-2",
  controlBtn: "p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-foreground/40 hover:text-foreground active:scale-95",
  galleryWrapper: "relative",
  scrollContainer: "flex gap-6 overflow-x-auto pb-4 px-2 no-scrollbar snap-x snap-mandatory scroll-smooth",
  itemWrapper: "group relative min-w-[280px] md:min-w-[400px] aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 snap-start shrink-0 cursor-pointer",
  itemImage: "object-cover transition-transform duration-700 group-hover:scale-105",
  itemOverlay: "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6",
  itemName: "text-foreground font-bold text-xl",
  itemDuration: "text-primary font-bold text-sm uppercase mt-1",
  indicatorWrapper: "flex justify-center gap-1.5 mt-2",
  indicator: (isActive: boolean) => `h-1 rounded-full transition-all duration-300 ${isActive ? 'w-6 bg-primary' : 'w-2 bg-white/10'}`,
  zoomIcon: "absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-white/40 group-hover:text-white group-hover:scale-110 transition-all opacity-0 group-hover:opacity-100",
};

interface Transformation {
  clientName: string;
  duration: string;
  image: string;
}

interface TransformationGalleryProps {
  transformations: Transformation[];
  title?: string;
  hideOverlay?: boolean;
  isOwner?: boolean;
  emptyVisitorMessage?: string;
  emptyOwnerMessage?: string;
}

export const TransformationGallery = ({
  transformations,
  title,
  hideOverlay = false,
  isOwner,
  emptyVisitorMessage,
  emptyOwnerMessage,
}: TransformationGalleryProps) => {
  const t = useTranslations("Profile");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    index: 0
  });

  const validTransformations = transformations.filter(item => item.image && item.image.trim() !== "");
  const allImages = validTransformations.map(t => t.image);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const openLightbox = (index: number) => {
    setLightbox({ isOpen: true, index });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {title || t('transformationGallery')}
        </h2>
        {validTransformations.length > 2 && (
          <div className={styles.controls}>
            <button
              onClick={() => scroll("left")}
              className={styles.controlBtn}
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <button
              onClick={() => scroll("right")}
              className={styles.controlBtn}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {validTransformations.length === 0 ? (
        <EmptySection
          isOwner={isOwner}
          visitorMessage={emptyVisitorMessage ?? t('noTransformationsYet')}
          ownerMessage={emptyOwnerMessage}
          variant="compact"
        />
      ) : (
      <div className={styles.galleryWrapper}>
        <div
          ref={scrollRef}
          className={styles.scrollContainer}
        >
          {validTransformations.map((item, index) => (
            <div
              key={index}
              className={styles.itemWrapper}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={item.image}
                alt={item.clientName || title || "Transformation"}
                fill
                className={styles.itemImage}
                unoptimized
              />
              <div className={styles.zoomIcon}>
                <Maximize2 size={18} />
              </div>
              {!hideOverlay && (
                <div className={styles.itemOverlay}>
                  <span className={styles.itemName}>{item.clientName}</span>
                  <span className={styles.itemDuration}>
                    {item.duration} {t('transformation')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      )}

      <ImageLightbox
        isOpen={lightbox.isOpen}
        currentIndex={lightbox.index}
        images={allImages}
        onClose={() => setLightbox(prev => ({ ...prev, isOpen: false }))}
      />

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

