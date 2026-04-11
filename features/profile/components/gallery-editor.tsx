"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { X, Plus, ChevronRight } from "lucide-react";

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

interface GalleryEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  title?: string;
}

export const GalleryEditor = ({
  images,
  onChange,
  title,
}: GalleryEditorProps) => {
  const t = useTranslations("Profile");
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange([...images, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
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
          <div key={idx} className={styles.card}>
            <button
              onClick={() => handleRemove(idx)}
              className={styles.deleteBtn}
            >
              <X size={16} />
            </button>

            <div className={styles.image}>
              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
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
