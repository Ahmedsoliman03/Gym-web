"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Plus, ChevronRight, Maximize2 } from "lucide-react";
import toast from "react-hot-toast";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import type { EditableImage, GalleryEditorProps } from "@/features/profile/types";
import { useR2Upload } from "@/hooks/use-r2-upload";
import {
  applyUploadedGalleryPath,
  getEditableImagePreviewSource,
} from "../utils/uploaded-media";

const styles = {
  section: "space-y-8 pt-8 border-t border-white/5",
  sectionTitle: "text-sm font-black text-primary uppercase mb-6",

  grid: "flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 no-scrollbar snap-x scroll-smooth",
  card: "min-w-[200px] md:min-w-[240px] bg-white/5 rounded-2xl border border-white/5 p-3 snap-start relative group",
  image: "w-full aspect-square rounded-xl bg-black/20 overflow-hidden relative border border-white/5 flex items-center justify-center group/img",
  imageOverlay: "absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-[2px]",
  deleteBtn: "absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10 shadow-xl",
  addBtn: "min-w-[200px] md:min-w-[240px] aspect-square flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/5 rounded-2xl text-foreground/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group active:scale-95",
};

export const GalleryEditor = ({
  images,
  onChange,
  onUploadingChange,
  title,
}: GalleryEditorProps) => {
  const t = useTranslations("Profile");
  const sliderRef = useRef<HTMLDivElement>(null);
  const { uploadFile } = useR2Upload();
  const [uploadingIndexes, setUploadingIndexes] = useState<Record<number, number>>({});
  const [failedIndexes, setFailedIndexes] = useState<Record<number, true>>({});
  const [batchUploading, setBatchUploading] = useState(false);

  useEffect(() => {
    onUploadingChange?.(
      batchUploading ||
      Object.keys(uploadingIndexes).length > 0 ||
      Object.keys(failedIndexes).length > 0,
    );
  }, [batchUploading, failedIndexes, onUploadingChange, uploadingIndexes]);

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    index: 0
  });

  const previews = useMemo(
    () => images.map((image) => getEditableImagePreviewSource(image)),
    [images],
  );
  useEffect(() => {
    return () => {
      previews.forEach((src) => {
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      });
    };
  }, [previews]);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const startIdx = images.length;
    // Add placeholders first so the user sees a preview immediately
    const placeholders: EditableImage[] = Array.from(files).map((file) => ({ file }));
    let current = [...images, ...placeholders];
    onChange(current);
    e.target.value = '';

    setBatchUploading(true);
    try {
      // Upload each file and replace the placeholder with the URL string
      for (let i = 0; i < placeholders.length; i++) {
        const absIdx = startIdx + i;
        setUploadingIndexes((prev) => ({ ...prev, [absIdx]: 0 }));
        try {
          const path = await uploadFile(placeholders[i].file!, 'gym_photo', (percent) =>
            setUploadingIndexes((prev) => ({ ...prev, [absIdx]: percent }))
          );
          current = applyUploadedGalleryPath(current, absIdx, path);
          onChange(current);
        } catch (err) {
          setFailedIndexes((prev) => ({ ...prev, [absIdx]: true }));
          toast.error('Upload failed');
        } finally {
          setUploadingIndexes((prev) => {
            const copy = { ...prev };
            delete copy[absIdx];
            return copy;
          });
        }
      }
    } finally {
      setBatchUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    setFailedIndexes((prev) => Object.fromEntries(
      Object.keys(prev)
        .map(Number)
        .filter((failedIndex) => failedIndex !== index)
        .map((failedIndex) => [failedIndex > index ? failedIndex - 1 : failedIndex, true]),
    ));
    onChange(images.filter((_, i) => i !== index));
  };

  const openLightbox = (index: number) => {
    setLightbox({ isOpen: true, index });
  };

  return (
    <div className={styles.section}>
      <div className="flex items-center justify-between">
        <h2 className={styles.sectionTitle}>{title || t('facilityGallery')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-white/5 rounded-full text-foreground/40 hover:text-foreground transition-colors border border-white/5"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-white/5 rounded-full text-foreground/40 hover:text-foreground transition-colors border border-white/5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={sliderRef} className={styles.grid}>
        {images.map((img, idx) => (
          <div key={img.id ?? `new-${idx}`} className={styles.card}>
            <button
              onClick={() => handleRemove(idx)}
              className={styles.deleteBtn}
            >
              <X size={16} />
            </button>

            <div className={styles.image} onClick={() => !uploadingIndexes[idx] && openLightbox(idx)}>
              <img src={previews[idx]} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
              {uploadingIndexes[idx] !== undefined ? (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-10">
                  <div className="w-10 h-10 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-white text-xs font-bold">{uploadingIndexes[idx]}%</span>
                </div>
              ) : (
                <div className={styles.imageOverlay}>
                  <Maximize2 className="text-white" size={24} />
                </div>
              )}
            </div>
          </div>
        ))}

        <label className={styles.addBtn}>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAdd}
          />
          <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
            <Plus className="text-primary" size={24} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">{t('uploadPhotos')}</span>
        </label>
      </div>

      <ImageLightbox
        isOpen={lightbox.isOpen}
        currentIndex={lightbox.index}
        images={previews}
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
