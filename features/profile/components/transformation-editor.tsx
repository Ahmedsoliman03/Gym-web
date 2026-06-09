"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, X, Plus, ChevronRight, Maximize2 } from "lucide-react";
import { ImageLightbox } from "@/components/shared/image-lightbox";
import type { TransformationEditorProps, TransformationItem } from "../types";

const styles = {
  section: "space-y-8 pt-8 border-t border-white/5",
  sectionTitle: "text-sm font-black text-primary uppercase mb-6",
  
  transGrid: "flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 no-scrollbar snap-x scroll-smooth",
  transCard: "min-w-[280px] md:min-w-[320px] bg-white/5 rounded-2xl border border-white/5 p-4 space-y-4 snap-start relative group",
  transImage: "w-full aspect-[4/3] rounded-xl bg-black/20 overflow-hidden relative border border-white/5 flex items-center justify-center group/img",
  transImageOverlay: "absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-[2px]",
  transDelete: "absolute top-6 right-6 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10 shadow-xl",
  addTransBtn: "min-w-[280px] md:min-w-[320px] aspect-[4/3] md:aspect-auto md:h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/5 rounded-2xl text-foreground/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group active:scale-95 py-2",
  
  inputWrapper: "flex flex-col gap-2",
  label: "text-xs font-black text-foreground/40 uppercase ml-1",
  input: "bg-white/5 py-2.5 border border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:border-primary/50 transition-colors text-base",
  imagePreviewActions: "absolute top-4 right-4 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-all z-20",
  previewBtn: "p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-white/20 transition-all",
};

/** Resolve a preview URL for a transformation row: keep server URLs as-is,
 *  build a temporary blob URL for freshly picked Files. */
const previewSrc = (image: string | File): string => {
  if (!image) return '';
  if (image instanceof File) return URL.createObjectURL(image);
  return image;
};

export const TransformationEditor = ({
  transformations,
  onChange,
}: TransformationEditorProps) => {
  const t = useTranslations("Profile");
  const sliderRef = useRef<HTMLDivElement>(null);

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    index: 0
  });

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAdd = () => {
    // `temp_` prefix lets the server-side builder tell new rows from rows
    // it already has on file. Existing rows keep their real id.
    const newItem: TransformationItem = {
      id: `temp_${Math.random().toString(36).slice(2, 11)}`,
      name: "",
      duration: "",
      image: ""
    };
    onChange([...transformations, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(transformations.filter(item => item.id !== id));
  };

  const handleUpdate = (
    id: string,
    field: keyof TransformationItem,
    value: string | File,
  ) => {
    onChange(transformations.map(item =>
      item.id === id ? { ...item, [field]: value } as TransformationItem : item
    ));
  };

  const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpdate(id, 'image', file);
      // Allow re-picking the same file by resetting the input value.
      e.target.value = '';
    }
  };

  const openLightbox = (index: number) => {
    setLightbox({ isOpen: true, index });
  };

  // Memoize previews so blob URLs created for picked Files can be cleaned up
  // when the list changes.
  const previews = useMemo(
    () => transformations.map((tr) => previewSrc(tr.image)),
    [transformations],
  );
  useEffect(() => {
    return () => {
      previews.forEach((src) => {
        if (src.startsWith('blob:')) URL.revokeObjectURL(src);
      });
    };
  }, [previews]);

  const validImages = previews.filter(Boolean);

  return (
    <div className={styles.section}>
      <div className="flex items-center justify-between">
        <h2 className={styles.sectionTitle}>{t('transformationGallery')}</h2>
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

      <div ref={sliderRef} className={styles.transGrid}>
        {transformations.map((item, idx) => (
          <div key={item.id} className={styles.transCard}>
            <button
              onClick={() => handleRemove(item.id)}
              className={styles.transDelete}
            >
              <X size={16} />
            </button>

            <div className={styles.transImage}>
              {item.image ? (
                <>
                  <img src={previews[idx]} alt="Transformation" className="w-full h-full object-cover" />
                  <div className={styles.imagePreviewActions}>
                    <button
                      onClick={() => openLightbox(idx)}
                      className={styles.previewBtn}
                    >
                      <Maximize2 size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-foreground/20">
                  <Camera size={24} />
                  <span className="text-[10px] font-black uppercase">{t('noImage')}</span>
                </div>
              )}
              <label className={styles.transImageOverlay}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(item.id, e)}
                />
                <Camera className="text-white" size={24} />
              </label>
            </div>

            <div className="space-y-4">
              <div className={styles.inputWrapper}>
                <label className={styles.label}>{t('fullName')}</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={item.name}
                  onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>{t('transformationDuration')}</label>
                <input
                  type="text"
                  placeholder="8 years"
                  value={item.duration}
                  onChange={(e) => handleUpdate(item.id, 'duration', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAdd}
          className={styles.addTransBtn}
        >
          <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
            <Plus className="text-primary" size={24} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">{t('addNew')}</span>
        </button>
      </div>

      <ImageLightbox 
        isOpen={lightbox.isOpen}
        currentIndex={lightbox.index}
        images={validImages}
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

